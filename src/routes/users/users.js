const express = require('express');
const poolQuery = require('../../controllers/db.js');
const router = express.Router();
const system = require('../../controllers/system.js');

/* GET users listing. */
router.get('/users', function(req, res, next) {
  poolQuery(system.sys_user.selectUserByLoginName(['ry'])).then(data => {
    res.send({
      code: 200,
      data: data,
      message: '成功'
    });
  })
  
});

module.exports = router;
