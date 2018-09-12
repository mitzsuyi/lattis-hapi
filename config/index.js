'use strict';

function env(VAR){
  return process.env[VAR]
}
const  DEVELOPMENT = "development"
const NODE_ENV = env("NODE_ENV") || DEVELOPMENT
const IS_DEV_ENV = NODE_ENV === DEVELOPMENT
module.exports={
    PORT: env("PORT"),
    ENV: NODE_ENV,
    IS_DEV_ENV: IS_DEV_ENV,
    MYSQL_DB_URL: env("MYSQL_DB_URL")
}