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

module.exports = router;
