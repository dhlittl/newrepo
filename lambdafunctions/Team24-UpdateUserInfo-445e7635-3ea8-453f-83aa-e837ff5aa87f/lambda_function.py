import json
import mysql.connector

def lambda_handler(event, context):
    try:
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)

        raw_body = event.get('body', '{}')
        print("RAW BODY:", raw_body)

        body = json.loads(raw_body)
        print("PARSED BODY:", body)

        user_id = body.get('User_ID')
        username = body.get('Username')
        fname = body.get('FName')
        lname = body.get('LName')
        email = body.get('Email')
        phone = body.get('Phone_Number')

        print("VALUES TO UPDATE:")
        print("User_ID:", user_id)
        print("Username:", username)
        print("FName:", fname)
        print("LName:", lname)
        print("Email:", email)
        print("Phone:", phone)

        # Now try the SQL again
        cursor.execute("""
            UPDATE User
            SET Username = %s,
                FName = %s,
                LName = %s,
                Email = %s,
                Phone_Number = %s
            WHERE User_ID = %s
        """, (username, fname, lname, email, phone, user_id))

        cnx.commit()
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'message': 'Debug output printed to logs'})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'error': str(e)})
        }
