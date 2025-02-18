import "dotenv/config";

export const config = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY as string,
  PORT: process.env.PORT || 3000,
};
