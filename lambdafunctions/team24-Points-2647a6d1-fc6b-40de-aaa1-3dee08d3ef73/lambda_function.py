# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}

import json
import mysql.connector
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or int(obj) if you're certain there are no decimal parts
        return super().default(obj)

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

        # For GET requests
        if http_method == "GET":
            # Get the user ID from query parameters
            query_params = event.get("queryStringParameters", {})
            user_id = query_params.get("userId")
            
            if not user_id:
                # Fallback to body if not in query parameters
                body = json.loads(event.get("body", "{}"))
                user_id = body.get("userId")
            
            if not user_id:
                # If still no user ID, return an error
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'error': 'Missing userId parameter'})
                }
            
            # Get the driver's ID from User_ID
            cursor.execute(
                "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
                (user_id,)
            )
            driver_result = cursor.fetchone()
            
            if not driver_result:
                return {
                    'statusCode': 404,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'error': 'Driver not found for the provided userId'})
                }
            
            driver_id = driver_result['Driver_ID']
            
            # Get all sponsor point balances for this driver
            cursor.execute("""
                SELECT 
                    d2s.Sponsor_Org_ID,
                    so.Sponsor_Org_Name,
                    so.ConversionRate_DtoP,
                    d2s.Point_Balance,
                    IFNULL(
                        (SELECT SUM(Num_Points) 
                         FROM Point_Changes 
                         WHERE Driver_ID = d2s.Driver_ID 
                         AND Sponsor_Org_ID = d2s.Sponsor_Org_ID 
                         AND Point_Change_Type = 'ADD'),
                         0
                    ) AS PointsAdded,
                    IFNULL(
                        (SELECT SUM(ABS(Num_Points)) 
                         FROM Point_Changes 
                         WHERE Driver_ID = d2s.Driver_ID 
                         AND Sponsor_Org_ID = d2s.Sponsor_Org_ID 
                         AND Point_Change_Type = 'SUB'),
                         0
                    ) AS PointsSubbed
                FROM Driver_To_SponsorOrg d2s
                JOIN Sponsor_Organization so ON d2s.Sponsor_Org_ID = so.Sponsor_Org_ID
                WHERE d2s.Driver_ID = %s
            """, (driver_id,))
            
            points_data = cursor.fetchall()
            
            cursor.close()
            cnx.close()
            
            if points_data:
                return {
                    'statusCode': 200,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps(points_data, cls=DecimalEncoder)
                }
            else:
                # Driver exists but has no sponsor relationships
                return {
                    'statusCode': 200,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps([], cls=DecimalEncoder)
                }

        elif http_method == "POST":
            body = json.loads(event.get("body", "{}"))
            action = body.get("action", "")

            if action == "give_weekly_bonus":
                sponsor_org_id = body.get("Sponsor_Org_ID")
                week_start = body.get("week_start")
                week_end = body.get("week_end")

                if not sponsor_org_id or not week_start or not week_end:
                    return {
                        'statusCode': 400,
                        'headers': {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "Content-Type",
                            "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                        },
                        'body': json.dumps({'error': 'Missing required parameters'})
                    }

                print("Calling give_weekly_bonus_for_sponsor with:", sponsor_org_id, week_start, week_end)

                cursor.callproc('give_weekly_bonus_for_sponsor', (
                    sponsor_org_id,
                    week_start,
                    week_end
                ))
                cnx.commit()
                return {
                    'statusCode': 200,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'message': 'Weekly bonus issued successfully'})
                }

            # Process a point update request
            driver_id = body.get("Driver_ID")
            sponsor_org_id = body.get("Sponsor_Org_ID")
            points_change = body.get("Point_Balance")  # This is the points change amount
            sponsor_user_id = body.get("Sponsor_User_ID")
            reason = body.get("Reason")

            # Validate inputs
            if None in (driver_id, sponsor_org_id, points_change):
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'error': 'Missing required parameters'})
                }

            # Begin transaction
            cnx.start_transaction()
            
            try:
                # Check if driver-sponsor relationship exists
                cursor.execute(
                    "SELECT COUNT(*) as count FROM Driver_To_SponsorOrg WHERE Driver_ID = %s AND Sponsor_Org_ID = %s",
                    (driver_id, sponsor_org_id)
                )
                relationship_exists = cursor.fetchone()['count'] > 0
                
                if not relationship_exists:
                    # Create relationship if it doesn't exist
                    cursor.execute(
                        "INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID, Point_Balance) VALUES (%s, %s, 0)",
                        (driver_id, sponsor_org_id)
                    )
                
                # Update points in Driver_To_SponsorOrg
                cursor.execute("""
                    UPDATE Driver_To_SponsorOrg 
                    SET Point_Balance = Point_Balance + %s
                    WHERE Driver_ID = %s AND Sponsor_Org_ID = %s
                """, (points_change, driver_id, sponsor_org_id))
                
                # Record the change in Point_Changes table
                point_change_type = 'ADD' if points_change >= 0 else 'SUB'
                points_value = abs(points_change) if point_change_type == 'SUB' else points_change
                
                cursor.execute("""
                    INSERT INTO Point_Changes (
                        Driver_ID, Sponsor_Org_ID, Sponsor_User_ID, 
                        Num_Points, Point_Change_Type, Reason, Change_Date
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, NOW()
                    )
                """, (
                    driver_id, sponsor_org_id, sponsor_user_id, 
                    points_value, point_change_type, reason
                ))
                
                # Commit transaction
                cnx.commit()
            
            except Exception as e:
                # Rollback on error
                cnx.rollback()
                raise e
            
            finally:
                cursor.close()
                cnx.close()

            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                },
                'body': json.dumps({'message': 'Point balance updated successfully'})
            }

        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                },
                'body': json.dumps({'error': 'Method Not Allowed'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
            },
            'body': json.dumps({'error': str(e)})
        }