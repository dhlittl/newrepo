import json
import mysql.connector
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    trigger_source = event.get("triggerSource")
    logger.info("CustomMessage invoked, triggerSource=%s", trigger_source)
    username = event.get("userName")
    if not username:
        logger.error("No userName in event")
        raise Exception("No username found in event.")

    if trigger_source != "CustomMessage_ForgotPassword":
        return event

    try:
        cnx = mysql.connector.connect(
            host='proxy-1741015331966-cpsc4911-team24.proxy-cobd8enwsupz.us-east-1.rds.amazonaws.com',
            user='admin',
            password='4911Admin2025',
            database='team24database'
        )
        cursor = cnx.cursor(dictionary=True, buffered=True)

        logger.info(f"Password reset requested for user {username}")

        # 3a) Lookup User_ID & type
        cursor.execute(
            "SELECT User_ID, User_Type FROM User WHERE Username = %s",
            (username,)
        )
        user = cursor.fetchone()
        if not user:
            raise Exception(f"User {username} not found.")

        user_id    = user["User_ID"]
        user_type  = user["User_Type"].lower()
        target_entity = "Driver" if user_type == "driver" else "Sponsor"

        # 3b) Gather all Sponsor_Org_IDs
        sponsor_org_ids = []
        if user_type == "driver":
            cursor.execute(
                "SELECT Driver_ID FROM Driver WHERE User_ID = %s",
                (user_id,)
            )
            row = cursor.fetchone()
            if row:
                driver_id = row["Driver_ID"]
                cursor.execute(
                    "SELECT Sponsor_Org_ID FROM Driver_To_SponsorOrg WHERE Driver_ID = %s",
                    (driver_id,)
                )
                sponsor_org_ids = [r["Sponsor_Org_ID"] for r in cursor.fetchall()]
        else:
            cursor.execute(
                "SELECT Sponsor_Org_ID FROM Sponsor_User WHERE User_ID = %s",
                (user_id,)
            )
            sponsor_org_ids = [r["Sponsor_Org_ID"] for r in cursor.fetchall()]

        if not sponsor_org_ids:
            sponsor_org_ids = [None]

        # 3c) Build metadata
        metadata = {
            "clientId": event.get("callerContext", {}).get("clientId"),
            "email":    event.get("request", {}).get("userAttributes", {}).get("email")
        }

        # 3d) Insert one audit‐row per org
        for sponsor_id in sponsor_org_ids:
            cursor.execute("""
                INSERT INTO Audit_Log
                  (Event_Type, User_ID, Target_Entity, Target_ID, Action_Description, Metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                "Password Changes",     
                user_id,
                target_entity,
                sponsor_id,
                "Password reset requested",
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
