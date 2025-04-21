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
        
        method = event.get('httpMethod', '')
        
        if method == 'PUT':
            print(f"Received event: {json.dumps(event)}")
            
            data = json.loads(event['body'])
            user_id = data.get('User_ID')
            widget_order = data.get('Widget_Order')

            # Debug: Print the widget order being updated
            print(f"Updating widget order for User_ID: {user_id}, Order: {widget_order}")
            
            cursor.execute("SELECT * FROM Default_User_Preferences WHERE user_id = %s", (user_id,))
            record = cursor.fetchone()

            if record:
                print(f"Record found for User_ID: {user_id}, updating widget order...")
                cursor.callproc('UpdateDefaultUserWidgetOrder', (user_id, json.dumps(widget_order)))
            else:
                print(f"No record found for User_ID: {user_id}, inserting widget order...")
                cursor.execute("INSERT INTO Default_User_Preferences (user_id, widget_order) VALUES (%s, %s)", (user_id, json.dumps(widget_order)))
            
            cnx.commit()
            
            result = {"message": "Widget Order Updated or Created", "user_id": user_id, "widget_order": widget_order}
        
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
            
            print(f"Fetching widget order for User_ID: {User_ID}")
            cursor.callproc('GetDefaultUserWidgetOrder', (User_ID,))
            widget_order = None
            for result_set in cursor.stored_results():
                for row in result_set.fetchall():
                    widget_order = json.loads(row.get('Widget_Order', '[]'))  

            if widget_order is None:
                return {
                    'statusCode': 404,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'Widget order not found for this User_ID'})
                }

            result = {"widget_order": widget_order}
        
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
    
    # error response
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }
