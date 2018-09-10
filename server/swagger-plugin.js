const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Package = require('../package.json')
const Config = require('../config')

let SwaggerPlugin = [
  Inert, 
  Vision, 
  {
    plugin: HapiSwagger,
    options: {
      info: {
        'title': Package.description,
        'version': Package.version
      },
     tags: [{
        'name': 'login',
        'description': 'Entry point to api, get your access token here!',
      }, 
     {
      'name': 'users',
      'description': 'User management',
      }, {
      'name': 'locks',
      'description': 'Managing user locks'
      }],
      sortEndpoints: 'ordered'
    }
  }
]

module.exports = SwaggerPlugin
