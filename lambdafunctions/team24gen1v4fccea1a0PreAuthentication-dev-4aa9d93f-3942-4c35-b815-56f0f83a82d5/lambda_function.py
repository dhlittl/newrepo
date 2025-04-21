import json
import mysql.connector
import os

def lambda_handler(event, context):
    try:
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True, buffered=True)

        username = event.get("userName")
        if not username:
            raise Exception("No username found in event.")

        # Step 1: Get User_ID and User_Type
        cursor.execute("""
            SELECT User_ID, User_Type
            FROM User
            WHERE Username = %s
        """, (username,))
        user = cursor.fetchone()
        if not user:
            raise Exception(f"User {username} not found.")

        user_id = user["User_ID"]
        user_type = user["User_Type"]
        target_entity = "Driver" if user_type == "driver" else "Sponsor"

        sponsor_org_ids = []

        if user_type == "driver":
            # Step 2: Get Driver_ID
            cursor.execute("""
                SELECT Driver_ID FROM Driver WHERE User_ID = %s
            """, (user_id,))
            driver = cursor.fetchone()
            if driver:
                driver_id = driver["Driver_ID"]

                # Step 3: Get all Sponsor_Org_IDs
                cursor.execute("""
                    SELECT Sponsor_Org_ID FROM Driver_To_SponsorOrg WHERE Driver_ID = %s
                """, (driver_id,))
                sponsor_org_ids = [row["Sponsor_Org_ID"] for row in cursor.fetchall()]
        elif user_type == "sponsor":
            # For sponsors
            cursor.execute("""
                SELECT Sponsor_Org_ID FROM Sponsor_User WHERE User_ID = %s
            """, (user_id,))
            sponsor_org_ids = [row["Sponsor_Org_ID"] for row in cursor.fetchall()]

        # Use fallback if no sponsor_org_ids found
        if not sponsor_org_ids:
            sponsor_org_ids = [None]

        metadata = {
            "status": "PENDING"
        }

        for sponsor_id in sponsor_org_ids:
            cursor.execute("""
                INSERT INTO Audit_Log (Event_Type, User_ID, Target_Entity, Target_ID, Action_Description, Metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                'Login Attempts',
                user_id,
                target_entity,
                sponsor_id,
                'Login attempt via Cognito (PreAuth)',
                json.dumps(metadata)
            ))

        cnx.commit()
        return event

    except mysql.connector.Error as err:
        print(f"MySQL error: {err}")
        return event
    except Exception as e:
        print(f"Error: {e}")
        return event
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()
