const client = require('../controllers/redis.js');

/**
 * 
 * @param {string} key 
 * @param {object} value 
 * @param {number} time key的过期时间 单位为秒
 * @returns {Promise}
 */
async function setRedis(key, value, time) {
    // 存储
    const tempValue = JSON.stringify(value);
    await client.set(key, tempValue, (err, data) => {
        // 为key 设定一个时长 单位为S
        if(time){
            client.expire(key, time)
        }
        if (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(data);
    })
}
/**
 * 
 * @param {string} key 
 * @returns
 */
async function queryRedis(key) {
    const result = await client.exists(key);
    //  判断该值是否为空 如果为空返回null
    if (result === 0) {
        return null
    }
    return result
}
/**
 * 
 * @param {string} key 
 * @returns
 */
async function getRedis(key) {
    const result = await client.get(key);
    if (result === null) {
        return null
    }
    const tempValue = JSON.parse(result);
    return tempValue
}
/**
 * 
 * @param {string} key 
 * @param {number} time //key的过期时间
 * @returns
 */
async function timeSetRedis(key, time) {
    // 设定时间
    const result = await client.expire(key, time)
    if (result === 0) {
        return null
    }
    return result
}

async function hasKeyInRedis(key) {
    // 设定时间
    const result = await client.exists(key);
    if (result === 0) {
        return null
    }
    return result
}

module.exports = {
    setRedis,
    getRedis,
    queryRedis,
    timeSetRedis,
    hasKeyInRedis
}