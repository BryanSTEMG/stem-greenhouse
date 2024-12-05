import json
import os
import base64
import requests

def lambda_handler(event, context):
    # Rigorous logging
    print("=== Lambda Handler Invoked ===")
    print("Event:", event)
    print("Context:", context)

    try:
        # Parse the incoming JSON data
        body_str = event.get('body', '{}')
        print("Body String:", body_str)
        body = json.loads(body_str)
        print("Parsed Body:", body)

        formData = body.get('formData')
        boardId = body.get('boardId')
        groupId = body.get('groupId')
        formType = body.get('formType')
        fileContentBase64 = body.get('fileContentBase64')
        fileName = body.get('fileName')

        # Log extracted variables
        print("Form Data:", formData)
        print("Board ID:", boardId, "Type:", type(boardId))
        print("Group ID:", groupId)
        print("Form Type:", formType)
        print("File Name:", fileName)

        # Validate required fields
        required_fields = ['name', 'email', 'suppliesNeeded', 'quantity', 'neededBy']
        missing_fields = [field for field in required_fields if not formData.get(field)]
        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            print("Validation Error:", error_msg)
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': error_msg})
            }

        # Construct the item name
        itemName = f"{formData['name']} - {formType} Order"
        print("Item Name:", itemName)

        # Prepare the column values
        columnValues = {
            "person": {
                "personsAndTeams": [
                    {
                        "id": int(os.environ['MONDAY_ASSIGNEE_ID']),
                        "kind": "person"
                    }
                ]
            },
            "email__1": {
                "email": formData['email'],
                "text": formData['email']
            },
            "text1__1": formData['suppliesNeeded'],
            "numbers__1": formData['quantity'],
            "date4": {"date": formData['neededBy']},
            "text3__1": formData.get('additionalInfo', '')
        }

        if formData.get('supplyLink'):
            columnValues["link__1"] = {
                "url": formData['supplyLink'],
                "text": formData['supplyLink']
            }

        print("Column Values:", columnValues)

        # Update mutation to use ID! for boardId
        create_item_query = """
        mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
            create_item(
                board_id: $boardId,
                group_id: $groupId,
                item_name: $itemName,
                column_values: $columnValues
            ) {
                id
            }
        }
        """

        # Do not cast boardId to int, treat it as a string
        # If your REACT_APP_MONDAY_SUPPLY_BOARD_ID is a string, just use it as is.
        variables = {
            "boardId": str(boardId),  # Ensure boardId is a string
            "groupId": groupId,
            "itemName": itemName,
            "columnValues": json.dumps(columnValues)
        }

        print("GraphQL Variables:", variables)

        headers = {
            "Authorization": os.environ['MONDAY_API_TOKEN'],
            "Content-Type": "application/json"
        }
        print("Headers:", headers)

        response = requests.post(
            "https://api.monday.com/v2",
            json={"query": create_item_query, "variables": variables},
            headers=headers
        )

        print("Response Status Code:", response.status_code)
        print("Response Text:", response.text)

        if response.status_code != 200 or 'errors' in response.json():
            error_detail = response.json()
            print("Error creating item on Monday.com:", error_detail)
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to create task on Monday.com.',
                    'details': error_detail
                })
            }

        data = response.json()
        newItemId = data['data']['create_item']['id']
        print("New Item ID:", newItemId)

        # Handle file upload if provided
        if fileContentBase64 and fileName:
            print("Uploading file to Monday.com")
            upload_file_query = """
            mutation ($file: File!, $itemId: Int!, $columnId: String!, $boardId: Int!) {
                add_file_to_column (
                    file: $file,
                    item_id: $itemId,
                    column_id: $columnId,
                    board_id: $boardId
                ) {
                    id
                }
            }
            """

            file_bytes = base64.b64decode(fileContentBase64)

            # Log file details
            print("File Bytes Length:", len(file_bytes))

            upload_headers = {
                "Authorization": os.environ['MONDAY_API_TOKEN']
            }

            # Note: board_id for the file upload mutation might still need to be an Int.
            # According to Monday docs, file upload often still uses Int for board_id. 
            # If an error occurs here, adjust accordingly.
            files = {
                'operations': (None, json.dumps({
                    "query": upload_file_query,
                    "variables": {
                        "file": None,
                        "itemId": int(newItemId),
                        "columnId": "files__1",
                        "boardId": int(boardId)  # If this fails, try removing int()
                    }
                })),
                'map': (None, json.dumps({"0": ["variables.file"]})),
                '0': (fileName, file_bytes)
            }

            upload_response = requests.post(
                "https://api.monday.com/v2/file",
                files=files,
                headers=upload_headers
            )

            print("File Upload Status Code:", upload_response.status_code)
            print("File Upload Response Text:", upload_response.text)

            if upload_response.status_code != 200 or 'errors' in upload_response.json():
                error_detail = upload_response.json()
                print("Error uploading file to Monday.com:", error_detail)
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Failed to upload file to Monday.com.',
                        'details': error_detail
                    })
                }

        print("=== Task created successfully ===")
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Task created successfully'})
        }

    except Exception as e:
        print("Exception occurred:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal Server Error',
                'details': str(e)
            })
        }
