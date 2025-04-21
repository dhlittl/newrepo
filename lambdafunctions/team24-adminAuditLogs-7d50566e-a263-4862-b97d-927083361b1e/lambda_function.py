from datetime import datetime, timedelta
from io import StringIO
import csv
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

        # Get dates
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        # Get optional filters
        params = event.get("queryStringParameters") or {}
        format_type = params.get("format", "").lower()
        sponsor_org_id = params.get("Target_ID")


        # Call stored procedure
        cursor.callproc('export_audit_logs_weekly', [
            start_date.strftime('%Y-%m-%d %H:%M:%S'),
            end_date.strftime('%Y-%m-%d %H:%M:%S')
        ])

        results = []
        for result in cursor.stored_results():
            all_logs = result.fetchall()

            if sponsor_org_id:
                # Filter logs by Sponsor_Org_ID
                results = [log for log in all_logs if str(log.get("Target_ID")) == sponsor_org_id]
            else:
                results = all_logs

        # CSV format
        if format_type == "csv":
            csv_buffer = StringIO()
            if results:
                writer = csv.DictWriter(csv_buffer, fieldnames=results[0].keys())
                writer.writeheader()
                writer.writerows(results)
            csv_data = csv_buffer.getvalue()

            return {
                'statusCode': 200,
                'headers': {
                    "Content-Type": "text/csv",
                    "Content-Disposition": f"attachment; filename=weekly-audit-{end_date.strftime('%Y-%m-%d')}.csv",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
                },
                'body': csv_data
            }

        # Default JSON response
        return {
            'statusCode': 200,
            'headers': {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT"
            },
            'body': json.dumps({'logs': results}, default=str)
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
