const mysql = require('mysql');
require('./redis.js')
const config = {
    host : 'localhost',
    database : 'test',
    username : 'root',
    password : 'Zl739#*n!m96',
    port: 3306,
    connectionLimit: 10,
}

const pool = mysql.createPool({
    host: config.host, //数据库地址
    user: config.username,//用户名
    password: config.password,//密码
    database: config.database,//数据库名称
    port: config.port,
    timezone: '+08:00',
    connectionLimit: config.connectionLimit//一次创建的最大连接池数量
});



function poolQuery(sql){
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err){
                reject(err);
            };
            connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error){
                    reject(error);
                };
                resolve(results, fields);
            });
        })
    })
}

module.exports = poolQuery;