import json
import mysql.connector
import datetime

# Serializer to handle datetime and date objects
def default_serializer(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()  # Converts datetime to ISO format (e.g., "2025-04-17")
    raise TypeError("Type not serializable")

def lambda_handler(event, context):
    try:
        # Extract userId from query string parameters
        user_id = event.get("queryStringParameters", {}).get("userId")
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({"error": "Missing userId"})
            }

        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)

        # Call the stored procedure to get sponsor user info
        cursor.callproc("GetSponsorUserInfo", [user_id])

        # Fetch the results from the stored procedure
        sponsor_user_info = []
        for result in cursor.stored_results():
            for row in result.fetchall():
                sponsor_user_info.append(row)

        cursor.close()
        cnx.close()

        # If no data found, return 404
        if not sponsor_user_info:
            return {
                'statusCode': 404,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({"error": "Sponsor user not found"})
            }

        # Return the sponsor user info with proper serialization for date fields
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(sponsor_user_info[0], default=default_serializer)  # Return the first result
        }

    except Exception as e:
        # Handle any exceptions and return an error
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({"error": str(e)})
        }
