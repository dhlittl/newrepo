import json
import os
import boto3

cognito       = boto3.client('cognito-idp')
USER_POOL_ID  = os.environ.get('USER_POOL_ID', '')
DRIVER_GROUP  = os.environ.get('DRIVER_GROUP', 'driver')

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    username = body.get('username')
    
    if not username:
        return { 
            'statusCode': 400, 
            'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
                },
            'body': json.dumps({'error':'Missing username'}) 
        }

    cognito.admin_add_user_to_group(
        UserPoolId = USER_POOL_ID,
        GroupName  = DRIVER_GROUP,
        Username   = username
    )
    return { 
        'statusCode': 200,
        'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
                }, 
        'body': json.dumps({'message':f'{username} added to {DRIVER_GROUP}'}) 
    }
