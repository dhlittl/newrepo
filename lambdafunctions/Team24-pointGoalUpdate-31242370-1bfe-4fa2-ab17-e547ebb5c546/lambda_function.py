import json
import mysql.connector

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
        
        # Get the HTTP method from the event (GET or PUT)
        method = event.get('httpMethod', '')

        # PUT method to update Point_Goal
        if method == 'PUT':
            print(f"Received event: {json.dumps(event)}")
            
            data = json.loads(event['body'])
            user_id = data.get('User_ID')
            new_point_goal = data.get('Point_Goal')

            print(f"Updating point goal for User_ID: {user_id}, New Point Goal: {new_point_goal}")
            
            if not user_id or new_point_goal is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'User_ID and new_point_goal are required'})
                }
            
            # Update the Point_Goal for the specified User_ID
            update_query = "UPDATE Driver SET Point_Goal = %s WHERE User_ID = %s"
            cursor.execute(update_query, (new_point_goal, user_id))
            cnx.commit()
            
            result = {"message": "Point goal updated successfully", "user_id": user_id, "new_point_goal": new_point_goal}

        # GET method to retrieve Point_Goal
        elif method == 'GET':
            User_ID = event.get('queryStringParameters', {}).get('User_ID')

            if not User_ID:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'User_ID is required'})
                }
            
            print(f"Fetching point goal for User_ID: {User_ID}")
            cursor.execute("SELECT Point_Goal FROM Driver WHERE User_ID = %s", (User_ID,))
            point_goal = cursor.fetchone()

            if point_goal is None:
                return {
                    'statusCode': 404,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'Point goal not found for this User_ID'})
                }

            result = {"point_goal": point_goal['Point_Goal']}

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
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }
