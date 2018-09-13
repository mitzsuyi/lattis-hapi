'use strict';

const Joi = require('joi')

const ID = Joi.number().integer()

const lock = Joi.object({
    macId: Joi.string().guid(),
    name: Joi.string(),
    id: ID
}).label('Lock')

const user = Joi.object({
    id: ID,
    password: Joi.string(),
    username: Joi.string(),
    birthDate: Joi.date().optional(),
    name: Joi.string().optional(),
}).label('User')

const users = Joi.object({
    data: Joi.array().items(user),
}).label('User List')


const locks = Joi.object({
    data: Joi.array().items(lock),
}).label('Lock List')


const STATUSES = {
    204: {
       description: "No Content" 
    },
    401: {
        description: 'Unauthorized'
    },
    403: {
        description: 'Forbidden'
    },
    409: {
        description: 'Conflict'
    },
    422: {
        description: 'Unprocessable Entity'
    },
    200: {
       description: 'Success'
    },

    '200u': {
        'description': 'Success',
        'schema': user
    },
     '200ui': {
        'description': 'Success',
        'schema': users
    },
   '200l': {
        'description': 'Success',
        'schema': lock
    },
   '200li': {
        'description': 'Success',
        'schema': locks
    }  

}

function statusWithCodes(codes) {
   let statuses={}
   codes.forEach((code)=>statuses[(code.toString().replace(/ui|li|l|u/, ''))]=STATUSES[code]) 
  return Object.assign({},statuses)
}

const lockHttpStatus = statusWithCodes(['200l', 401, 403]);
const locksHttpStatus = statusWithCodes(['200li', 401, 403]);

const createLockHttpStatus = statusWithCodes(['200l', 422]);

const updateLockHttpStatus = statusWithCodes(['200l', 401, 403, 409]);

const loginHttpStatus = statusWithCodes(['200u', 401]);

const signupHttpStatus = statusWithCodes(['200u', 422]);

const updateUserHttpStatus = statusWithCodes(['200u', 401, 403, 409]);

const userHttpStatus = statusWithCodes(['200u', 401, 403]);
const usersHttpStatus = statusWithCodes(['200ui', 401, 403]);

const defaultHttpStatus = statusWithCodes([204, 401, 403])

module.exports = {
    loginHttpStatus: loginHttpStatus,
    createLockHttpStatus: createLockHttpStatus,
    signupHttpStatus: signupHttpStatus,
    updateUserHttpStatus: updateUserHttpStatus,
    lockHttpStatus: lockHttpStatus,
    userHttpStatus: userHttpStatus,
    usersHttpStatus: usersHttpStatus,
    locksHttpStatus: locksHttpStatus,
    defaultHttpStatus: defaultHttpStatus,
    updateLockHttpStatus: updateLockHttpStatus,
    models:{
        user: user
    }
}