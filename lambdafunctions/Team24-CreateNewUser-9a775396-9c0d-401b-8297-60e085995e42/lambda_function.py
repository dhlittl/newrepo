import json
import mysql.connector

def lambda_handler(event, context):
    try:
        # Log the full event to see the incoming structure.
        print("Received event:", json.dumps(event))
        
        # If "body" exists, use it; otherwise, assume event is the payload.
        if "body" in event and event["body"]:
            # If body is a string, parse it.
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]
        else:
            body = event

        # Extract fields from the payload.
        username     = body.get('username')
        first_name   = body.get('firstName')
        last_name    = body.get('lastName')
        email        = body.get('email')
        phone_number = body.get('phone')
        account_type = body.get('accountType')
        cognito_sub  = body.get('cognitoSub', "")
        
        print(f"Parsed values - Username: {username}, Account Type: {account_type}")
        
        # Connect to the database.
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        print("Connected to RDS")
        
        cursor = cnx.cursor(dictionary=True)
        
        # Call the AddUser stored procedure.
        cursor.callproc('AddUser', (username, first_name, last_name, email, phone_number, cognito_sub))
        
        # Consume the result set from the stored procedure to retrieve the new User_ID.
        user_id = None
        for result in cursor.stored_results():
            row = result.fetchone()
            if row:
                user_id = row.get('User_ID')
                break
        
        if not user_id:
            raise Exception("Failed to retrieve User_ID from AddUser procedure.")
        
        print("User_ID retrieved:", user_id)
        
        # Call account-type-specific stored procedure if necessary.
        if account_type == "Admin":
            cursor.callproc('AddAdmin', (user_id,))
        elif account_type == "Sponsor":
            sponsor_org_id   = body.get('sponsorOrgId', None)
            num_point_changes = body.get('numPointChanges', 0)
            cursor.callproc('AddSponsorUser', (user_id, sponsor_org_id, num_point_changes))
        elif account_type == "Driver":
            sponsor_org_id = body.get('sponsorOrgId', None)
            cursor.callproc('createNewSponsorDriver', (user_id, sponsor_org_id))
        
        cnx.commit()
        cursor.close()
        cnx.close()
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'message': 'User created successfully', 'userId': user_id})
        }
        
    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'error': str(e)})
        }
