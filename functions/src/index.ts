// functions/src/index.ts

import * as functions from "firebase-functions";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: true }));

// Initialize Multer for handling multipart/form-data
const upload = multer();

// Endpoint to handle task creation and file upload
app.post(
  "/createMondayTask",
  upload.single("file") as express.RequestHandler,
  async (req: MulterRequest, res: Response) => {
    try {
      const { formData, boardId, groupId, formType } = req.body;
      const file = req.file;

      // Retrieve environment variables
      const MONDAY_API_TOKEN = functions.config().monday.api_token;
      const assigneeId = parseInt(
        functions.config().monday.assignee_id || "65908831",
        10
      );

      // Parse formData JSON string
      const parsedFormData = JSON.parse(formData);

      // Build the item name
      const itemName = `${parsedFormData.name} - ${formType} Order`;

      // Prepare the column values
      const columnValues: Record<string, unknown> = {
        person: {
          personsAndTeams: [{ id: assigneeId, kind: "person" }],
        },
        email__1: {
          email: parsedFormData.email,
          text: parsedFormData.email,
        },
        text1__1: parsedFormData.suppliesNeeded,
        numbers__1: parsedFormData.quantity,
        date4: { date: parsedFormData.neededBy },
        text3__1: parsedFormData.additionalInfo,
      };

      if (parsedFormData.supplyLink) {
        columnValues.link__1 = {
          url: parsedFormData.supplyLink,
          text: parsedFormData.supplyLink,
        };
      }

      // Convert columnValues to JSON string
      const columnValuesStr = JSON.stringify(columnValues);

      // Prepare the mutation to create the item
      const createItemMutation = `
        mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
          create_item(
            board_id: $boardId,
            group_id: $groupId,
            item_name: $itemName,
            column_values: $columnValues
          ) {
            id
          }
        }
      `;

      // Set variables for the mutation
      const variables = {
        boardId: parseInt(boardId, 10),
        groupId,
        itemName,
        columnValues: columnValuesStr,
      };

      // Make the request to create the item
      const response = await axios.post(
        "https://api.monday.com/v2",
        {
          query: createItemMutation,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: MONDAY_API_TOKEN,
          },
        }
      );

      const newItemId = response.data.data.create_item.id;
      console.log("Item created in Monday.com with ID:", newItemId);

      // If there's a file, upload it to the 'files__1' column
      if (file) {
        const addFileMutation = `
          mutation addFile($file: File!) {
            add_file_to_column (
              file: $file,
              item_id: ${newItemId},
              column_id: "files__1",
              board_id: ${boardId}
            ) {
              id
            }
          }
        `;

        const formDataFile = new FormData();
        formDataFile.append("query", addFileMutation);
        formDataFile.append(
          "variables[file]",
          file.buffer,
          file.originalname
        );

        const fileUploadResponse = await axios.post(
          "https://api.monday.com/v2/file",
          formDataFile,
          {
            headers: {
              Authorization: MONDAY_API_TOKEN,
              ...formDataFile.getHeaders(),
            },
          }
        );

        console.log("File uploaded to Monday.com:", fileUploadResponse.data);
      }

      res.status(200).json({ message: "Task created successfully" });
    } catch (error) {
      console.error(
        "Error creating task in Monday.com:",
        (error as Error).message
      );
      res.status(500).json({ error: "Failed to create task" });
    }
  }
);

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
