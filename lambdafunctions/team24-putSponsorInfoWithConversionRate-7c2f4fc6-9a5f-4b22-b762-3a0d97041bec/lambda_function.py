import json
import mysql.connector
from decimal import Decimal

def lambda_handler(event, context):
    try:
        # Print event for debugging
        print(f"Received event: {json.dumps(event)}")
        
        # Handle OPTIONS preflight request first
        if event.get("httpMethod") == "OPTIONS":
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE"
                },
                'body': json.dumps({})
            }
            
        # Connect to the RDS Database
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )

        cursor = cnx.cursor(dictionary=True)

        # Check for HTTP method (GET or PUT)
        http_method = event.get("httpMethod", "")

        if http_method == "GET":
            sponsor_org_id = event.get("queryStringParameters", {}).get("sponsorOrgId") if event.get("queryStringParameters") else None
            
            if sponsor_org_id:
                # Fetch just one sponsor
                query = "SELECT * FROM Sponsor_Organization WHERE Sponsor_Org_ID = %s"
                cursor.execute(query, (sponsor_org_id,))
                sponsor = cursor.fetchone()
            else:
                # Default response if no specific sponsor requested
                sponsor = {"error": "No sponsor ID provided"}

            cursor.close()
            cnx.close()

            # Convert Decimal values to float before returning the response
            sponsor = convert_decimals_to_floats(sponsor)

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                    "Content-Type": "application/json"
                },
                'body': json.dumps(sponsor)
            }

        elif http_method == "PUT":
            # For PUT request, update sponsor information
            body = json.loads(event.get("body", "{}"))
            print(f"Received body: {body}")
            
            Sponsor_Org_ID = body.get("Sponsor_Org_ID")
            Sponsor_Org_Name = body.get("Sponsor_Org_Name")
            Sponsor_Description = body.get("Sponsor_Description")
            Sponsor_Email = body.get("Sponsor_Email")
            Sponsor_Phone = body.get("Sponsor_Phone")
            ConversionRate_DtoP = body.get("ConversionRate_DtoP")

            # Check if all necessary fields are present
            if not Sponsor_Org_ID:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                        "Content-Type": "application/json"
                    },
                    'body': json.dumps({'error': 'Missing required Sponsor_Org_ID field'})
                }

            # Prepare update fields
            update_fields = []
            params = []
            
            if Sponsor_Org_Name is not None:
                update_fields.append("Sponsor_Org_Name = %s")
                params.append(Sponsor_Org_Name)
                
            if Sponsor_Description is not None:
                update_fields.append("Sponsor_Description = %s")
                params.append(Sponsor_Description)
                
            if Sponsor_Email is not None:
                update_fields.append("Email = %s")
                params.append(Sponsor_Email)
                
            if Sponsor_Phone is not None:
                update_fields.append("Phone_Number = %s")
                params.append(Sponsor_Phone)
                
            if ConversionRate_DtoP is not None:
                update_fields.append("ConversionRate_DtoP = %s")
                params.append(ConversionRate_DtoP)
                
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                        "Content-Type": "application/json"
                    },
                    'body': json.dumps({'error': 'No fields to update'})
                }
                
            # Add the Sponsor_Org_ID to params
            params.append(Sponsor_Org_ID)
            
            # Build and execute the update query
            update_query = f"""
                UPDATE Sponsor_Organization
                SET {', '.join(update_fields)}
                WHERE Sponsor_Org_ID = %s
            """
            
            print(f"Executing query: {update_query}")
            print(f"With params: {params}")
            
            cursor.execute(update_query, params)
            cnx.commit()
            
            updated_rows = cursor.rowcount
            cursor.close()
            cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                    "Content-Type": "application/json"
                },
                'body': json.dumps({
                    'message': 'Sponsor updated successfully',
                    'updatedRows': updated_rows
                })
            }

        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                    "Content-Type": "application/json"
                },
                'body': json.dumps({'error': 'Method Not Allowed'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
                "Content-Type": "application/json"
            },
            'body': json.dumps({'error': str(e)})
        }

def convert_decimals_to_floats(data):
    """
    Convert all Decimal objects in the given data to floats.
    The data can be a list of dictionaries, and it will recursively convert all decimal fields.
    """
    if isinstance(data, list):
        return [convert_decimals_to_floats(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_decimals_to_floats(value) for key, value in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    else:
        return data