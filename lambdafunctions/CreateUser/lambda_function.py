import json
import os
import boto3

cognito = boto3.client('cognito-idp')
lambda_client = boto3.client('lambda')
USER_POOL_ID = os.environ.get('USER_POOL_ID', '')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        username    = body['username']
        email       = body['email']
        first_name  = body.get('firstName')
        last_name   = body.get('lastName')
        phone       = body.get('phoneNumber')
        group       = body['group']
        password    = body.get('password')

        user_attrs = [
            {'Name': 'email',           'Value': email},
            {'Name': 'email_verified',  'Value': 'true'},
        ]
        if first_name:
            user_attrs.append({'Name': 'given_name', 'Value': first_name})
        if last_name:
            user_attrs.append({'Name': 'family_name', 'Value': last_name})
        if phone:
            user_attrs.append({'Name': 'phone_number', 'Value': phone})
            user_attrs.append({'Name': 'phone_number_verified', 'Value': 'true'})

        # 1) Create the user
        resp = cognito.admin_create_user(
            UserPoolId     = USER_POOL_ID,
            Username       = username,
            UserAttributes = user_attrs,
            MessageAction  = 'SUPPRESS'
        )

        # 2) Get the sub from the response or via admin_get_user
        sub = next(
            (a['Value'] for a in resp['User']['Attributes'] if a['Name'] == 'sub'),
            None
        )
        if not sub:
            fetched = cognito.admin_get_user(UserPoolId=USER_POOL_ID, Username=username)
            sub = next(a['Value'] for a in fetched['UserAttributes'] if a['Name'] == 'sub')

        # 3) Set a permanent password
        if password:
            cognito.admin_set_user_password(
                UserPoolId = USER_POOL_ID,
                Username   = username,
                Password   = password,
                Permanent  = True
            )

        # 4) Add to group
        cognito.admin_add_user_to_group(
            UserPoolId = USER_POOL_ID,
            Username   = username,
            GroupName  = group
        )

        # 5) Invoke secondary Lambda
        payload = {
            'username':    username,
            'cognitoSub':  sub
        }

        try:
            print("▶️ Invoking DB Lambda with payload:", payload)
            resp = lambda_client.invoke(
                FunctionName   = 'team24-insertCognitoSub',
                InvocationType = 'Event',
                Payload        = json.dumps(payload).encode('utf-8')
            )
            print("✅ Invoke returned:", resp)
        except Exception as err:
            print("‼️ Failed to invoke DB Lambda:", err)

        # ✅ Return response with the cognito sub
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
            },
            'body': json.dumps({
                'message': f'User {username} created, attributes set, and added to group {group}',
                'cognitoSub': sub
            })
        }

    except cognito.exceptions.UsernameExistsException:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
            },
            'body': json.dumps({'error': 'Username already exists'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
            },
            'body': json.dumps({'error': str(e)})
        }
