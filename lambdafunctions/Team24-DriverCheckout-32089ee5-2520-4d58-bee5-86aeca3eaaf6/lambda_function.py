# Invoke URL: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders

import json
import mysql.connector
from datetime import datetime
import uuid

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
        
        # Process order request (POST method)
        if method == 'POST':
            # Parse request body
            data = json.loads(event['body'])
            driver_id = data.get('driverId')
            user_id = data.get('userId')  # Support for userId parameter
            items = data.get('items', [])
            total_points = data.get('totalPoints', 0)
            sponsor_org_id = data.get('sponsorOrgId')  # Get the sponsor ID from the request
            status = data.get('status', 'Processing')  # Get status, default to Processing
            
            # Support both driverId and userId
            if not driver_id and user_id:
                print(f"Using provided userId {user_id} to find driverId")
                driver_id = user_id  # Use userId if driverId is not provided
                
            # Validate required fields
            if not driver_id or not items or total_points <= 0:
                print(f"Validation failed: driver_id={driver_id}, items_len={len(items)}, total_points={total_points}")
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            # Start transaction
            cnx.start_transaction()
            
            try:
                # Print debug info
                print(f"Processing order for driver_id={driver_id}, total_points={total_points}, status={status}")
                
                # 1. Get Driver_ID from User_ID if needed
                cursor.execute(
                    "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
                    (driver_id,)
                )
                driver_result = cursor.fetchone()
                
                if not driver_result:
                    print(f"Driver not found for User_ID={driver_id}")
                    raise Exception(f"Driver not found for User_ID={driver_id}")
                
                actual_driver_id = driver_result['Driver_ID']
                
                # If sponsor_org_id was not provided, try to get it from the first available relationship
                if not sponsor_org_id:
                    cursor.execute(
                        "SELECT Sponsor_Org_ID FROM Driver_To_SponsorOrg WHERE Driver_ID = %s LIMIT 1",
                        (actual_driver_id,)
                    )
                    sponsor_result = cursor.fetchone()
                    
                    if not sponsor_result:
                        print(f"No sponsor relationship found for Driver_ID={actual_driver_id}")
                        raise Exception(f"No sponsor relationship found for Driver_ID={actual_driver_id}")
                    
                    sponsor_org_id = sponsor_result['Sponsor_Org_ID']
                
                # 2. Check if driver has enough points (only validate, don't deduct for Processing)
                cursor.execute(
                    """
                    SELECT Point_Balance 
                    FROM Driver_To_SponsorOrg 
                    WHERE Driver_ID = %s AND Sponsor_Org_ID = %s
                    """,
                    (actual_driver_id, sponsor_org_id)
                )
                balance_result = cursor.fetchone()
                
                if not balance_result:
                    print(f"No relationship found for Driver_ID={actual_driver_id} and Sponsor_Org_ID={sponsor_org_id}")
                    raise Exception(f"No relationship found for Driver_ID={actual_driver_id} and Sponsor_Org_ID={sponsor_org_id}")
                
                current_balance = balance_result['Point_Balance']
                
                print(f"Found Driver_ID={actual_driver_id} with Point_Balance={current_balance} for Sponsor_Org_ID={sponsor_org_id}")
                
                # 3. Check product availability for each item
                for item in items:
                    product_id = item.get('productId')
                    quantity = item.get('quantity', 1)
                    
                    print(f"Checking availability for Product_ID={product_id}, quantity={quantity}")
                    
                    cursor.execute(
                        "SELECT Product_ID, Quantity, Price FROM Product WHERE Product_ID = %s",
                        (product_id,)
                    )
                    product = cursor.fetchone()
                    
                    if not product:
                        print(f"Product {product_id} not found")
                        raise Exception(f"Product {product_id} not found")
                    
                    print(f"Product {product_id} has quantity {product['Quantity']}")
                    
                    if product['Quantity'] < quantity:
                        print(f"Insufficient quantity for product {product_id}: {product['Quantity']} < {quantity}")
                        raise Exception(f"Insufficient quantity for product {product_id}")
                
                # 4. Create order
                order_id = str(uuid.uuid4())
                order_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                print(f"Generated order_id={order_id}, order_date={order_date}")
                
                # 5. Create purchase record in Purchase table with Processing status
                print(f"Creating purchase record with order_id={order_id} and status={status}")
                cursor.execute(
                    """
                    INSERT INTO Purchase (
                        Purchase_ID, Driver_ID, Sponsor_Org_ID, Total_Points, 
                        Purchase_Date, Status, Created_At
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        order_id,
                        actual_driver_id,
                        sponsor_org_id,
                        total_points,
                        order_date,
                        status,  # Use status from request or default to 'Processing'
                        order_date
                    )
                )
                print(f"Purchase record creation result: {cursor.rowcount} rows affected")
                
                # 6. Process items and create purchase_item records but don't update product quantities yet
                print(f"Processing items and creating purchase item records")
                for item in items:
                    product_id = item.get('productId')
                    quantity = item.get('quantity', 1)
                    point_price = item.get('pointPrice')
                    
                    # Get product info to store with purchase
                    cursor.execute(
                        "SELECT Product_Name, Price FROM Product WHERE Product_ID = %s",
                        (product_id,)
                    )
                    product = cursor.fetchone()
                    
                    if not product:
                        print(f"Product {product_id} not found")
                        raise Exception(f"Product {product_id} not found")
                    
                    # Create purchase item record
                    print(f"Creating purchase item for Product_ID={product_id}, quantity={quantity}")
                    cursor.execute(
                        """
                        INSERT INTO Purchase_Item (
                            Purchase_ID, Product_ID, Product_Name,
                            Quantity, Point_Price, Dollar_Value
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s
                        )
                        """,
                        (
                            order_id,
                            product_id,
                            product['Product_Name'],
                            quantity,
                            point_price,
                            product['Price']
                        )
                    )
                    print(f"Purchase item creation result: {cursor.rowcount} rows affected")
                
                # Commit transaction if all operations succeeded
                print("Committing transaction")
                cnx.commit()
                
                result = {
                    'message': 'Order placed successfully',
                    'orderId': order_id,
                    'orderDate': order_date,
                    'totalPoints': total_points,
                    'status': status
                }
                
            except Exception as e:
                # Rollback transaction if any operation failed
                print(f"Error during transaction, rolling back: {str(e)}")
                cnx.rollback()
                raise e
        
        # Get order history for a driver (GET method)
        elif method == 'GET':
            # Get driver ID from query parameters
            params = event.get('queryStringParameters', {})
            driver_id = params.get('driverId')
            status = params.get('status')  # Optional status filter
            
            if not driver_id:
                # If driverId is not provided, try to get it from path parameters
                # This handles both /Driver/orders/{driverId} and /Driver/orders?driverId={id} patterns
                path_params = event.get('pathParameters', {})
                if path_params:
                    driver_id = path_params.get('driverId')
            
            if not driver_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
                    },
                    'body': json.dumps({'error': 'Driver ID is required'})
                }
            
            # Get the actual Driver_ID from the User_ID
            cursor.execute(
                "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
                (driver_id,)
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
                    'body': json.dumps({'error': 'Driver not found'})
                }
            
            actual_driver_id = driver_result['Driver_ID']
            
            # Build the query
            query = """
                SELECT 
                    p.Purchase_ID as orderId,
                    p.Purchase_Date as orderDate,
                    p.Total_Points as totalPoints,
                    p.Status as status,
                    p.Sponsor_Org_ID as sponsorOrgId,
                    so.Sponsor_Org_Name as sponsorName,
                    COUNT(pi.Item_ID) as itemCount
                FROM 
                    Purchase p
                JOIN 
                    Sponsor_Organization so ON p.Sponsor_Org_ID = so.Sponsor_Org_ID
                JOIN 
                    Purchase_Item pi ON p.Purchase_ID = pi.Purchase_ID
                WHERE 
                    p.Driver_ID = %s
            """
            
            params = [actual_driver_id]
            
            # Add status filter if provided
            if status:
                query += " AND p.Status = %s"
                params.append(status)
            
            # Group and order
            query += """
                GROUP BY
                    p.Purchase_ID, p.Purchase_Date, p.Total_Points, p.Status, 
                    p.Sponsor_Org_ID, so.Sponsor_Org_Name
                ORDER BY 
                    p.Purchase_Date DESC
            """
            
            cursor.execute(query, params)
            
            orders = []
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
                        (pi.Point_Price * pi.Quantity) as totalPointPrice
                    FROM 
                        Purchase_Item pi
                    WHERE 
                        pi.Purchase_ID = %s
                    """,
                    (row['orderId'],)
                )
                
                items = []
                for item_row in cursor.fetchall():
                    items.append(item_row)
                
                row['items'] = items
                orders.append(row)
            
            result = {
                'orders': orders
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
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
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
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
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
            },
            'body': json.dumps({'error': str(e)})
        }