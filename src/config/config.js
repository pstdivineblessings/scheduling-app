const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(8585),

    MYSQL_HOST: Joi.string().required().description("Mysql host"),
    MYSQL_USER: Joi.string().required().description("Mysql user"),
    MYSQL_PASSWORD: Joi.string().required().description("Mysql user password"),
    MYSQL_DB: Joi.string().required().description("Mysql database name"),
    MYSQL_PORT: Joi.string().required().description("Mysql port"),
    MYSQL_DIALECT: Joi.string().default("mysql"),
    MYSQL_POOL_MAX: Joi.number().default(5),
    MYSQL_POOL_MIN: Joi.number().default(0),
    MYSQL_POOL_ACQUIRE: Joi.number().default(30000),
    MYSQL_POOL_IDLE: Joi.number().default(10000),

    JWT_ACCESS_TOKEN_SECRET: Joi.string()
      .required()
      .description("JWT access secret key"),
    JWT_REFRESH_TOKEN_SECRET: Joi.string()
      .required()
      .description("JWT refresh secret key"),
    JWT_ACCESS_EXPIRATION: Joi.string()
      .default("15m")
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION: Joi.string()
      .default("30d")
      .description("days after which refresh tokens expire"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mysql: {
    host: envVars.MYSQL_HOST,
    user: envVars.MYSQL_USER,
    password: envVars.MYSQL_PASSWORD,
    db: envVars.MYSQL_DB + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    port: envVars.MYSQL_PORT,
    dialect: envVars.MYSQL_DIALECT,
    pool: {
      max: envVars.MYSQL_POOL_MAX,
      min: envVars.MYSQL_POOL_MIN,
      acquire: envVars.MYSQL_POOL_ACQUIRE,
      idle: envVars.MYSQL_POOL_IDLE,
    },
  },
  jwt: {
    accessTokenSecret: envVars.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: envVars.JWT_REFRESH_TOKEN_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
  },
};
