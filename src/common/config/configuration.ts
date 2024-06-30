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
});
