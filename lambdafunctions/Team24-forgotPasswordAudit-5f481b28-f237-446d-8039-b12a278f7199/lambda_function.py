import json
import mysql.connector

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))

        if "body" in event and event["body"]:
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]
        else:
            body = event

        username = body.get('username')
        event_type = body.get('eventType', 'Password Changes')
        description = body.get('actionDescription', 'User reset password')
        metadata = body.get('metadata', {})
        target_entity = body.get('targetEntity')
        target_id = body.get('targetId')

        if not username:
            raise ValueError("Missing 'username' in request.")

        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        print("Connected to RDS")

        cursor = cnx.cursor(buffered=True)


        cursor.execute("SELECT User_ID FROM User WHERE Username = %s", (username,))
        result = cursor.fetchone()
        if not result:
            raise ValueError(f"No user found with username: {username}")

        user_id = result[0]
        print(f"Found User_ID: {user_id}")

        insert_query = """
            INSERT INTO Audit_Log (
                Event_Type,
                User_ID,
                Target_Entity,
                Target_ID,
                Action_Description,
                Metadata
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_query, (
            event_type,
            user_id,
            target_entity,
            target_id,
            description,
            json.dumps(metadata)
        ))

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
            'body': json.dumps({'message': 'Log entry created successfully'})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            'body': json.dumps({'error': str(e)})
        }