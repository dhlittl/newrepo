import json
import mysql.connector
from datetime import datetime

def lambda_handler(event, context):
    try:

        #Connect to the RDS Database
        cnx = mysql.connector.connect(
            host = 'proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user = 'admin',
            password = '4911Admin2025',
            database = 'team24database'
        )

        cursor = cnx.cursor(dictionary=True)

        cursor.callproc('getSponsorPolicies')

        policies = []
        for result in cursor.stored_results():
            for row in result.fetchall():
                if 'Created_At' in row and isinstance(row['Created_At'], datetime):
                    row['Created_At'] = row['Created_At'].strftime('%Y-%m-%d %H:%M:%S')
                if 'Updated_At' in row and isinstance(row['Updated_At'], datetime):
                    row['Updated_At'] = row['Updated_At'].strftime('%Y-%m-%d %H:%M:%S')
                policies.append(row)

        cursor.close()
        cnx.close()

        return{
            'statusCode': 200,
            'headers' : {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(policies)
        }

    except Exception as e:
        response = {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({'error': str(e)})
        }
        return response