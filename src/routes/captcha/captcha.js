const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const send = require('../../config/sendJson.js')
const svgCaptchaOptions = {
    size: 4,
    ignoreChars: 'Ooi1lvuI',
    noise: 4,
    color: true,
}

/* GET users listing. */
router.get('/captchaImage', async function(req, res, next) {
    const captcha = svgCaptcha.create(svgCaptchaOptions);
    const captchaCode = captcha.text.toLowerCase();
    res.cookie('sca',captchaCode,{
        maxAge: 600 * 1000,//60秒后过期
        signed: true,//使用签名模式
        path: "/",
        httpOnly: true
    })
    send(res, captcha.data, 200)
});

module.exports = router;
