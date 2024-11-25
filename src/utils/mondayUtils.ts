// src/utils/mondayUtils.ts

import axios from 'axios';

const MONDAY_API_TOKEN = process.env.REACT_APP_MONDAY_API_TOKEN;

interface CreateMondayTaskParams {
  requestId: string;
  formData: any;
  boardId: string;
  groupId: string;
  formType: string;
  file?: File;
}

export async function createMondayTask(params: CreateMondayTaskParams): Promise<void> {
  const { requestId, formData, boardId, groupId, formType, file } = params;

  // Build the item name
  const itemName = `${formData.name} - ${formType} Order`;

  // Prepare the column values
  const assigneeId = parseInt(process.env.REACT_APP_MONDAY_ASSIGNEE_ID || '65908831', 10);
  const columnValues: any = {};

  // Set the 'person' column
  columnValues['person'] = { 'personsAndTeams': [{ 'id': assigneeId, 'kind': 'person' }] };

  // Set other columns based on the formData
  columnValues['email__1'] = { 'email': formData.email, 'text': formData.email };
  columnValues['text1__1'] = formData.suppliesNeeded;
  columnValues['numbers__1'] = formData.quantity;
  columnValues['date4'] = { 'date': formData.neededBy };
  if (formData.supplyLink) {
    columnValues['link__1'] = { 'url': formData.supplyLink, 'text': formData.supplyLink };
  }
  columnValues['text3__1'] = formData.additionalInfo;

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
    boardId: parseInt(boardId),
    groupId: groupId,
    itemName: itemName,
    columnValues: columnValuesStr,
  };

  // Make the request to create the item
  try {
    const response = await axios.post(
      'https://api.monday.com/v2',
      {
        query: createItemMutation,
        variables: variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: MONDAY_API_TOKEN,
        },
      }
    );

    const newItemId = response.data.data.create_item.id;
    console.log('Item created in Monday.com with ID:', newItemId);

    // If there's a file, upload it to the 'files__1' column
    if (file) {
      const addFileMutation = `
        mutation ($file: File!) {
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

      const variablesFile = { file: null };

      const formDataData = new FormData();
      formDataData.append('operations', JSON.stringify({ query: addFileMutation, variables: variablesFile }));
      formDataData.append('map', JSON.stringify({ '0': ['variables.file'] }));
      formDataData.append('0', file);

      const fileUploadResponse = await axios.post(
        'https://api.monday.com/v2/file',
        formDataData,
        {
          headers: {
            Authorization: MONDAY_API_TOKEN,
          },
        }
      );

      console.log('File uploaded to Monday.com:', fileUploadResponse.data);
    }
  } catch (error) {
    throw error;
  }
}
