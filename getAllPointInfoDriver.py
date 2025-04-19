# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/pointsInfo

import json
import mysql.connector
from decimal import Decimal
from datetime import datetime

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def lambda_handler(event, context):
    print("Event received:", json.dumps(event))

    try:
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)

        # Retrieve userId from query string parameters
        query_params = event.get('queryStringParameters') or {}
        print("Query parameters:", query_params)

        user_id = query_params.get('userId')

        if user_id is None:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'Missing user_id parameter'})
            }

        # New query to get all point changes for the user with sponsor info
        query = """
        SELECT pc.*, so.Sponsor_Org_Name, d2s.Point_Balance as Current_Balance
        FROM Point_Changes pc
        JOIN Driver d ON pc.Driver_ID = d.Driver_ID
        JOIN Sponsor_Organization so ON pc.Sponsor_Org_ID = so.Sponsor_Org_ID
        JOIN Driver_To_SponsorOrg d2s ON pc.Driver_ID = d2s.Driver_ID AND pc.Sponsor_Org_ID = d2s.Sponsor_Org_ID
        WHERE d.User_ID = %s
        ORDER BY pc.Change_Date DESC
        """
        
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(results, cls=DecimalEncoder)
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