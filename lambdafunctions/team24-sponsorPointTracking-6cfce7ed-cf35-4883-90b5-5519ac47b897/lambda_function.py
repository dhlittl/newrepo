import json
import mysql.connector
from datetime import datetime, date

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))
        
        sponsorOrgID = event.get("queryStringParameters", {}).get("SponsorOrgId")
        
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        print("Connected to RDS")
        
        cursor = cnx.cursor(dictionary=True)
        cursor.callproc('getSponsorPointTracking', (sponsorOrgID,))
        
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())
        
        cursor.close()
        cnx.close()
        
        def default_serializer(obj):
            if isinstance(obj, (datetime, date)):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'data': results}, default=default_serializer)
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
