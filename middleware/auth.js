const jwt = require("jsonwebtoken");
const config = require('../config/env')
const redisClient = require('../model/redis.js');
module.exports = async function(req, res, next) {
  //get the token from the header if present
  // console.log('0000000000000000000000');
  const token = req.headers["x-access-token"] || req.headers["authorization"] || req.cookies.auth;
  // console.log('345678',token);

  const inDenyList = await redisClient.get(`blacklist_${token}`);
  
  //if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send({status:0,message:"Access denied. No token provided."});
  
  if (inDenyList) {
    return res.status(401).send({status:0,message:"Access denied. Invalid token"});
  }

  try {
    //if can verify the token, set req.user and pass to next middleware
   
    const decoded = jwt.verify(token, config.privateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    //if invalid token
    console.log('object');
    return res.status(401).send({status:0,message:"Access denied. Invalid Token."});
  }
};
