const {expressjwt: jwt} = require('express-jwt'); //解析JWT
const app = require('../config/app.js');
const send = require('../config/sendJson.js');
const { getRedis, timeSetRedis } = require('../utils/redis_util.js');
app.use(jwt({
    secret: process.env.SECRET || 'secret', // 签名的密钥 或 PublicKey
    algorithms: ["HS256"]
}).unless({
    path: ["/login","/captchaImage"]
}))

app.use(async (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return send(res, null, 401, 'token失效');
    }
    const RedisKey = (req.headers['authorization'] || "").slice(-5);//取token的后五位
    if(RedisKey){
        const RedisData = await getRedis(RedisKey);
        if(RedisData){//redis上有值
            timeSetRedis(RedisKey, process.env.REDISTIME || 1800);//更新redis失效时间
        }else{
            return send(res, null, 401, 'token失效');
        }
    }else{
        return send(res, null, 401, '无效token');
    }
    next();
});