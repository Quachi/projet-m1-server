const express = require('express');
const config = require('../config/database');
const passport = require('passport');

const Comment = require('../models/comment');
const type = {
  profile: require('../models/profile'),
  post: require('../models/post'),
};

const router = express.Router();

router.post('/new', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (req.body.type != 'profile' && req.body.type != 'post')
    return res.status(400).send({ error: 'Wrong comment type' });
  type[req.body.type].getById(req.body.context, (err, data) => {
    if (err) {
      return res.status(400).send(err);
    }
    let comment = new Comment(req.body);
    comment.user = req.user.id;
    comment.save((err, comment) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(201).send();
    });
  });
});

router.get('/:type/:id', (req, res, next) => {
  if (req.body.type != 'profile' && req.body.type != 'post') next();
  type[req.params.type].find({ context: req.params.id }, { _id: 0, context: 0, type: 0 }, (err, comments) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send({ data: comments });
  });
});

router.get('/:id', (req, res) => {
  Media.findOne({ id: req.params.id }, (err, media) => {
    if (err) {
      return res.status(400).send(err);
    }
    return res.status(200).send(media.data);
  });
});
router.put('/:id', passport.authenticate('jwt', { seesion: false }), (req, res, next) => {
  Comment.find({ id: req.params.id }, (err, comment) => {
    if (err) {
      res.status(400).send(err);
    }
    if (comment.id != req.params.user) {
      return res.status(403).send({ error: "Cannot modify someone else's comment." });
    }
  });
});

module.exports = router;
