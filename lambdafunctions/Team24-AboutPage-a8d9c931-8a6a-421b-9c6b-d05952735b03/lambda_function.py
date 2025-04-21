import json
import mysql.connector

def lambda_handler(event, context):
    # TODO implement

    # Define CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',  # Allow all origins
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }

    # Handle OPTIONS request (preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    #Connect to the RDS Database
    cnx = mysql.connector.connect(
        host = 'proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
        user = 'admin',
        password = '4911Admin2025',
        database = 'team24database'
    )

    data = None

    data = event.get('newInfo')
    operation = 'post' if data else 'get'

    cursor = cnx.cursor()

    if operation == 'post':
        insert_query = 'CALL insertNewAboutPage(%s, %s, %s, %s, %s)'
        insert_params = (data["newTeamNumber"], data["newSprintNumber"], data["newReleaseDate"], data["newProductName"], data["newProductDescription"])

        cursor.execute(insert_query, insert_params)

        cnx.commit()

    else:
    
        get_query = 'CALL getMostRecentAboutPage'

        cursor.execute(get_query)
        results = cursor.fetchone()
        

    cursor.close()
    cnx.close()

    if operation == 'get':
        return{
            'statusCode': 200,
            'headers': headers,
             'body': json.dumps({'TeamNumber': results[0],
                                    'SprintNumber': results[1],
                                    'ReleaseDate': str(results[2]),
                                    'ProductName': results[3],
                                    'ProductDescription': results[4]})
        }
    if operation == 'post':
        return{
            'statusCode': 200,
            'headers': headers,
            'body': "Succeeded"
        }