const Redis = require('ioredis');
const redisConfig = {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    username: ''
}
const client = new Redis(redisConfig);// 默认监听6379端口,'127.0.0.1'为你本地ip(默认不需要修改)
module.exports = client;