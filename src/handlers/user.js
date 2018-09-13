'use strict'

const Boom = require('boom')
const User = require("../models/user")

const generateAccessToken = require("../utils/token").generateAccessToken

const noContent = (reply)=> reply.response().code(204)

const getUserWithBoom = async(id)=>{
  let cond = {id: id}
  if (!Number.isInteger(id)){
    cond = id
  }
  const user = await User.where(cond).fetch()
   if (!user){
    throw Boom.notFound("User does not exist")
   } 
  return user 
}

const getAuthUser=async(request)=>{
  const user = await getUserWithBoom(request.auth.credentials.id)
  return user
}
const patchUser = async(request, reply) => {
   const user = await getAuthUser(request)
   const payload = request.payload
   const patched = await user.patch(payload)
   return  patched
}

const putUser = async(request, reply) => {
   const user = await getMe(request)
   const payload = request.payload
   const putuser = await User.put(user, User.forge(payload))
   return putuser
}

const getLocks = async(request, reply) => {
   const user = await getAuthUser(request)
   const locks = await user.related('locks').fetch()
   return locks
}

const getUser = async(request) => {
   const user = await getUserWithBoom(request.params.id)
   return user
}

const getUsers = async(request, reply) => {
   const users = await User.query('where', 'id','!=', request.auth.credentials.id).fetchAll()
   return users
}

const getUserByUsername = async(request, reply) => {
  const user = await getUserWithBoom({username: request.params.username})
  return user
}

const createUser = async (request, reply) => {
   const {username, password} = request.payload 
   const user = await User.create({username:username, password:password})
   return user
}

const deleteUser = async(request, reply) => {
   const user = await getAuthUser(request)
   await user.destroy()
   return noContent(reply)
}

const verifyUsernameUnique = async (request, reply) =>{
  const userParams = {username:request.payload.username}
  const alreadyExists = await User.where(userParams).fetch()
  if (alreadyExists){
     return reply.response('User name must be unique').code(422).takeover()
  }
  return reply.continue
}

const getMe = async(request, reply)=>{  
   const me = await getAuthUser(request)
   return me
}

const login = async(request, reply) =>{
   const {username, password} = request.payload 
   const user = User.where({username: username}).fetch()
   if (!user){
    throw Boom.notFound("User not found")
   }
   const isValid = await User.validate(user, password)
   if (!isValid){
    throw Boom.unauthorized("Invalid credentials")
   }
   const credentials = {id: user.id}
   const access_token = generateAccessToken(credentials)
   return {access_token: access_token}
}

module.exports={
    createUser: createUser,
    verifyUsernameUnique: verifyUsernameUnique,
    deleteUser: deleteUser,
    getUsers: getUsers,
    getUser: getUser,
    getUserByUsername: getUserByUsername,
    patchUser: patchUser,
    putUser: putUser,
    getMe: getMe,
    login: login
}