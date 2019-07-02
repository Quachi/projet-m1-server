const express = require('express');
const config = require('../config/database');

const Type = require('../models/type');
const router = express.Router();

// router.post("/new", (req, res, next) => {
//     const type = new Type(req.body)
//     type.save((err, type) => {
//         if(err) { return res.status(400).send(err) }
//         return res.status(200).send({id: type.id})
//     })
// })

router.get('/', (req, res, next) => {
  Type.find({}, { _id: 0, __v: 0 }, (err, types) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send({ data: types });
  });
});

router.get('/:id', (req, res, next) => {
  const projections = { _id: 0, password: 0, __v: 0 };
  Type.findOne({ id: req.params.id }, projections, (err, profile) => {
    if (err) {
      res.status(404).send();
    }
    return res.status(200).send(profile);
  });
});

module.exports = router;
