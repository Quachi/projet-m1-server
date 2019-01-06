const express = require('express');
const router = express.Router();
const userModel = require('../shema/schemaUser');
/* GET users listing. */
router.get('/', function(req, res, next) {
  // let user = new userModel({
  //   name:"Kevin",
  //   email:"test3@hotmail.com"
  // });
  userModel.find({}, (err, docs) => {
    console.log(docs);
  });
  res.send('respond with a resource');
});

module.exports = router;
