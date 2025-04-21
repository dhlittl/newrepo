import json
import mysql.connector

def lambda_handler(event, context):
    try:

        #Connect to the RDS Database
        cnx = mysql.connector.connect(
            host = 'proxy-1739302102581-team24-database.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user = 'admin',
            password = 'ulgNoR41!',
            database = 'team24database'
        )

        cursor = cnx.cursor()

        data = json.loads(event['body'])

        sponsor_name = data['sponsorName']
        fname = data['firstName']
        lname = data['lastName']
        email = data['email']
        phone = data['phone']
        cognito_sub = None

        cursor.execute(
            "SELECT Sponsor_Org_ID FROM Sponsor_Organization WHERE Sponsor_Org_Name = %s", (sponsor_name,)
        )
        sponsor_org_id_result = cursor.fetchone()

        if sponsor_org_id_result is None:
            raise Exception(f"Sponsor organization '{sponsor_name}' not found")

        sponsor_org_id = sponsor_org_id_result[0]

        cursor.callproc('registerSponsorUser', (fname, lname, email, phone, sponsor_org_id, cognito_sub))
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
            'body': json.dumps('Sponsor User Registered.')
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