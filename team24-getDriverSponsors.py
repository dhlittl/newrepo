# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/{userId}/sponsors

import json
import mysql.connector

def lambda_handler(event, context):
    try:
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)

        # get userId from path parameters
        user_id = event.get('pathParameters', {}).get('userId')
        if user_id is None:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'Missing userId parameter'})
            }

        # SQL query to get sponsors associated with user
        query = """
        SELECT DISTINCT Sponsor_Org_ID 
        FROM Driver 
        WHERE User_ID = %s
        """
        
        cursor.execute(query, (user_id,))
    
        sponsor_ids = cursor.fetchall()
        
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(sponsor_ids)
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