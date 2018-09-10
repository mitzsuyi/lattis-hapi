'use strict';

function env(VAR){
  return process.env[VAR]
}
const NODE_ENV= env("NODE_ENV")
const IS_DEV_ENV = NODE_ENV === 'development' || NODE_ENV === undefined
module.exports={
    PORT: env("PORT")
}