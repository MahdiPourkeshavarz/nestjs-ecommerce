/* eslint-disable prettier/prettier */

export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME,
  },
  admin: {
    firstname: process.env.ADMIN_FIRSTNAME,
    lastname: process.env.ADMIN_LASTNAME,
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    phoneNumber: process.env.ADMIN_PHONE_NUMBER,
    address: process.env.ADMIN_ADDRESS,
    wishlist: process.env.ADMIN_WISHLIST,
  },
});
