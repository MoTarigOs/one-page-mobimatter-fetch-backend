/* 
  limit the requests that user can make in specific time
  you can adjust the requests and time to your prefrencies
*/

const setRateLimit = require("express-rate-limit");


const requests = 120000;
const time = 60 * 1000;
const messageShowedTiUser = "You send too many requests, please try again after few minuts";

const rateLimitMiddleware = setRateLimit({
  windowMs: time,
  max: requests,
  message: messageShowedTiUser,
  headers: true
});

module.exports = rateLimitMiddleware;