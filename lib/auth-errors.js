export function authErrorMessage(error) {
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/wrong-password': 'Incorrect email or password. Please try again.',
    'auth/user-not-found': 'Incorrect email or password. Please try again.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/user-disabled': 'This account has been disabled. Contact the site owner.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again later.',
    'auth/network-request-failed': 'Connection failed. Check your internet and try again.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase.',
    'auth/unauthorized-domain': 'This domain is not authorised in Firebase Authentication.',
    'auth/invalid-api-key': 'Firebase configuration is invalid. Contact the site owner.',
    'auth/user-token-expired': 'Your session expired. Please sign in again.',
    'auth/invalid-user-token': 'Your session expired. Please sign in again.',
    'permission-denied': 'Signed in, but database access was denied. The updated Firestore rules need to be published.',
    'unavailable': 'The database is temporarily unavailable. Please try again.',
    'auth/unsupported-provider': 'Use your Firebase email and password to sign in.'
  };
  return messages[error?.code] || 'Unable to connect. Please try again or contact the site owner.';
}
