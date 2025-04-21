import json
import mysql.connector
import datetime  # ✅ needed for date serialization

def convert_dates(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    return obj

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

        # ---- 1.  pull userId from query string or JSON body -------------------
        user_id = (event.get('queryStringParameters') or {}).get('userId')
        if user_id is None:
            raise ValueError("Missing required query‑string parameter 'userId'")

        # ---- 2.  call stored procedure ---------------------------------------
        cursor.callproc('GetDefaultUserInfo', [int(user_id)])

        # ---- 3.  gather result set(s) ----------------------------------------
        results = []
        for result in cursor.stored_results():
            rows = result.fetchall()
            print("Fetched rows from DB:", rows)  # Optional: debugging line
            results.extend(rows)

        # ---- 4.  close connections & return ----------------------------------
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(results, default=convert_dates)  # ✅ Fixed
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
