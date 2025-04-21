const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  GetGroupCommand,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});
const lambda  = new LambdaClient({});

/**
 * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event) => {
  const groupParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
  };
  const addUserParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };
  /**
   * Check if the group exists; if it doesn't, create it.
   */
  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
  } catch (e) {
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand(groupParams));
  }
  /**
   * Then, add the user to the group.
   */
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addUserParams));

  const payload = {
    firstName:   event.request.userAttributes.given_name,
    lastName:    event.request.userAttributes.family_name,
    email:       event.request.userAttributes.email,
    phoneNumber: event.request.userAttributes.phone_number,
    sub:         event.request.userAttributes.sub,
    username:    event.userName,
  };

  // invoke your InsertUser lambda asynchronously
  await lambda.send(new InvokeCommand({
    FunctionName:   process.env.TEAM24_MOVE_USERS,  // or function name
    InvocationType: 'Event',                             // “fire‑and‑forget”
    Payload:        Buffer.from(JSON.stringify(payload)),
  }));

  return event;
};
