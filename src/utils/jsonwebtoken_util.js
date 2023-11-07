
//用于生成和解析token
const jwt = require('jsonwebtoken');
const signkey = process.env.SECRET || 'secret';

exports.setToken = function(username,password){
  return new Promise((resolve,reject)=>{
    const token = jwt.sign({
      username,
      password
    },signkey);
    resolve('Bearer '+token);
  })
}