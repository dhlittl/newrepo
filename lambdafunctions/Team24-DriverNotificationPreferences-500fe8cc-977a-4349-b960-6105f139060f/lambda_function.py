import json
import mysql.connector
from mysql.connector import Error

def lambda_handler(event, context):
    try:
        # Connect to RDS
        connection = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        
        # Handle different HTTP methods
        http_method = event.get('httpMethod', 'GET')
        
        if http_method == 'GET':
            # Get preferences for a driver
            return get_preferences(connection, event)
        elif http_method == 'PUT':
            # Update preferences
            return update_preferences(connection, event)
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }

def get_preferences(connection, event):
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get user ID from query string parameters
        query_params = event.get('queryStringParameters', {}) or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
                },
                'body': json.dumps({'error': 'Missing required parameter: userId'})
            }
        
        # First, get the Driver_ID associated with the User_ID
        cursor.execute("SELECT Driver_ID FROM Driver WHERE User_ID = %s", (user_id,))
        driver_data = cursor.fetchone()
        
        if not driver_data:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
                },
                'body': json.dumps({'error': 'No driver found for the given user ID'})
            }
        
        driver_id = driver_data['Driver_ID']
        
        # Get the notification preferences
        cursor.execute(
            """
            SELECT * FROM Driver_Notification_Preferences 
            WHERE Driver_ID = %s
            """, 
            (driver_id,)
        )
        
        preferences = cursor.fetchone()
        
        # If no preferences exist yet, create default settings
        if not preferences:
            cursor.execute(
                """
                INSERT INTO Driver_Notification_Preferences 
                (Driver_ID, Points_Update_Notifications, Order_Status_Notifications, Order_Problem_Notifications) 
                VALUES (%s, 1, 1, 1)
                """, 
                (driver_id,)
            )
            connection.commit()
            
            # Get the newly created preferences
            cursor.execute(
                """
                SELECT * FROM Driver_Notification_Preferences 
                WHERE Driver_ID = %s
                """, 
                (driver_id,)
            )
            preferences = cursor.fetchone()
        
        # Close resources
        cursor.close()
        connection.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
            },
            'body': json.dumps({
                'driverId': driver_id,
                'userId': int(user_id),
                'preferences': preferences
            })
        }
        
    except Error as e:
        print(f"Database error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
            },
            'body': json.dumps({'error': f"Database error: {str(e)}"})
        }

def update_preferences(connection, event):
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        
        user_id = body.get('userId')
        points_update_notifications = body.get('pointsUpdateNotifications')
        order_status_notifications = body.get('orderStatusNotifications')
        order_problem_notifications = body.get('orderProblemNotifications')
        
        if user_id is None or points_update_notifications is None:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
                },
                'body': json.dumps({'error': 'Missing required parameters: userId and/or pointsUpdateNotifications'})
            }
        
        # Set default values if not provided
        if order_status_notifications is None:
            order_status_notifications = True
        if order_problem_notifications is None:
            order_problem_notifications = True
            
        # First, get the Driver_ID associated with the User_ID
        cursor.execute("SELECT Driver_ID FROM Driver WHERE User_ID = %s", (user_id,))
        driver_data = cursor.fetchone()
        
        if not driver_data:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
                },
                'body': json.dumps({'error': 'No driver found for the given user ID'})
            }
        
        driver_id = driver_data['Driver_ID']
        
        # Check if preferences exist
        cursor.execute(
            """
            SELECT 1 FROM Driver_Notification_Preferences 
            WHERE Driver_ID = %s
            """, 
            (driver_id,)
        )
        
        exists = cursor.fetchone() is not None
        
        if exists:
            # Update existing preferences
            cursor.execute(
                """
                UPDATE Driver_Notification_Preferences 
                SET Points_Update_Notifications = %s,
                    Order_Status_Notifications = %s,
                    Order_Problem_Notifications = %s
                WHERE Driver_ID = %s
                """, 
                (
                    1 if points_update_notifications else 0,
                    1 if order_status_notifications else 0,
                    1 if order_problem_notifications else 0,
                    driver_id
                )
            )
        else:
            # Create new preferences
            cursor.execute(
                """
                INSERT INTO Driver_Notification_Preferences 
                (Driver_ID, Points_Update_Notifications, Order_Status_Notifications, Order_Problem_Notifications) 
                VALUES (%s, %s, %s, %s)
                """, 
                (
                    driver_id,
                    1 if points_update_notifications else 0,
                    1 if order_status_notifications else 0,
                    1 if order_problem_notifications else 0
                )
            )
        
        connection.commit()
        
        # Get updated preferences
        cursor.execute(
            """
            SELECT * FROM Driver_Notification_Preferences 
            WHERE Driver_ID = %s
            """, 
            (driver_id,)
        )
        
        updated_preferences = cursor.fetchone()
        
        # Close resources
        cursor.close()
        connection.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
            },
            'body': json.dumps({
                'driverId': driver_id,
                'userId': int(user_id),
                'preferences': updated_preferences,
                'message': 'Notification preferences updated successfully'
            })
        }
        
    except Error as e:
        print(f"Database error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS'
            },
            'body': json.dumps({'error': f"Database error: {str(e)}"})
        }