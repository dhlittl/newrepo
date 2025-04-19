# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors

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

        sponsors = []

        # Check for HTTP method (GET or PUT)
        http_method = event.get("httpMethod", "")
        sponsor_org_id = event.get("queryStringParameters", {}).get("sponsorOrgId") if event.get("queryStringParameters") else None

        if http_method == "GET":
            if sponsor_org_id:
                # Fetch just one sponsor
                query = "SELECT * FROM Sponsor_Organization WHERE Sponsor_Org_ID = %s"
                cursor.execute(query, (sponsor_org_id,))
                sponsors = cursor.fetchall()
            else:
                # Fetch all sponsors using stored procedure
                cursor.callproc('getSponsorInfo')
                for result in cursor.stored_results():
                    sponsors.extend(result.fetchall())

            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps(sponsors)
            }

        elif http_method == "PUT":
            # For PUT request, update sponsor information
            body = json.loads(event.get("body", "{}"))
            Sponsor_Org_ID = body.get("Sponsor_Org_ID")
            Sponsor_Org_Name = body.get("Sponsor_Org_Name")
            Sponsor_Description = body.get("Sponsor_Description")
            Sponsor_Email = body.get("Sponsor_Email")  # Corrected to use Sponsor_Email
            Sponsor_Phone = body.get("Sponsor_Phone")  # Corrected to use Sponsor_Phone

            # Check if all necessary fields are present
            if not Sponsor_Org_ID or not Sponsor_Org_Name or not Sponsor_Description or not Sponsor_Email or not Sponsor_Phone:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }

            # Update the sponsor details in the Sponsor_Organization table
            update_query = """
                UPDATE Sponsor_Organization
                SET Sponsor_Org_Name = %s, Sponsor_Description = %s, Email = %s, Phone_Number = %s
                WHERE Sponsor_Org_ID = %s
            """
            cursor.execute(update_query, (Sponsor_Org_Name, Sponsor_Description, Sponsor_Email, Sponsor_Phone, Sponsor_Org_ID))
            cnx.commit()

            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({'message': 'Sponsor updated successfully'})
            }

        elif http_method == "OPTIONS":
            # handle preflight requests
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({})
            }

        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({'error': 'Method Not Allowed'})
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
