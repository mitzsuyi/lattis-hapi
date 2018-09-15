'use strict'

const route = require('../utils/route')
const namespace = require('hapi-namespace')
const status = require('../utils/routeResponses')
const Joi = require('joi')

const controller = require("../handlers/lock")

module.exports = namespace('/locks', [
    route('', "POST", "Create Lock", 
          "Authorized user creates a Lock with name", {
            payload: {name: Joi.string().required()},
          }, 
           {
            responses: status.createLockHttpStatus, 
            handler: controller.createLock,
            pre: {method:controller.verifyNameUserIdUnique, assign: 'nameUserIdUniquenessCheck'}
           }
          ),
    
    route('/{id}', "PATCH", "Update Lock", 
         "Update name field of lock that belongs to authorized user ", {
          params: {id: Joi.number().integer().required()},
          payload: {name: Joi.string()},
        }, 
         {
          responses: status.updateLockHttpStatus,
          handler: controller.patchLock
         }
        ) ,
    
    route('/{id}', "DELETE", "Delete Lock", 
         "Delete a lock that belongs to authorized user",{
          params: {id: Joi.number().integer().required()},
         },
          {
           responses: status.defaultHttpStatus,
           handler: controller.deleteLock,
           }

         ),
    
    route('', "GET", "Get Locks",
          "Returns a list of locks that belong to authorized user",{
          },         
           {
            responses: status.locksHttpStatus,
            handler: controller.getLocks,
          }
          ),
 
    route('/{id}', "GET", "Get Lock by id", 
         "Returns a lock that belongs to authorized user",{
          params: {id: Joi.number().integer().required()},
         },
          {
            responses: status.lockHttpStatus,
            handler: controller.getLock,
           }
         ),
 
    route('/macid/{macId}', "GET", "Get Lock by macId", 
         "Returns a lock that belongs to authorized user by macId", {
          params: {macId: Joi.string().guid().required()},
         },
          {
            responses: status.lockHttpStatus,
            handler: controller.getLockByMacId,
           }
         ),  
]

)