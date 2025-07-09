# aws_lambda_functions/lambda_function.py

import json
import os
import base64
import requests


def lambda_handler(event, context):
    print("=== Lambda Handler Invoked ===")
    try:
        body = json.loads(event.get("body", "{}"))
        formData = body.get("formData", {})
        boardId = body.get("boardId")
        groupId = body.get("groupId")
        formType = body.get("formType")  # 'Supply' or 'Copy'
        fileB64 = body.get("fileContentBase64")
        fileName = body.get("fileName")

        # ── Build list of “lines” for Supply or Copy ─────────────────────────
        if formType == "Supply":
            supplies = formData.get("supplyLines") or []
            if not supplies:
                supplies = [{
                    "suppliesNeeded": formData.get("suppliesNeeded"),
                    "quantity":       formData.get("quantity"),
                    "neededBy":       formData.get("neededBy"),
                    "supplyLink":     formData.get("supplyLink"),
                    "additionalInfo": formData.get("additionalInfo", "")
                }]
            lines = supplies
        else:  # Copy
            copies = formData.get("copyLines") or []
            if not copies:
                copies = [{
                    "copyLink":     formData.get("copyLink"),
                    "blackWhiteOk": formData.get("blackWhiteOk"),
                    "quantity":     formData.get("quantity"),
                    "neededBy":     formData.get("neededBy"),
                    # no per-line additionalInfo for Copy
                }]
            lines = copies

        created_ids = []

        # ── Process each line ───────────────────────────────────────────────
        for line in lines:
            # merge globals + this line
            payload = {
                "name":           formData.get("name"),
                "email":          formData.get("email"),
                "school":         formData.get("school"),
                "additionalInfo": formData.get("additionalInfo", ""),
                # copy-only:
                "blackWhiteOk":   (line.get("blackWhiteOk")
                                   if formType == "Copy"
                                   else None),
                # per-line:
                "suppliesNeeded": (line.get("suppliesNeeded")
                                   if formType == "Supply"
                                   else None),
                "quantity":       line.get("quantity"),
                "neededBy":       line.get("neededBy"),
                "supplyLink":     (line.get("supplyLink")
                                   if formType == "Supply"
                                   else line.get("copyLink")),
            }

            # ── Validation ─────────────────────────────────────
            base_req = ["name", "email", "quantity", "neededBy", "school"]
            type_spec = ([] if formType == "Copy"
                         else ["suppliesNeeded"])
            missing = [k for k in base_req + type_spec
                       if not payload.get(k)]
            if missing:
                return _resp(400, {
                    "error": f"Missing required fields: {', '.join(missing)}"
                })

            # ── Build columnValues ────────────────────────────
            columnValues = {}

            # 1) Persons
            mia = int(os.environ["MONDAY_MIA_ID"])
            grace = int(os.environ["MONDAY_GRACE_ID"])
            columnValues["person"] = {
                "personsAndTeams": [
                    {"id": mia,   "kind": "person"},
                    {"id": grace, "kind": "person"}
                ]
            }

            # 2) Shared columns
            columnValues["email__1"] = {
                "email": payload["email"],
                "text": payload["email"]
            }
            columnValues["date4"] = {"date": payload["neededBy"]}
            columnValues["numbers__1"] = payload["quantity"]
            columnValues["text3__1"] = payload.get("additionalInfo", "")

            # 3) Supply vs. Copy specifics
            if formType == "Supply":
                columnValues["text1__1"] = payload["suppliesNeeded"]
            else:
                # Copy: add B&W column
                bw_col = os.environ["MONDAY_BW_COLUMN_ID"]
                label = "Yes" if payload.get("blackWhiteOk") else "No"
                columnValues[bw_col] = {"label": label}

            # 4) Link (both Supply & Copy)
            if payload.get("supplyLink"):
                columnValues["link__1"] = {
                    "url": payload["supplyLink"],
                    "text": payload["supplyLink"]
                }

            # 5) School
            school_col = (os.environ["MONDAY_COPY_SCHOOL_COLUMN_ID"]
                          if formType == "Copy"
                          else os.environ["MONDAY_SCHOOL_COLUMN_ID"])
            columnValues[school_col] = {"label": payload["school"]}

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
                "boardId":      str(boardId),
                "groupId":      groupId,
                "itemName":     f"{payload['name']} - {formType} Order",
                "columnValues": json.dumps(columnValues)
            }
            data = _graphql(create_query, vars_main)
            newItemId = data["data"]["create_item"]["id"]
            created_ids.append(newItemId)

            # ── Supply only: subitem ──────────────────────────
            if formType == "Supply":
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
                      "personsAndTeams": [{"id": grace, "kind": "person"}]
                    }
                }
                vars_sub = {
                    "parent_item_id": str(newItemId),
                    "item_name":      "Check Inventory",
                    "column_values":  json.dumps(subitem_cols)
                }
                _graphql(subitem_query, vars_sub)

            # ── file upload (both Copy & Supply) ──────────────
            if fileB64 and fileName:
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
                  "query":     (None, upload_query),
                  "variables": (None, json.dumps({
                      "file":   None,
                      "itemId": str(newItemId),
                      "columnId": "files__1"
                  })),
                  "map":       (None, json.dumps({"0": ["variables.file"]})),
                  "0":         (fileName, base64.b64decode(fileB64))
                }
                resp = requests.post(
                  "https://api.monday.com/v2/file",
                  files=files,
                  headers={"Authorization": os.environ["MONDAY_API_TOKEN"]}
                )
                if resp.status_code != 200 or resp.json().get("errors"):
                    raise RuntimeError(f"File upload error: {resp.text}")

        # ── Done ───────────────────────────────────────────
        return _resp(200, {
            "message": "Tasks created successfully",
            "itemIds": created_ids
        })

    except Exception as e:
        print("Exception:", e)
        return _resp(500, {
            "error": "Internal Server Error",
            "details": str(e)
        })


# ── Helpers ──────────────────────────────────────────

def _graphql(query, variables):
    resp = requests.post(
        "https://api.monday.com/v2",
        json={"query": query, "variables": variables},
        headers={
            "Authorization": os.environ["MONDAY_API_TOKEN"],
            "Content-Type":  "application/json"
        }
    )
    data = resp.json()
    if resp.status_code != 200 or data.get("errors"):
        raise RuntimeError(f"Monday API error: {data}")
    return data


def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type":                "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }
