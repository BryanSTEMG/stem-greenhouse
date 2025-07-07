# aws_lambda_functions/lambda_function.py

import json
import os
import base64
import requests

def lambda_handler(event, context):
    print("=== Lambda Handler Invoked ===")
    try:
        body     = json.loads(event.get('body', '{}'))
        formData = body.get('formData', {})
        boardId  = body.get('boardId')
        groupId  = body.get('groupId')
        formType = body.get('formType')    # 'Supply' or 'Copy'
        fileB64  = body.get('fileContentBase64')
        fileName = body.get('fileName')

        # ── Determine which “lines” to process ────────────────────────────────────
        if formType == 'Supply':
            # expect an array of supplies under formData['supplyLines']
            supplies = formData.get('supplyLines') or []
            # fallback to single-line payload
            if not supplies:
                supplies = [{
                    'suppliesNeeded': formData.get('suppliesNeeded'),
                    'quantity':       formData.get('quantity'),
                    'neededBy':       formData.get('neededBy'),
                    'supplyLink':     formData.get('supplyLink'),
                }]
        else:
            # for Copy, just do one pass
            supplies = [ {} ]

        created_ids = []

        # ── Loop through each supply‐line or just once for Copy ─────────────────
        for line in supplies:
            # Build a per-line payload by merging globals + this line
            payload = {
                'name':              formData.get('name'),
                'email':             formData.get('email'),
                'school':            formData.get('school'),
                'additionalInfo':    formData.get('additionalInfo', ''),
                # copy‐only:
                'blackWhiteOk':      formData.get('blackWhiteOk'),
                # per‑line:
                'suppliesNeeded':    line.get('suppliesNeeded'),
                'quantity':          line.get('quantity'),
                'neededBy':          line.get('neededBy'),
                'supplyLink':        line.get('supplyLink'),
            }

            # ── Validation ─────────────────────────────────────
            base_req  = ['name','email','quantity','neededBy','school']
            type_spec = [] if formType=='Copy' else ['suppliesNeeded']
            missing   = [k for k in base_req + type_spec if not payload.get(k)]
            if missing:
                return _resp(400, {
                    'error': f"Missing required fields: {', '.join(missing)}"
                })

            # ── Build columnValues ────────────────────────────
            columnValues = {}

            # 1) Assign both Mia & Grace
            mia   = int(os.environ['MONDAY_MIA_ID'])
            grace = int(os.environ['MONDAY_GRACE_ID'])
            columnValues['person'] = {
                "personsAndTeams": [
                    {"id": mia,   "kind": "person"},
                    {"id": grace, "kind": "person"}
                ]
            }

            # 2) Shared fields
            columnValues['email__1']   = {"email": payload['email'], "text": payload['email']}
            columnValues['date4']      = {"date": payload['neededBy']}
            columnValues['numbers__1'] = payload['quantity']
            columnValues['text3__1']   = payload.get('additionalInfo','')

            # 3) Supplies (only supply)
            if formType=='Supply':
                columnValues['text1__1'] = payload['suppliesNeeded']

            # 4) Link
            if payload.get('supplyLink'):
                columnValues['link__1'] = {
                    "url":  payload['supplyLink'],
                    "text": payload['supplyLink']
                }

            # 5) School column
            school_col = (
                os.environ['MONDAY_COPY_SCHOOL_COLUMN_ID']
                if formType=='Copy'
                else os.environ['MONDAY_SCHOOL_COLUMN_ID']
            )
            columnValues[school_col] = {"label": payload['school']}

            # 6) B&W (copy only)
            if formType=='Copy':
                bw_col = os.environ['MONDAY_BW_COLUMN_ID']
                label  = "Yes" if payload.get('blackWhiteOk') else "No"
                columnValues[bw_col] = {"label": label}

            # ── create_item ────────────────────────────────────
            create_query = """
            mutation (
              $boardId: ID!, 
              $groupId: String!, 
              $itemName: String!, 
              $columnValues: JSON!
            ) {
              create_item(
                board_id: $boardId,
                group_id: $groupId,
                item_name: $itemName,
                column_values: $columnValues
              ) { id }
            }
            """
            vars_main = {
                "boardId": str(boardId),
                "groupId": groupId,
                "itemName": f"{payload['name']} - {formType} Order",
                "columnValues": json.dumps(columnValues)
            }
            data      = _graphql(create_query, vars_main)
            newItemId = data['data']['create_item']['id']
            print("New Item ID:", newItemId)
            created_ids.append(newItemId)

            # ── Supply only: create “Check Inventory” subitem ───
            if formType=='Supply':
                subitem_query = """
                mutation (
                  $parent_item_id: ID!, 
                  $item_name: String!, 
                  $column_values: JSON!
                ) {
                  create_subitem(
                    parent_item_id: $parent_item_id, 
                    item_name: $item_name, 
                    column_values: $column_values
                  ) { id }
                }
                """
                subitem_cols = {
                    "person": {
                      "personsAndTeams":[{"id": grace, "kind":"person"}]
                    }
                }
                vars_sub = {
                    "parent_item_id": str(newItemId),
                    "item_name":      "Check Inventory",
                    "column_values":  json.dumps(subitem_cols)
                }
                subdata = _graphql(subitem_query, vars_sub)
                print("Subitem ID:", subdata['data']['create_subitem']['id'])

            # ── file upload (unchanged) ────────────────────────
            if fileB64 and fileName:
                file_bytes   = base64.b64decode(fileB64)
                upload_query = """
                mutation ($file: File!, $itemId: ID!, $columnId: String!) {
                  add_file_to_column(
                    file: $file, 
                    item_id: $itemId, 
                    column_id: $columnId
                  ) { id }
                }
                """
                files = {
                  'query':     (None, upload_query),
                  'variables': (None, json.dumps({
                    "file":     None,
                    "itemId":   str(newItemId),
                    "columnId": "files__1"
                  })),
                  'map':       (None, json.dumps({"0":["variables.file"]})),
                  '0':         (fileName, file_bytes)
                }
                resp = requests.post(
                  "https://api.monday.com/v2/file",
                  files=files,
                  headers={"Authorization": os.environ['MONDAY_API_TOKEN']}
                )
                print("File Upload:", resp.status_code, resp.text)
                if resp.status_code!=200 or resp.json().get('errors'):
                    raise RuntimeError(f"File upload error: {resp.text}")

        # ── All done ───────────────────────────────────────
        return _resp(200, {
            'message': 'Tasks created successfully',
            'itemIds': created_ids
        })

    except Exception as e:
        print("Exception:", e)
        return _resp(500, {
            'error': 'Internal Server Error',
            'details': str(e)
        })


# ── Helpers ───────────────────────────────────────────

def _graphql(query, variables):
    resp = requests.post(
        "https://api.monday.com/v2",
        json={"query":query,"variables":variables},
        headers={
          "Authorization": os.environ['MONDAY_API_TOKEN'],
          "Content-Type":  "application/json"
        }
    )
    data = resp.json()
    if resp.status_code!=200 or data.get('errors'):
        raise RuntimeError(f"Monday API error: {data}")
    return data

def _resp(status, body):
    return {
      'statusCode': status,
      'headers': {
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*'
      },
      'body': json.dumps(body)
    }
