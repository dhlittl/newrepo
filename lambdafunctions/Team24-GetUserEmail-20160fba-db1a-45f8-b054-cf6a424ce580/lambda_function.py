import json
import mysql.connector

def lambda_handler(event, context):
    try:
        print("Connecting to RDS...")
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        print("Connected to RDS")

        cursor = cnx.cursor(dictionary=True)

        # Get user ID from query string parameters
        user_id = (event.get('queryStringParameters') or {}).get('userId')
        if user_id is None:
            raise ValueError("Missing required query-string parameter 'userId'")

        # Query just the email to avoid date serialization issues
        query = "SELECT Email FROM User WHERE User_ID = %s"
        cursor.execute(query, (int(user_id),))
        
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'User not found'})
            }

        # Close connections
        cursor.close()
        cnx.close()

        # Return just the email
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({'email': result['Email']})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({'error': str(e)})
        }