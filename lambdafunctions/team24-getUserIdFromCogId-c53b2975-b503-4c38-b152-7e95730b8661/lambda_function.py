import json
import mysql.connector
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True, buffered=True)

        # Get Cognito user ID from path parameters
        cognito_sub = event.get('pathParameters', {}).get('cognitoSub')
        if cognito_sub is None:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'Missing cognitoSub parameter'})
            }

        # SQL query to map Cognito ID to database user ID, selecting the lowest User_ID in case of duplicates
        query = """
        SELECT User_ID as userId, User_Type as userType
        FROM User
        WHERE Cognito_Sub = %s
        ORDER BY User_ID ASC
        LIMIT 1
        """

        cursor.execute(query, (cognito_sub,))
        result = cursor.fetchone()

        if not result:
            # If no mapping found, create a new user
            insert_query = """
            INSERT INTO User (FName, LName, Email, Phone_Number, Start_Date, Cognito_Sub, User_Type)
            VALUES ('', '', '', '', CURDATE(), %s, 'defaultUser')
            """
            cursor.execute(insert_query, (cognito_sub,))
            cnx.commit()

            # Get the newly created user ID
            cursor.execute("""
            SELECT LAST_INSERT_ID() as userId, 'defaultUser' as userType
            """)
            result = cursor.fetchone()

        # Log the result for debugging
        logger.info(f"Found user: {result}")

        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(result)
        }

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({'error': str(e)})
        }