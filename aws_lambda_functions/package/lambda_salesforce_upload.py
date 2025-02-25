import json
import base64
import logging
import os
import pandas as pd
from datetime import datetime
from simple_salesforce import Salesforce
# If you do want to import from a local config.py, uncomment the line below
# from config import SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN, SF_DOMAIN

# The next lines assume environment variables are set in AWS Lambda:
SF_USERNAME = os.environ.get('SF_USERNAME', '')
SF_PASSWORD = os.environ.get('SF_PASSWORD', '')
SF_SECURITY_TOKEN = os.environ.get('SF_SECURITY_TOKEN', '')
SF_DOMAIN = os.environ.get('SF_DOMAIN', 'login')  # "login" for production, "test" for sandbox

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def login_salesforce():
    """
    Authenticate to Salesforce via simple_salesforce and return the client.
    """
    sf = Salesforce(
        username=SF_USERNAME,
        password=SF_PASSWORD,
        security_token=SF_SECURITY_TOKEN,
        domain=SF_DOMAIN
    )
    logging.info("Logged into Salesforce successfully.")
    return sf

def parse_excel_date(raw_date_val):
    """
    Convert a Python datetime or Pandas Timestamp or user-friendly string
    into 'YYYY-MM-DD'.
    """
    import pandas as pd
    if pd.isnull(raw_date_val) or raw_date_val == "":
        return None

    if isinstance(raw_date_val, datetime):
        # just strip off the time portion and return YYYY-MM-DD
        return raw_date_val.strftime("%Y-%m-%d")

    if isinstance(raw_date_val, pd.Timestamp):
        return raw_date_val.strftime("%Y-%m-%d")

    if isinstance(raw_date_val, str):
        for fmt in ["%m/%d/%Y", "%Y-%m-%d", "%Y-%m-%d %H:%M:%S"]:
            try:
                dt = datetime.strptime(raw_date_val.strip(), fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                pass

    logging.warning(f"parse_excel_date: Could not parse => {raw_date_val}")
    return None

def calculate_cohort_year(grade_str, dob_str):
    """
    Calculate a student's high school graduation 'cohort date' (YYYY-MM-DD).
      - If we have DOB, assume graduation age 18 => (dob.year + 18)-06-01
      - If we have Grade, do (12 - grade) from current year => e.g. 2023 + (12 - 9) => 2026 => "2026-06-01"
      - If both are valid, pick whichever is earlier.
      - If none, return None.
    """
    grad_year_from_dob = None
    grad_year_from_grade = None

    if dob_str:
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d")
            grad_year_from_dob = dob.year + 18
        except ValueError:
            logging.warning(f"Could not parse DOB='{dob_str}' in calculate_cohort_year.")

    if grade_str:
        try:
            grade_int = int(grade_str)
            current_year = datetime.now().year
            years_until_grad = 12 - grade_int
            grad_year_from_grade = current_year + years_until_grad
        except ValueError:
            pass

    if grad_year_from_dob and grad_year_from_grade:
        final_year = min(grad_year_from_dob, grad_year_from_grade)
        return f"{final_year}-06-01"
    elif grad_year_from_dob:
        return f"{grad_year_from_dob}-06-01"
    elif grad_year_from_grade:
        return f"{grad_year_from_grade}-06-01"
    else:
        return None

def find_program_id(sf, program_id_value):
    """
    Query Program__c by Program_ID__c = program_id_value.
    Return the SF Id if found, else None.
    """
    soql = f"SELECT Id FROM Program__c WHERE Program_ID__c = '{program_id_value}' LIMIT 1"
    logging.info(f"Executing SOQL: {soql}")
    result = sf.query(soql)
    records = result.get('records', [])
    if records:
        program_id = records[0]['Id']
        logging.info(f"Found Program record for Program_ID__c='{program_id_value}' => {program_id}")
        return program_id
    else:
        logging.warning(f"No Program found for Program_ID__c='{program_id_value}'")
        return None

def find_or_create_student(sf, row_index, row):
    """
    If a Student with (First_Name__c, Last_Name__c, Date_of_Birth__c) exists, return that Id.
    Otherwise, create a new Student record.
    """
    first_name_val = str(row.get("Student First Name", "")).strip()
    last_name_val = str(row.get("Student Last Name", "")).strip()
    raw_dob = row.get("DOB", "")
    logging.info(f"[Row {row_index}] raw_dob from Excel => '{raw_dob}'")

    dob_val = parse_excel_date(raw_dob)
    logging.info(f"[Row {row_index}] After parse_excel_date => '{dob_val}'")

    logging.info(f"[Row {row_index}] Attempting to find/create Student: "
                 f"FirstName='{first_name_val}', LastName='{last_name_val}', DOB='{dob_val}'")

    soql = (
        f"SELECT Id FROM Student__c "
        f"WHERE First_Name__c = '{first_name_val}' "
        f"AND Last_Name__c = '{last_name_val}' "
    )
    if dob_val:
        soql += f"AND Date_of_Birth__c = {dob_val} LIMIT 1"
    else:
        soql += "LIMIT 1"

    result = sf.query(soql)
    if result['totalSize'] > 0:
        student_id = result['records'][0]['Id']
        logging.info(f"[Row {row_index}] Found existing Student Id: {student_id}")
        return student_id
    else:
        cohort_val = calculate_cohort_year(str(row.get("Grade", "")), dob_val)
        record = {
            "First_Name__c": first_name_val,
            "Last_Name__c": last_name_val,
            "Date_of_Birth__c": dob_val,
            "Teacher__c": str(row.get("Teacher", "")),
            "School__c": str(row.get("School", "")),
            "Grade__c": str(row.get("Grade", "")),
            "Race__c": str(row.get("Race", "")),
            "Gender__c": str(row.get("Gender", "")),
            "Free_Reduced_Lunch__c": (str(row.get("Free/Reduced Lunch?", "")).lower() == "yes"),
            "English_Language_Learner__c": (str(row.get("Is English your child's first language?", "")).lower() == "yes"),
            "Allergies__c": (str(row.get("Allergies", "")).lower() == "yes"),
            "If_Yes_Please_Specify__c": str(row.get("If yes, please specify", "")),
            "T_Shirt_Size__c": str(row.get("T-Shirt Size", "")),
            "Cohort_Year__c": cohort_val
        }
        logging.info(f"[Row {row_index}] Creating new Student => {record}")
        created = sf.Student__c.create(record)
        if created.get('success'):
            student_id = created['id']
            logging.info(f"[Row {row_index}] Created Student Id={student_id}")
            return student_id
        else:
            logging.error(f"[Row {row_index}] Failed to create Student => {created}")
            return None

def find_or_create_parent(sf, row_index, row):
    """
    If a Parent with (First_Name__c, Last_Name__c, Email__c) exists, return that Id.
    Otherwise, create a new Parent record.
    """
    first_name_val = str(row.get("Parent First Name", "")).strip()
    last_name_val = str(row.get("Parent Last Name", "")).strip()
    email_val = str(row.get("Email Address", "")).strip().lower()
    logging.info(f"[Row {row_index}] Attempting to find/create Parent => FirstName='{first_name_val}', "
                 f"LastName='{last_name_val}', Email='{email_val}'")

    soql = (
        f"SELECT Id FROM Parent__c "
        f"WHERE First_Name__c = '{first_name_val}' "
        f"AND Last_Name__c = '{last_name_val}' "
        f"AND Email__c = '{email_val}' LIMIT 1"
    )

    result = sf.query(soql)
    if result['totalSize'] > 0:
        parent_id = result['records'][0]['Id']
        logging.info(f"[Row {row_index}] Found existing Parent => Id={parent_id}")
        return parent_id
    else:
        raw_zip = str(row.get("Zipcode", ""))
        if raw_zip.endswith(".0"):
            raw_zip = raw_zip.replace(".0", "")

        record = {
            "First_Name__c": first_name_val,
            "Last_Name__c": last_name_val,
            "Email__c": email_val,
            "Address__c": str(row.get("Address", "")),
            "City__c": str(row.get("City", "")),
            "State__c": str(row.get("State", "")),
            "Zipcode__c": raw_zip,
            "Phone_Number__c": str(row.get("Parent Phone Number", "")),
            "Alternate_Phone_Number__c": str(row.get("Alt Phone Number", ""))
        }

        logging.info(f"[Row {row_index}] Creating new Parent => {record}")
        created = sf.Parent__c.create(record)
        if created.get('success'):
            parent_id = created['id']
            logging.info(f"[Row {row_index}] Created Parent => Id={parent_id}")
            return parent_id
        else:
            logging.error(f"[Row {row_index}] Failed to create Parent => {created}")
            return None

def create_application(sf, row_index, row, student_id, parent_id, program_id):
    """
    Create an Application record in Salesforce.
    """
    raw_dob = row.get("DOB", "")
    logging.info(f"[Row {row_index}] raw_dob for Application => '{raw_dob}'")
    dob_val = parse_excel_date(raw_dob)
    logging.info(f"[Row {row_index}] parsed dob_val for Application => '{dob_val}'")

    raw_zip_app = str(row.get("Zipcode", ""))
    if raw_zip_app.endswith(".0"):
        raw_zip_app = raw_zip_app.replace(".0", "")

    cohort_val = calculate_cohort_year(str(row.get("Grade", "")), dob_val)
    record = {
        "Program__c": program_id,
        "Student__c": student_id,
        "Parent__c": parent_id,
        "Student_First_Name__c": str(row.get("Student First Name", "")),
        "Student_Last_Name__c": str(row.get("Student Last Name", "")),
        "Grade__c": str(row.get("Grade", "")),
        "Teacher__c": str(row.get("Teacher", "")),
        "School__c": str(row.get("School", "")),
        "Date_of_Birth__c": dob_val,
        "Race__c": str(row.get("Race", "")),
        "Gender__c": str(row.get("Gender", "")),
        "Free_Reduced_Lunch__c": (str(row.get("Free/Reduced Lunch?", "")).lower() == "yes"),
        "Is_English_Your_Child_s_First_Language__c": (str(row.get("Is English your child's first language?", "")).lower() == "yes"),
        "Allergies__c": (str(row.get("Allergies", "")).lower() == "yes"),
        "If_Yes_Please_Specify__c": str(row.get("If yes, please specify", "")),
        "T_Shirt_Size__c": str(row.get("T-Shirt Size", "")),
        "Parent_Guardian_First_Name__c": str(row.get("Parent First Name", "")),
        "Parent_Guardian_Last_Name__c": str(row.get("Parent Last Name", "")),
        "Address__c": str(row.get("Address", "")),
        "City__c": str(row.get("City", "")),
        "State__c": str(row.get("State", "")),
        "Zip_Code__c": raw_zip_app,
        "Parent_Guardian_Phone_Number__c": str(row.get("Parent Phone Number", "")),
        "Alternate_Phone_Number__c": str(row.get("Alt Phone Number", "")),
        "Parent_Guardian_Email__c": str(row.get("Email Address", "")),
        "Liability_Release__c": (str(row.get("Liability Release", "")).lower() == "yes"),
        "Permission_Authorization__c": (str(row.get("Permission Authorization", "")).lower() == "yes"),
        "Field_Trips_Permission__c": (str(row.get("Field Trips Permission", "")).lower() == "yes"),
        "Photo_Release__c": (str(row.get("Photo Release", "")).lower() == "yes"),
        "Cohort_Year__c": cohort_val
    }

    logging.info(f"[Row {row_index}] Creating Application => {record}")
    created = sf.Application__c.create(record)
    if created.get('success'):
        app_id = created['id']
        logging.info(f"[Row {row_index}] Created Application => Id={app_id}")
    else:
        logging.error(f"[Row {row_index}] Failed to create Application => {created}")

def handler(event, context):
    """
    AWS Lambda entry point.
    The event payload should contain a base64-encoded Excel file under event['body']['fileBase64'].
    """
    logging.info("Lambda invoked for Salesforce Upload.")

    import pandas as pd  # Import again for clarity inside handler, though already done above

    # 1) Parse the incoming request
    # event['body'] is typically a JSON string if using API Gateway.
    try:
        body = json.loads(event['body'])
        excel_b64 = body['fileBase64']
        decoded_bytes = base64.b64decode(excel_b64)
    except Exception as e:
        logging.error(f"Failed to parse incoming file => {e}")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid file or request format."})
        }

    # 2) Write the Excel content to a temp file so pandas can read it
    temp_excel_path = "/tmp/applications.xlsx"
    with open(temp_excel_path, "wb") as f:
        f.write(decoded_bytes)

    # 3) Log in to Salesforce
    try:
        sf = login_salesforce()
    except Exception as e:
        logging.error(f"Salesforce login failed => {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Could not log in to Salesforce."})
        }

    # 4) Process the Excel rows
    try:
        df = pd.read_excel(temp_excel_path)
        df.fillna("", inplace=True)

        for i, row in df.iterrows():
            row_index = i + 1
            logging.info(f"=== Starting Row {row_index} ===")
            logging.info(f"Row {row_index} raw data => {row.to_dict()}")

            try:
                raw_program_id = row.get("Program ID", "")
                program_id_str = str(raw_program_id).strip()
                logging.info(f"[Row {row_index}] Program ID => '{program_id_str}'")

                program_id = find_program_id(sf, program_id_str)
                if not program_id:
                    logging.warning(f"[Row {row_index}] Program not found => skipping")
                    continue

                student_id = find_or_create_student(sf, row_index, row)
                if not student_id:
                    logging.warning(f"[Row {row_index}] Could not find/create Student => skipping app")
                    continue

                parent_id = find_or_create_parent(sf, row_index, row)
                if not parent_id:
                    logging.warning(f"[Row {row_index}] Could not find/create Parent => skipping app")
                    continue

                create_application(sf, row_index, row, student_id, parent_id, program_id)

            except Exception as sub_e:
                logging.error(f"[Row {row_index}] Unhandled error => {sub_e}")

        # If we get here, presumably the entire file was processed
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Upload to Salesforce successful!"})
        }

    except Exception as e:
        logging.error(f"Exception while processing Excel => {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
