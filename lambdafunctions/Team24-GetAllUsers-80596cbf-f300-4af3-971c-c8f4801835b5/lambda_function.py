import json
import datetime
import mysql.connector

def default_converter(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()
    raise TypeError(f"Type {type(o)} not serializable")

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
        
        # Execute the stored procedure to fetch all users
        cursor.callproc('GetAllUsers')
        
        # Retrieve results from the stored procedure call
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()

        # Commit the changes and close the connection
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
            'body': json.dumps(results, default=default_converter)
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
