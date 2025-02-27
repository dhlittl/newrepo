'use client';

import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify only on the client side
if (typeof window !== 'undefined') {
  Amplify.configure(awsconfig);
}

export default function AmplifyConfig() {
  return null;
}