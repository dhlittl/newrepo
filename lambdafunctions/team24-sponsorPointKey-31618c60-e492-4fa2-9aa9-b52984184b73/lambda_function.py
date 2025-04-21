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

        # Determine HTTP method
        http_method = event.get("httpMethod", "")
        path_params = event.get("pathParameters", {}) or {}
        query_params = event.get("queryStringParameters", {}) or {}
        body = {}
        if event.get("body"):
            body = json.loads(event["body"])

        if http_method == "GET":
            # Fetch reasons for a given sponsor
            sponsor_org_id = query_params.get("sponsorOrgId")
            if not sponsor_org_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Missing sponsorOrgId parameter'})
                }

            query = "SELECT * FROM Points_Key WHERE Sponsor_Org_ID = %s;"
            cursor.execute(query, (sponsor_org_id,))
            results = cursor.fetchall()

            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
                },
                'body': json.dumps(results, default=str)
            }

        elif http_method == "POST":
            # Insert a new reason
            sponsor_org_id = body.get("sponsorOrgId")
            reason = body.get("reason")
            points = body.get("points")

            if not sponsor_org_id or not reason or points is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }

            insert_query = """
                INSERT INTO Points_Key (Sponsor_Org_ID, Reason, Points)
                VALUES (%s, %s, %s);
            """
            cursor.execute(insert_query, (sponsor_org_id, reason, points))
            cnx.commit()

            cursor.close()
            cnx.close()

            return {
                'statusCode': 201,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
                },
                'body': json.dumps({'message': 'Reason added successfully', 'reasonId': cursor.lastrowid})
            }

        elif http_method == "PUT":
            # Update an existing reason
            reason_id = body.get("reasonId")
            reason = body.get("reason")
            points = body.get("points")

            if not reason_id or not reason or points is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Missing reasonId, reason, or points'})
                }

            update_query = "UPDATE Points_Key SET Reason = %s, Points = %s WHERE Reason_ID = %s;"
            cursor.execute(update_query, (reason, points, reason_id))
            cnx.commit()

            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
                },
                'body': json.dumps({'message': 'Reason updated successfully'})
            }

        elif http_method == "DELETE":
            # Delete a reason
            reason_id = path_params.get("reasonId")

            if not reason_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Missing reasonId'})
                }

            delete_query = "DELETE FROM Points_Key WHERE Reason_ID = %s;"
            cursor.execute(delete_query, (reason_id,))
            cnx.commit()

            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
                },
                'body': json.dumps({'message': 'Reason deleted successfully'})
            }
        
        elif http_method == "OPTIONS":
            # handle preflight requests
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                },
                'body': json.dumps({})
    }

        else:
            return {
                'statusCode': 405,
                'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                    },
                'body': json.dumps({'error': 'Method Not Allowed'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
            },
            'body': json.dumps({'error': str(e)})
        }
