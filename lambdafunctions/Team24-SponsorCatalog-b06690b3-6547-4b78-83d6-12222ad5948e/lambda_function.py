import json
import mysql.connector
from datetime import datetime
from decimal import Decimal

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # Convert Decimal to float for JSON serialization
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
        
        # GET request - fetch catalog items for a sponsor
        if method == 'GET':
            # Get sponsor ID from query parameters
            params = event.get('queryStringParameters', {})
            sponsor_id = params.get('sponsorId')
            
            if not sponsor_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Sponsor ID is required'})
                }
            
            # Query products for the sponsor
            cursor.execute(
                "SELECT * FROM Product WHERE Sponsor_Org_ID = %s",
                (sponsor_id,)
            )
            
            products = []
            for row in cursor.fetchall():
                # Convert datetime objects to strings
                if 'Created_At' in row and row['Created_At']:
                    row['Created_At'] = row['Created_At'].strftime('%Y-%m-%d %H:%M:%S')
                if 'Updated_At' in row and row['Updated_At']:
                    row['Updated_At'] = row['Updated_At'].strftime('%Y-%m-%d %H:%M:%S')
                
                # Handle Decimal values
                processed_row = {}
                for key, value in row.items():
                    if isinstance(value, Decimal):
                        processed_row[key] = float(value)
                    else:
                        processed_row[key] = value
                
                products.append(processed_row)
            
            result = {
                'products': products
            }
            
        # POST request - add new item to catalog
        elif method == 'POST':
            data = json.loads(event['body'])
            sponsor_id = data.get('sponsorId')
            product_name = data.get('productName')
            product_description = data.get('productDescription')
            price = data.get('price')
            quantity = data.get('quantity', 1)
            image_url = data.get('imageUrl', '')
            
            # Validate required fields
            if not all([sponsor_id, product_name, price]):
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE"
                    },
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            # Insert new product
            cursor.execute(
                """
                INSERT INTO Product (
                    Sponsor_Org_ID, Product_Name, Product_Description, 
                    Price, Quantity, Image_URL, Created_At, Updated_At
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                """,
                (sponsor_id, product_name, product_description, price, quantity, image_url)
            )
            cnx.commit()
            
            # Get the product ID of the newly inserted product
            product_id = cursor.lastrowid
            
            result = {
                'message': 'Product added successfully',
                'productId': product_id
            }
            
        # PUT request - update item quantity
        elif method == 'PUT':
            data = json.loads(event['body'])
            product_id = data.get('productId')
            quantity = data.get('quantity')
            
            # Validate required fields
            if product_id is None or quantity is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
                    },
                    'body': json.dumps({'error': 'Product ID and quantity are required'})
                }
            
            # Update the product quantity
            cursor.execute(
                """
                UPDATE Product 
                SET Quantity = %s, Updated_At = NOW() 
                WHERE Product_ID = %s
                """,
                (quantity, product_id)
            )
            cnx.commit()
            
            # Check if the product was actually updated
            if cursor.rowcount == 0:
                return {
                    'statusCode': 404,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
                    },
                    'body': json.dumps({'error': 'Product not found'})
                }
            
            result = {
                'message': 'Product quantity updated successfully',
                'productId': product_id,
                'newQuantity': quantity
            }
            
        # DELETE request - remove item from catalog
        elif method == 'DELETE':
            # Get product ID from query parameters
            params = event.get('queryStringParameters', {})
            product_id = params.get('productId')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
                    },
                    'body': json.dumps({'error': 'Product ID is required'})
                }
            
            # Delete the product
            cursor.execute(
                "DELETE FROM Product WHERE Product_ID = %s",
                (product_id,)
            )
            cnx.commit()
            
            # Check if the product was actually deleted
            if cursor.rowcount == 0:
                return {
                    'statusCode': 404,
                    'headers': {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
                    },
                    'body': json.dumps({'error': 'Product not found'})
                }
            
            result = {
                'message': 'Product deleted successfully'
            }
            
        else:
            return {
                'statusCode': 405,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        cursor.close()
        cnx.close()
        
        # Use the custom encoder when dumping to JSON
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
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
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT"
            },
            'body': json.dumps({'error': str(e)})
        }