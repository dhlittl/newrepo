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
        
        method = event.get('httpMethod', '')
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('User_ID')

            if user_id:
                # Fetch a specific user's User_Type
                cursor.callproc('GetUserByID', (user_id,))
                user_data = []
                for result_set in cursor.stored_results():
                    for row in result_set.fetchall():
                        user_data.append({
                            'User_Type': row.get('User_Type')
                        })
                result = user_data
            else:
                # Fetch User_Type for all users
                cursor.callproc('GetAllUsers')
                users = []
                for result_set in cursor.stored_results():
                    for row in result_set.fetchall():
                        users.append({
                            'User_Type': row.get('User_Type')
                        })
                result = users
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        cursor.close()
        cnx.close()
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps(result)
        }
    
    except Exception as e:
        # Return error response
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }
