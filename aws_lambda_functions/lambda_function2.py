import base64
from io import BytesIO

from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from PIL import Image

def lambda_handler(event, context):
    """
    AWS Lambda entry point in Python.
    Expects event['images'] = array of base64-encoded images or PDF pages.
    Returns JSON with circle-based detection results + an Excel file in base64.
    """
    body = event.get("body")
    if not body:
        return create_response(400, {"message": "Missing request body"})

    try:
        parsed = json_loads(body)  # We'll define a helper for safe JSON parse
    except Exception as e:
        return create_response(400, {"message": f"Invalid JSON: {str(e)}"})

    images = parsed.get("images", [])
    if not images or not isinstance(images, list):
        return create_response(400, {"message": "No images provided"})

    # Generate our circle definitions
    circle_map = create_circle_map()
    all_results = []

    for base64_image in images:
        survey_response = {
            "questionResponses": {}
        }
        try:
            img_data = base64.b64decode(base64_image)
            # Use Pillow to open the image
            with Image.open(BytesIO(img_data)) as pil_image:
                pil_image = pil_image.convert("RGBA")  # Ensure 4-channel
                circle_scores = {}

                # For each bounding box
                for cdef in circle_map:
                    # Crop the sub-region
                    left = cdef["x"]
                    top = cdef["y"]
                    right = left + cdef["width"]
                    bottom = top + cdef["height"]

                    # Pillow crop box = (left, upper, right, lower)
                    region = pil_image.crop((left, top, right, bottom))

                    dark_count = 0
                    total_count = 0

                    # Pixel access
                    pixels = region.load()
                    w, h = region.size
                    for yy in range(h):
                        for xx in range(w):
                            r, g, b, a = pixels[xx, yy]
                            brightness = (r + g + b) / 3.0
                            if brightness < 128 and a > 50:
                                dark_count += 1
                            total_count += 1

                    darkness_ratio = dark_count / float(total_count)

                    qid = cdef["questionId"]
                    if qid not in circle_scores:
                        circle_scores[qid] = {"value": "", "darkness": 0.0}

                    if darkness_ratio > circle_scores[qid]["darkness"]:
                        circle_scores[qid]["value"] = cdef["choiceValue"]
                        circle_scores[qid]["darkness"] = darkness_ratio

                # threshold
                for qid, data in circle_scores.items():
                    if data["darkness"] > 0.2:
                        survey_response["questionResponses"][qid] = data["value"]
                    else:
                        survey_response["questionResponses"][qid] = ""

        except Exception as e:
            survey_response["error"] = str(e)

        all_results.append(survey_response)

    # Create an Excel from all_results
    excel_base64 = create_excel(all_results)

    return create_response(200, {
        "message": "Success",
        "data": all_results,
        "excelBase64": excel_base64
    })

def create_circle_map():
    """
    Generate 6 questions x 10 circles each, same idea as in TypeScript version.
    We'll return a list of dicts, each with x, y, width, height, etc.
    """
    questions = 6
    circles_per_question = 10

    start_x = 93
    start_y = 209
    circle_w = 4.15
    circle_h = 4.15
    spacing12 = 11.85
    spacing_others = 9.23
    question_vertical_shift = 7.11

    circle_map = []
    for qIndex in range(1, questions+1):
        question_y = start_y + (qIndex - 1) * question_vertical_shift
        x_so_far = start_x
        for cIndex in range(1, circles_per_question+1):
            circle_map.append({
                "questionId": f"Q{qIndex}",
                "choiceValue": str(cIndex),
                "x": int(x_so_far),
                "y": int(question_y),
                "width": circle_w,
                "height": circle_h
            })
            if cIndex == 1:
                x_so_far += spacing12
            else:
                x_so_far += spacing_others

    return circle_map

def create_excel(results):
    """
    Create an Excel from the results, return base64 string.
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "SurveyData"

    headers = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "error"]
    ws.append(headers)

    for r in results:
        row = []
        question_responses = r.get("questionResponses", {})
        row.append(question_responses.get("Q1", ""))
        row.append(question_responses.get("Q2", ""))
        row.append(question_responses.get("Q3", ""))
        row.append(question_responses.get("Q4", ""))
        row.append(question_responses.get("Q5", ""))
        row.append(question_responses.get("Q6", ""))
        row.append(r.get("error", ""))
        ws.append(row)

    # Save to BytesIO, then base64 encode
    from io import BytesIO
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    excel_bytes = output.read()
    import base64
    return base64.b64encode(excel_bytes).decode("utf-8")

def create_response(status_code, body):
    """
    Standard AWS Lambda proxy integration style response.
    IMPORTANT: We add CORS headers here for the browser to not block requests.
    """
    import json
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        },
        "body": json.dumps(body)
    }

def json_loads(raw):
    """
    Helper to parse JSON safely.
    Some environments pass event.body as a JSON string, 
    some pass directly as a dict. We'll handle both.
    """
    import json
    if isinstance(raw, str):
        return json.loads(raw)
    elif isinstance(raw, dict):
        return raw
    else:
        raise TypeError("Unsupported body type")
