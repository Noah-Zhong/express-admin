const express = require('express');
const router = express.Router();
const { setRedis }= require('../../utils/redis_util.js');
const send = require('../../config/sendJson.js');
const { setToken } = require('../../utils/jsonwebtoken_util.js');
const system = require('../../controllers/system.js');
const poolQuery = require('../../controllers/db.js')
const md5 = require('md5');
router.post('/login', function(req, res, next) {
    const captchaCode = req.signedCookies.sca;
    if(captchaCode){
        if(captchaCode != req.body.captcha.toLowerCase()){
            return send(res, null, 200, '验证码错误');
        }
        res.cookie('sca', null, { maxAge:0 });//清除cookie
    }else{//验证码过期
        return send(res, null, 401, '验证码过期');
    }
    const username = req.body.username;
    const password = req.body.password;
    poolQuery(system.sys_user.selectUserByLoginName([username])).then(async data => {
        if(data.length == 0){//没查到数据
            return send(res, null, 200, '用户不存在');
        }
        const currentUser = data[0];
        if(currentUser.password === md5(username + password + currentUser.salt + '_private')){//用户名+输入的密码+用户的盐加密+固定加密  和数据库密码对比
            const token = await setToken(username, password);
            const RedisKey = token.slice(-5);//取token的后五位
            setRedis(RedisKey, {}, process.env.REDISTIME || 1800);//初始化RedisKey的redis
            return send(res, token, 200);
        }
        send(res, null, 200, '密码错误');
    })
    
});

module.exports = router;
