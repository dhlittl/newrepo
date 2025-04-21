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

        # ---- 1.  pull userId from query string or JSON body -------------------
        user_id = (event.get('queryStringParameters') or {}).get('userId')
        if user_id is None:
            raise ValueError("Missing required query‑string parameter 'userId'")

        # ---- 2.  call stored procedure ---------------------------------------
        cursor.callproc('GetAdminInfo', [int(user_id)])


        # ---- 3.  gather result set(s) ----------------------------------------
        results = []
        for result in cursor.stored_results():
            fetched = result.fetchall()
            print("📦 Raw results:", fetched)
            results.extend(fetched)

        print("📤 Final results:", results)


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
            'body': json.dumps(results, default=str)
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
