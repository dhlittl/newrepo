import json
import mysql.connector

def lambda_handler(event, context):
    username = event['username']
    cognito_sub = event['cognitoSub']

    try:
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        
        cursor = cnx.cursor(dictionary=True)
        
        # First check if the user exists
        check_sql = "SELECT User_ID FROM `User` WHERE Username = %s"
        cursor.execute(check_sql, (username,))
        
        user = cursor.fetchone()
        
        if not user:
            # User doesn't exist
            cursor.close()
            cnx.close()
            return {
                'statusCode': 404,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
                },
                'body': json.dumps({'error': f'User with username {username} not found'})
            }
        
        # User exists, perform the update
        update_sql = """
            UPDATE `User`
            SET Cognito_Sub = %s
            WHERE Username = %s
        """
        cursor.execute(update_sql, (cognito_sub, username))
        cnx.commit()
        
        updated = cursor.rowcount
        cursor.close()
        cnx.close()
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
            },
            'body': json.dumps({'updatedRows': updated, 'userId': user['User_ID']})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
            },
            'body': json.dumps({'error': str(e)})
        }