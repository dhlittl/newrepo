import json
import mysql.connector

def lambda_handler(event, context):
    print("Event received:", json.dumps(event))  # Debugging line to log the event

    try:
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)

        # Retrieve sponsorOrgId from query string parameters
        query_params = event.get('queryStringParameters') or {}  # Prevent NoneType error
        print("Query parameters:", query_params)  # Debugging line to check query parameters

        username = query_params.get('username')

        
        # Check if sponsor_id is still missing
        if username is None:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'Missing username parameter'})
            }

        # Call the stored procedure without forcing int conversion
        cursor.callproc("GetCurrentUserID", (username,))

        # Retrieve results from the stored procedure call
        userID = []
        for result in cursor.stored_results():
            userID.extend(result.fetchall())  # Properly collect all results

        cnx.commit()
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(userID)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({'error': str(e)})
        }
