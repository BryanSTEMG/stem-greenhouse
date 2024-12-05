// netlify/functions/createMondayTask.js

const axios = require('axios');
const FormData = require('form-data');

exports.handler = async (event) => {
  // Define allowed origins
  const allowedOrigins = [
    'https://stemgreenhouseapp.netlify.app',
    'https://www.stemgreenhouseapp.info',
    'http://localhost:3000',
    'http://localhost:8888',
  ];

  // Extract the Origin header from the request
  const origin = event.headers.origin;

  // Initialize headers with common CORS settings
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // If the request's origin is in the allowed list, set the Access-Control-Allow-Origin header
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = 'https://stemgreenhouseapp.netlify.app'; // Fallback to primary Netlify URL
  }

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Received OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: 'OK',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.error(`Method ${event.httpMethod} Not Allowed`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  }

  try {
    // Parse JSON body
    console.log('Parsing JSON body');
    const body = JSON.parse(event.body);
    const { formData, boardId, groupId, formType, fileContentBase64, fileName } = body;
    console.log('Parsed body:', body);

    if (!formData || !boardId || !groupId || !formType) {
      console.error('Missing required fields:', { formData, boardId, groupId, formType });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields.' }),
      };
    }

    // Validate required fields in formData
    const requiredFields = ['name', 'email', 'suppliesNeeded', 'quantity', 'neededBy'];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Validation failed: Missing fields:', missingFields);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Validation failed: Missing fields: ${missingFields.join(', ')}`,
        }),
      };
    }

    // Build the item name
    const itemName = `${formData.name} - ${formType} Order`;
    console.log('Item Name:', itemName);

    // Prepare the column values
    const columnValues = {
      person: {
        personsAndTeams: [
          {
            id: parseInt(process.env.MONDAY_ASSIGNEE_ID || '65908831', 10),
            kind: 'person',
          },
        ],
      },
      email__1: {
        email: formData.email,
        text: formData.email,
      },
      text1__1: formData.suppliesNeeded,
      numbers__1: formData.quantity,
      date4: { date: formData.neededBy },
      text3__1: formData.additionalInfo,
    };

    if (formData.supplyLink) {
      columnValues.link__1 = {
        url: formData.supplyLink,
        text: formData.supplyLink,
      };
    }

    // Convert columnValues to JSON string
    const columnValuesStr = JSON.stringify(columnValues);
    console.log('Column Values:', columnValuesStr);

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

    // Log the variables being sent to Monday.com
    console.log('Sending variables to Monday.com:', variables);

    // Make the request to create the item
    const response = await axios.post(
      'https://api.monday.com/v2',
      {
        query: createItemMutation,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.MONDAY_API_TOKEN,
        },
      }
    );

    // Log the response from Monday.com
    console.log('Response from Monday.com:', response.data);

    if (response.data.errors) {
      console.error('Error creating item on Monday.com:', response.data.errors);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to create task on Monday.com.',
          details: response.data.errors,
        }),
      };
    }

    const newItemId = response.data.data.create_item.id;
    console.log('New Item ID:', newItemId);

    // If there's a file, upload it to the 'files__1' column
    if (fileContentBase64 && fileName) {
      console.log('Uploading file to Monday.com');
      const addFileMutation = `
        mutation ($file: File!) {
          add_file_to_column (
            file: $file,
            item_id: "${newItemId}",
            column_id: "files__1",
            board_id: "${boardId}"
          ) {
            id
          }
        }
      `;

      const formDataFile = new FormData();
      formDataFile.append('query', addFileMutation);
      formDataFile.append(
        'variables[file]',
        Buffer.from(fileContentBase64, 'base64'),
        fileName
      );

      // Log the file upload attempt
      console.log('Uploading file:', fileName);

      const fileUploadResponse = await axios.post(
        'https://api.monday.com/v2/file',
        formDataFile,
        {
          headers: {
            Authorization: process.env.MONDAY_API_TOKEN,
            ...formDataFile.getHeaders(),
          },
        }
      );

      // Log the file upload response
      console.log('File upload response:', fileUploadResponse.data);

      if (fileUploadResponse.data.errors) {
        console.error('Error uploading file to Monday.com:', fileUploadResponse.data.errors);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to upload file to Monday.com.',
            details: fileUploadResponse.data.errors,
          }),
        };
      }
    }

    console.log('Task created successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Task created successfully' }),
    };
  } catch (error) {
    console.error('Error in createMondayTask.js:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create task', details: error.message }),
    };
  }
};
