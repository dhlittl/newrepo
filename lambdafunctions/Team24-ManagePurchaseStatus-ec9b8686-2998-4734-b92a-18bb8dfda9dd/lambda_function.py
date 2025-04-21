# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/status

import json
import mysql.connector
from datetime import datetime
import decimal

# Create a custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

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
        
        # Handle PUT request to update purchase status
        if method == 'PUT':
            # Parse request body
            data = json.loads(event['body'])
            purchase_id = data.get('purchaseId')  # Order ID
            new_status = data.get('status')       # New status (Approved, Denied, Cancelled)
            user_id = data.get('userId')          # User making the change
            is_sponsor = data.get('isSponsor', False)  # Whether user is a sponsor or driver
            
            # Validate required fields
            if not purchase_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'Missing required fields'}, cls=DecimalEncoder)
                }
            
            # Validate status values
            valid_statuses = ['Approved', 'Denied', 'Cancelled']
            if new_status not in valid_statuses:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': f'Invalid status value. Must be one of: {", ".join(valid_statuses)}'}, cls=DecimalEncoder)
                }
            
            # Start transaction
            cnx.start_transaction()
            
            try:
                # Check if purchase exists and get current status
                cursor.execute(
                    """
                    SELECT p.Purchase_ID, p.Status, p.Driver_ID, p.Sponsor_Org_ID, p.Total_Points 
                    FROM Purchase p
                    WHERE p.Purchase_ID = %s
                    """,
                    (purchase_id,)
                )
                purchase = cursor.fetchone()
                
                if not purchase:
                    raise Exception(f"Purchase with ID {purchase_id} not found")
                
                # Verify current status is 'Processing'
                current_status = purchase['Status']
                if current_status != 'Processing':
                    raise Exception(f"Cannot change status from {current_status} to {new_status}. Only 'Processing' orders can be updated.")
                
                driver_id = purchase['Driver_ID']
                sponsor_org_id = purchase['Sponsor_Org_ID']
                total_points = purchase['Total_Points']
                
                # Set the update timestamp
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                # Update purchase status
                cursor.execute(
                    """
                    UPDATE Purchase 
                    SET Status = %s
                    WHERE Purchase_ID = %s
                    """,
                    (new_status, purchase_id)
                )
                
                # If status is Approved, deduct points from driver
                if new_status == 'Approved':
                    # Verify driver has enough points
                    cursor.execute(
                        """
                        SELECT Point_Balance 
                        FROM Driver_To_SponsorOrg 
                        WHERE Driver_ID = %s AND Sponsor_Org_ID = %s
                        """,
                        (driver_id, sponsor_org_id)
                    )
                    
                    balance_result = cursor.fetchone()
                    if not balance_result:
                        raise Exception(f"Driver {driver_id} has no relationship with Sponsor {sponsor_org_id}")
                    
                    current_balance = balance_result['Point_Balance']
                    if current_balance < total_points:
                        raise Exception(f"Driver has insufficient points. Current balance: {current_balance}, Required: {total_points}")
                    
                    # Deduct points
                    cursor.execute(
                        """
                        UPDATE Driver_To_SponsorOrg 
                        SET Point_Balance = Point_Balance - %s 
                        WHERE Driver_ID = %s AND Sponsor_Org_ID = %s
                        """,
                        (total_points, driver_id, sponsor_org_id)
                    )
                    
                    # Record point change in audit log
                    cursor.execute(
                        """
                        INSERT INTO Point_Changes (
                            Driver_ID, Sponsor_Org_ID, Sponsor_User_ID, Num_Points, 
                            Point_Change_Type, Reason, Change_Date
                        ) VALUES (
                            %s, %s, NULL, %s, 'SUB', 'Product purchase', %s
                        )
                        """,
                        (driver_id, sponsor_org_id, -total_points, timestamp)
                    )
                    
                    # Update products - reduce quantity
                    cursor.execute(
                        """
                        SELECT pi.Product_ID, pi.Quantity
                        FROM Purchase_Item pi
                        WHERE pi.Purchase_ID = %s
                        """,
                        (purchase_id,)
                    )
                    items = cursor.fetchall()
                    
                    for item in items:
                        cursor.execute(
                            """
                            UPDATE Product 
                            SET Quantity = Quantity - %s 
                            WHERE Product_ID = %s
                            """,
                            (item['Quantity'], item['Product_ID'])
                        )
                    
                    # Removed update to Driver.Num_Purchases since column doesn't exist
                    # If you want to track purchase counts, you'll need to add this column to your schema
                
                # Commit transaction if all operations succeeded
                cnx.commit()
                
                # Create response based on status
                if new_status == 'Approved':
                    result = {
                        'message': 'Purchase approved successfully',
                        'purchaseId': purchase_id,
                        'status': new_status,
                        'pointsDeducted': total_points
                    }
                elif new_status == 'Denied':
                    result = {
                        'message': 'Purchase denied',
                        'purchaseId': purchase_id,
                        'status': new_status
                    }
                else:  # Cancelled
                    result = {
                        'message': 'Purchase cancelled',
                        'purchaseId': purchase_id,
                        'status': new_status
                    }
                
            except Exception as e:
                # Rollback transaction if any operation failed
                cnx.rollback()
                raise e
        
        # Handle GET request for sponsor to get pending purchase requests
        elif method == 'GET':
            # Get sponsor ID from query parameters
            params = event.get('queryStringParameters', {})
            sponsor_id = params.get('sponsorId')
            status = params.get('status', 'Processing')  # Default to Processing
            driver_id = params.get('driverId')  # Optional driver ID filter
            
            if not sponsor_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                    },
                    'body': json.dumps({'error': 'Sponsor ID is required'}, cls=DecimalEncoder)
                }
            
            # Base query
            query = """
                SELECT 
                    p.Purchase_ID as purchaseId,
                    p.Purchase_Date as orderDate,
                    p.Total_Points as totalPoints,
                    p.Status as status,
                    p.Driver_ID as driverId,
                    u.FName as driverFirstName,
                    u.LName as driverLastName,
                    u.Email as driverEmail,
                    COUNT(pi.Item_ID) as itemCount
                FROM 
                    Purchase p
                JOIN 
                    Driver d ON p.Driver_ID = d.Driver_ID
                JOIN 
                    User u ON d.User_ID = u.User_ID
                JOIN 
                    Purchase_Item pi ON p.Purchase_ID = pi.Purchase_ID
                WHERE 
                    p.Sponsor_Org_ID = %s
                    AND p.Status = %s
            """
            
            params = [sponsor_id, status]
            
            # Add driver ID filter if provided
            if driver_id:
                query += " AND p.Driver_ID = %s"
                params.append(driver_id)
            
            # Group and order
            query += """
                GROUP BY
                    p.Purchase_ID, p.Purchase_Date, p.Total_Points, p.Status, 
                    p.Driver_ID, u.FName, u.LName, u.Email
                ORDER BY 
                    p.Purchase_Date DESC
            """
            
            cursor.execute(query, params)
            purchases = []
            
            for row in cursor.fetchall():
                # Convert date objects to strings
                if 'orderDate' in row and row['orderDate']:
                    row['orderDate'] = row['orderDate'].strftime('%Y-%m-%d %H:%M:%S')
                
                # Get order items
                cursor.execute(
                    """
                    SELECT 
                        pi.Product_ID as productId,
                        pi.Product_Name as productName,
                        pi.Quantity as quantity,
                        pi.Point_Price as pointPrice,
                        (pi.Point_Price * pi.Quantity) as totalPointPrice,
                        pi.Dollar_Value as dollarValue
                    FROM 
                        Purchase_Item pi
                    WHERE 
                        pi.Purchase_ID = %s
                    """,
                    (row['purchaseId'],)
                )
                
                items = []
                for item_row in cursor.fetchall():
                    items.append(item_row)
                
                row['items'] = items
                purchases.append(row)
            
            result = {
                'purchases': purchases,
                'count': len(purchases)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({'error': 'Method not allowed'}, cls=DecimalEncoder)
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
            'body': json.dumps(result, cls=DecimalEncoder)
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
            'body': json.dumps({'error': str(e)}, cls=DecimalEncoder)
        }