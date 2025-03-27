import { confirmSignUp } from 'aws-amplify/auth';
import { signUp } from 'aws-amplify/auth';

export async function handleSignUp({ username, password, given_name, family_name, email, phone_number }) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          phone_number,
          given_name,
          family_name // E.164 number convention
        },
        // optional
        autoSignIn: true // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
      }
    });

    console.log(userId);
  } catch (error) {
    console.log('error signing up:', error);
  }
}

export async function handleSignUpConfirmation({ username, confirmationCode }) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode
    });
  } catch (error) {
    console.log('error confirming sign up', error);
  }
}