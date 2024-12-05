import dotenv from 'dotenv'

dotenv.config();

export const config = {
  snowflake: {
    account: String(process.env.SNOWFLAKE_ACCOUNT),
    privateKeyPath: "./snowflake.pem",
    privateKeyPass: String(process.env.SNOWFLAKE_PK_PASSPHRASE),
    region: String(process.env.SNOWFLAKE_REGION),
    username: String(process.env.SNOWFLAKE_USER),
    authenticator: "SNOWFLAKE_JWT",
  },
  snowflakePemString: String(process.env.SNOWFLAKE_PK_STRING),
  snowflakeTable: String(process.env.SNOWFLAKE_ACTUALS_TABLE_NAME)
};
