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
        
        firstName  = event.get('firstName', '')
        lastName   = event.get('lastName', '')
        email      = event.get('email', '')
        phone      = event.get('phoneNumber', '')
        sub        = event.get('sub', '')
        username   = event.get('username', '')

        cursor.execute(
        """
        INSERT INTO User
            (FName, LName, Email, Phone_Number, Start_Date, End_Date, Cognito_Sub, Username, User_Type)
        VALUES (%s, %s, %s, %s, CURRENT_DATE(), NULL, %s, %s, 'Default')
        """,
        (firstName, lastName, email, phone, sub, username)
        )
        cnx.commit()

        inserted_id = cursor.lastrowid
        cursor.close()
        cnx.close()
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'insertedId': inserted_id})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }
