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

        qs = event.get('queryStringParameters', {}) or {}
        report_type = qs.get('type')
        start_date = qs.get('start_date')
        end_date = qs.get('end_date')
        sponsor_id = qs.get('sponsor_id')

        results = []

        if report_type == 'report_driver_applications':
            cursor.callproc('report_driver_applications', [start_date, end_date, sponsor_id])
            for result in cursor.stored_results():
                results = result.fetchall()

        elif report_type == 'point_change_audit_log':
            cursor.callproc('report_point_change_audit_log', [start_date, end_date, sponsor_id])
            for result in cursor.stored_results():
                results = result.fetchall()

        else:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': json.dumps({'error': 'Invalid report type'})
            }

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps(results, default=str)
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

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'cnx' in locals() and cnx.is_connected():
            cnx.close()