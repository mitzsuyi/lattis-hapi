'use strict';

require('dotenv').config()

const Config = require('../config')

const Hapi = require('hapi')  

const server = new Hapi.Server({
    port: Config.PORT
})

const Plugins = require('./plugins')

const Users = require('../src/routes/user')

const tokenValidateFunc = require('../src/utils/tokenValidateFunc')

const setup = async () => { 
    await server.register(Plugins);
    server.auth.strategy('token', 'jwt', {
        key: Config.JWT_SECRET,
        validate: tokenValidateFunc,
       verifyOptions: { algorithms: ['HS256'] }
    });
    server.auth.default({strategy: 'token', mode:"required"}) 
};

process.on('unhandledRejection', (error) => {
  console.log(error);
  process.exit();
});

const run = async function() {
    await server.start();
    console.log(`🚀 Server ready at ${server.info.uri}`)
}

const app = {
    server: server,
    run: run,
    setup: setup
}

void async function () {
  if (!module.parent) { 
    await app.setup()
    await app.run() 
  }
}()

module.exports = app
