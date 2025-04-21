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
        
        if method == 'PUT':
            print(f"Received event: {json.dumps(event)}")
            
            data = json.loads(event['body'])
            user_id = data.get('User_ID')
            # Skip username, pass the existing username from database instead
            fname = data.get('FName', None)
            lname = data.get('LName', None)
            email = data.get('Email', None)
            phone = data.get('Phone_Number', None)
            
            # First, get the current username
            cursor.execute("SELECT Username FROM User WHERE User_ID = %s", (user_id,))
            user_result = cursor.fetchone()
            current_username = user_result.get('Username') if user_result else None
            
            # Use the existing username instead of the one provided in the request
            cursor.callproc('UpdateUserInfo', (user_id, current_username, fname, lname, email, phone))
            cnx.commit()
            
            result = "User Info Updated"
        
        elif method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('User_ID')

            if user_id:
                # Fetch a specific user
                cursor.callproc('GetUserByID', (user_id,))
                user_data = []
                for result_set in cursor.stored_results():
                    for row in result_set.fetchall():
                        user_data.append({
                            'User_ID': row.get('User_ID'),
                            'Username': row.get('Username'),
                            'FName': row.get('FName'),
                            'LName': row.get('LName'),
                            'Email': row.get('Email'),
                            'Phone_Number': row.get('Phone_Number'),
                            'Start_Date': row.get('Start_Date').strftime('%Y-%m-%d') if row.get('Start_Date') else None
                        })
                result = user_data
            else:
                # Fetch all users
                cursor.callproc('GetAllUsers')
                users = []
                for result_set in cursor.stored_results():
                    for row in result_set.fetchall():
                        users.append({
                            'User_ID': row.get('User_ID'),
                            'Username': row.get('Username'),
                            'FName': row.get('FName'),
                            'LName': row.get('LName'),
                            'Email': row.get('Email'),
                            'Phone_Number': row.get('Phone_Number'),
                            'Start_Date': row.get('Start_Date').strftime('%Y-%m-%d') if row.get('Start_Date') else None
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
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }
