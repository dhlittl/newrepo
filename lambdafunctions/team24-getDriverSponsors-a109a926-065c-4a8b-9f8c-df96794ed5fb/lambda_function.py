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

        # First get the driver ID from the User ID
        cursor.execute(
            "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
            (user_id,)
        )
        driver_result = cursor.fetchone()
        
        if not driver_result:
            return {
                'statusCode': 404,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({'error': 'Driver not found for the provided userId'})
            }
        
        driver_id = driver_result['Driver_ID']

        # SQL query to get sponsors associated with user from the Driver_To_SponsorOrg table
        # AND join with Sponsor_Organization to get sponsor details
        query = """
        SELECT d2s.Sponsor_Org_ID, so.Sponsor_Org_Name, so.Sponsor_Description, so.Email, so.Phone_Number
        FROM Driver_To_SponsorOrg d2s
        JOIN Sponsor_Organization so ON d2s.Sponsor_Org_ID = so.Sponsor_Org_ID
        WHERE d2s.Driver_ID = %s
        """
        
        cursor.execute(query, (driver_id,))
    
        sponsors = cursor.fetchall()
        
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps(sponsors)
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