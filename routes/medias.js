const express = require('express');
const Media = require('../models/media');
const config = require('../config/database');

const router = express.Router();

router.get('/:id', (req, res) => {
  Media.findOne({ id: req.params.id }, (err, media) => {
    if (err) {
      return res.status(400).send(err);
    }
    return res.status(200).send(media.data);
  });
});

router.post("/", (req, res) => {
  Media.find({id : {$in: req.body.id}}, "id data", (err, medias) => {
    if(err) { return res.status(400).send(err) }
    return res.status(200).send()
  })
})

module.exports = router;
