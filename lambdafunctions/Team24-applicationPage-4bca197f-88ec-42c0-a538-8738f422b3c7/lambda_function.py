import json
import mysql.connector

def lambda_handler(event, context):
    try:

        #Connect to the RDS Database
        cnx = mysql.connector.connect(
            host = 'proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user = 'admin',
            password = '4911Admin2025',
            database = 'team24database'
        )

        cursor = cnx.cursor()

        data = json.loads(event['body'])

        sponsor_id = data['sponsorId']
        user_id = data['userId']
        fname = data['firstName']
        lname = data['lastName']
        email = data['email']
        phone = data['phone']
        q1_ans = data.get('q1_ans', None)
        q2_ans = data.get('q2_ans', None)
        q3_ans = data.get('q3_ans', None)

        update_user_query = """
            UPDATE User
            SET FName = %s,
                LName = %s,
                Phone_Number = %s
            WHERE User_ID = %s
        """

        cursor.execute(update_user_query, (fname, lname, phone, user_id))

        cursor.callproc('registerDriverApplication', (sponsor_id, user_id, fname, lname, email, phone, q1_ans, q2_ans, q3_ans))

        cnx.commit()
        cursor.close()
        cnx.close()

        return {
            'statusCode': 200,
            'headers' : {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps('Sucessfully Applied.')
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