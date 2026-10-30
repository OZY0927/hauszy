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
    'auth/operation-not-allowed': 'Sign-in is not available right now. Contact the site owner.',
    'auth/unauthorized-domain': 'Sign-in is not available on this web address. Contact the site owner.',
    'auth/invalid-api-key': 'Sign-in is not available right now. Contact the site owner.',
    'auth/user-token-expired': 'Your session expired. Please sign in again.',
    'auth/invalid-user-token': 'Your session expired. Please sign in again.',
    'permission-denied': 'Signed in, but this account does not have access to the project list. Contact the site owner.',
    'unavailable': 'The database is temporarily unavailable. Please try again.',
    'auth/unsupported-provider': 'Use your admin email and password to sign in.'
  };
  return messages[error?.code] || 'Unable to connect. Please try again or contact the site owner.';
}
