/* istanbul ignore next */
export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: 3000,
  secret: process.env.JWT_SECRET,
  enableMessaging: process.env.ENABLE_MESSAGING
    ? /true/i.test(process.env.ENABLE_MESSAGING)
    : false,
  database: {
    host:
      process.env.NODE_ENV === 'test' ? 'localhost' : process.env.DATABASE_HOST,
    port:
      process.env.NODE_ENV === 'test'
        ? 55044
        : process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  firebase: {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CERTIFICATE_URL,
  },
  auth0: {
    issuer_url: process.env.AUTH0_ISSUER_URL,
    audience: process.env.AUTH0_AUDIENCE,
  },
});
