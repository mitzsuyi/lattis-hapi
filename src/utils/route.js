'use strict';

const withErrorHandler = require('./withErrorHandler')

let order = 0
const NOT_IMPLEMENTED = (request, reply) => "Not Implemented"

function route(path, method, description, notes, validation={}, opts={}){
    order += 1
    const validate = Object.assign({}, validation)
    const responses = opts.responses || []
    let pre = opts.pre || []
    if(opts.pre){
      pre = [pre]
    }
    const _notes = [notes]
    let handler = NOT_IMPLEMENTED
    if (opts.handler){
      handler = (reply, h) => withErrorHandler(reply, h, opts.handler)
    }
    if (!opts.insecured) {
      _notes.push('__Token is required to access this endpoint.__')
    }
    return {
        path: path,
        method: method,
        handler: handler,
        config:{
            pre: [].concat(pre),
            tags:["api"],
            auth: opts.insecured ? false : undefined, 
            description: description,
            notes: _notes,
            plugins: {
               'hapi-swagger': {
                 order: order,
                 responses: responses
               }
            } ,
            validate: validate
        }
    }
 }

 module.exports = route