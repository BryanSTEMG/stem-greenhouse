// netlify/functions/createMondayTask.js

const axios = require('axios');
const FormData = require('form-data');
const multipart = require('parse-multipart');

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
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    console.log('Content-Type:', contentType);

    let data = {};
    let fileContent = null;
    let fileName = null;
    let bodyBuffer;

    if (contentType && contentType.includes('multipart/form-data')) {
      // Parse multipart form data
      const boundary = multipart.getBoundary(contentType);
      console.log('Boundary:', boundary);
      if (!boundary) {
        console.error('Boundary not found in Content-Type header');
        throw new Error('Boundary not found in Content-Type header');
      }

      // Always decode body from base64
      bodyBuffer = Buffer.from(event.body, 'base64');
      console.log('Body Buffer Length:', bodyBuffer.length);

      const parts = multipart.Parse(bodyBuffer, boundary);
      console.log('Parsed Parts:', parts);

      parts.forEach((part) => {
        console.log('Processing part:', part.name);
        if (part.filename) {
          console.log('Found file:', part.filename);
          data.fileContent = part.data.toString('base64'); // Encode file content as base64
          data.fileName = part.filename;
        } else {
          data[part.name] = part.data.toString();
        }
      });
    } else {
      // Parse JSON body
      console.log('Parsing JSON body');
      bodyBuffer = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body, 'utf8');
      data = JSON.parse(bodyBuffer.toString());
      console.log('Parsed data:', data);
    }

    const { formData, boardId, groupId, formType } = data;
    fileContent = data.fileContent;
    fileName = data.fileName;

    console.log('Form Data:', formData);
    console.log('Board ID:', boardId);
    console.log('Group ID:', groupId);
    console.log('Form Type:', formType);

    if (!formData || !boardId || !groupId || !formType) {
      console.error('Missing required fields:', { formData, boardId, groupId, formType });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields.' }),
      };
    }

    const parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;
    console.log('Parsed Form Data:', parsedFormData);

    // Validate required fields in parsedFormData
    const requiredFields = ['name', 'email', 'suppliesNeeded', 'quantity', 'neededBy'];
    const missingFields = requiredFields.filter(field => !parsedFormData[field]);
    if (missingFields.length > 0) {
      console.error('Validation failed: Missing fields:', missingFields);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Validation failed: Missing fields: ${missingFields.join(', ')}` }),
      };
    }

    // Build the item name
    const itemName = `${parsedFormData.name} - ${formType} Order`;
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
    if (fileContent && fileName) {
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
        Buffer.from(fileContent, 'base64'),
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
