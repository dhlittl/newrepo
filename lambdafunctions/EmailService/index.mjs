import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "us-east-1" });

export const handler = async (event) => {
  try {
    // Handle both direct Lambda invocation and API Gateway events
    let recipientEmail, emailSubject, emailBody;
    
    if (event.body) {
      // This is an API Gateway event
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      recipientEmail = body.recipientEmail;
      emailSubject = body.emailSubject;
      emailBody = body.emailBody;
    } else {
      // This is a direct Lambda test event
      recipientEmail = event.recipientEmail;
      emailSubject = event.emailSubject;
      emailBody = event.emailBody;
    }
    
    // Validate required fields
    if (!recipientEmail || !emailSubject || !emailBody) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }
    
    // Configure email parameters
    const params = {
      Source: "team24notify@gmail.com", // Your verified SES email
      Destination: {
        ToAddresses: [recipientEmail]
      },
      Message: {
        Subject: {
          Data: emailSubject
        },
        Body: {
          Text: {
            Data: emailBody
          },
          Html: {
            Data: emailBody // If you want to support HTML emails
          }
        }
      }
    };
    
    console.log("Sending email to:", recipientEmail);
    
    // Send email via SES
    await sesClient.send(new SendEmailCommand(params));
    
    console.log("Email sent successfully");
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({ message: "Email sent successfully" })
    };
    
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({ error: `Failed to send email: ${error.message}` })
    };
  }
};