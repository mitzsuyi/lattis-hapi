'use strict';

const SwaggerPlugin = require('./swagger-plugin')
let plugins = [
  {
    plugin: require('hapi-auto-route'),
    options:{
     routes_dir:"src/routes"
    }
  },
  require('hapi-auth-jwt2')
].concat(SwaggerPlugin)

module.exports = plugins
