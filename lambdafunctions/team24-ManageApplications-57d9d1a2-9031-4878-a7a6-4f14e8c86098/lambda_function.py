import json
import mysql.connector

def lambda_handler(event, context):
    try:
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True)
        
        method = event.get('httpMethod', '')
        path = event.get('resource', '') or event.get('rawPath', '')
        query_params = event.get('queryStringParameters', {}) or {}
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}

        if method == 'GET' and path == '/sponsors/applications':
            return get_pending_applications(cursor, cnx, query_params)
        
        elif method == 'PUT' and path == '/sponsors/applications':
            return review_application(cursor, cnx, body)

        else:
            return {
                'statusCode': 400,
                'headers': default_headers(),
                'body': json.dumps({'error': 'invalid request'})
            }

    except mysql.connector.Error as err:
        return {
            'statusCode': 500,
            'headers': default_headers(),
            'body': json.dumps({'error': f'MySQL error: {str(err)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': default_headers(),
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'cnx' in locals():
            cnx.close()


def get_pending_applications(cursor, cnx, query_params):
    sponsor_id = query_params.get('sponsor_id')

    if not sponsor_id:
        return {
            'statusCode': 400,
            'headers': default_headers(),
            'body': json.dumps({'error': 'Missing sponsor_id parameter'})
        }

    cursor.callproc('getPendingApplications', [int(sponsor_id)])
    applications = []

    for results in cursor.stored_results():
        for row in results.fetchall():
            lookup = cnx.cursor()
            lookup.execute(
                "SELECT Username FROM `User` WHERE User_ID = %s",
                (row["User_ID"],)
            )
            username_row = lookup.fetchone()
            lookup.close()

            applications.append({
                "Application_ID": row.get("Application_ID"),
                "User_ID": row.get("User_ID"),
                "Username": username_row[0] if username_row else None,
                "FName": row.get("FName"),
                "LName": row.get("LName"),
                "Email": row.get("Email"),
                "Phone": row.get("Phone"),
                "Submitted_At": row["Submitted_At"].strftime("%Y-%m-%d %H:%M:%S") if row.get("Submitted_At") else None,
                "Sponsor_Org_ID": row.get("Sponsor_Org_ID")  # ✅ Add sponsor ID to the returned object
            })
    
    return {
        'statusCode': 200,
        'headers': default_headers(),
        'body': json.dumps(applications)
    }


def review_application(cursor, cnx, body):
    required_fields = ['application_id', 'sponsor_id', 'status']
    if not all(field in body for field in required_fields):
        return {
            'statusCode': 400,
            'headers': default_headers(),
            'body': json.dumps({'error': 'Missing required fields'})
        }

    application_id = body['application_id']
    sponsor_id = body['sponsor_id']
    status = body['status']

    if status not in ['Approved', 'Denied']:
        return {
            'statusCode': 400,
            'headers': default_headers(),
            'body': json.dumps({'error': "Invalid status. Use 'Approved' or 'Denied'."})
        }

    try:
        # First, check if the application exists and get its user_id
        cursor.execute(
            "SELECT User_ID FROM Driver_Applications WHERE Application_ID = %s AND Sponsor_Org_ID = %s",
            (application_id, sponsor_id)
        )
        application = cursor.fetchone()
        
        if not application:
            return {
                'statusCode': 404,
                'headers': default_headers(),
                'body': json.dumps({'error': 'Application not found'})
            }

        user_id = application['User_ID']

        # If approving, handle driver creation manually to bypass the faulty trigger
        if status == 'Approved':
            # First, update User type
            cursor.execute(
                "UPDATE User SET User_Type = 'driver' WHERE User_ID = %s",
                (user_id,)
            )
            
            # Check if driver already exists
            cursor.execute(
                "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
                (user_id,)
            )
            driver = cursor.fetchone()
            
            if not driver:
                # Insert into Driver table with only the required fields
                cursor.execute(
                    "INSERT INTO Driver (User_ID, Driver_ID) VALUES (%s, %s)",
                    (user_id, user_id)  # Use user_id as driver_id for simplicity
                )
                
                # Get the new driver ID
                driver_id = cursor.lastrowid or user_id
            else:
                driver_id = driver['Driver_ID']
            
            # Create relationship in Driver_To_SponsorOrg if needed
            cursor.execute(
                "SELECT 1 FROM Driver_To_SponsorOrg WHERE Driver_ID = %s AND Sponsor_Org_ID = %s",
                (driver_id, sponsor_id)
            )
            exists = cursor.fetchone()
            
            if not exists:
                cursor.execute(
                    "INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID, Point_Balance) VALUES (%s, %s, 0)",
                    (driver_id, sponsor_id)
                )
                
            # Now handle the application status update manually rather than using the procedure
            cursor.execute(
                "UPDATE Driver_Applications SET App_Status = %s, Processed_At = NOW() WHERE Application_ID = %s",
                (status, application_id)
            )
            
            # Insert into audit log for consistency
            cursor.execute(
                """INSERT INTO Audit_Log 
                   (Event_Type, User_ID, Target_Entity, Target_ID, Action_Description, Metadata) 
                   VALUES 
                   ('Driver Applications', %s, 'Driver', %s, %s, 
                    JSON_OBJECT(
                        'Application_ID', %s,
                        'FName', (SELECT FName FROM Driver_Applications WHERE Application_ID = %s),
                        'LName', (SELECT LName FROM Driver_Applications WHERE Application_ID = %s),
                        'Email', (SELECT Email FROM Driver_Applications WHERE Application_ID = %s),
                        'Submitted_At', (SELECT Submitted_At FROM Driver_Applications WHERE Application_ID = %s)
                    ))
                """,
                (user_id, sponsor_id, 'Approved', application_id, application_id, application_id, application_id, application_id)
            )
        else:
            # For denial, just use the standard procedure since it doesn't try to create a driver
            cursor.execute(
                "UPDATE Driver_Applications SET App_Status = %s, Processed_At = NOW() WHERE Application_ID = %s",
                (status, application_id)
            )
            
            # Insert into audit log for denied applications
            cursor.execute(
                """INSERT INTO Audit_Log 
                   (Event_Type, User_ID, Target_Entity, Target_ID, Action_Description, Metadata) 
                   VALUES 
                   ('Driver Applications', %s, 'Driver', %s, %s, 
                    JSON_OBJECT(
                        'Application_ID', %s,
                        'FName', (SELECT FName FROM Driver_Applications WHERE Application_ID = %s),
                        'LName', (SELECT LName FROM Driver_Applications WHERE Application_ID = %s),
                        'Email', (SELECT Email FROM Driver_Applications WHERE Application_ID = %s),
                        'Submitted_At', (SELECT Submitted_At FROM Driver_Applications WHERE Application_ID = %s)
                    ))
                """,
                (user_id, sponsor_id, 'Denied', application_id, application_id, application_id, application_id, application_id)
            )
            
        cnx.commit()
        
        return {
            'statusCode': 200,
            'headers': default_headers(),
            'body': json.dumps({'message': f'Application {application_id} successfully {status.lower()}.'})
        }
    except mysql.connector.Error as err:
        return {
            'statusCode': 500,
            'headers': default_headers(),
            'body': json.dumps({'error': f'MySQL error: {str(err)}'})
        }


def default_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
    }