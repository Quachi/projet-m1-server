const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');

const Profile = require('../models/profile');
const config = require('../config/database');

const router = express.Router();
const upload = multer({
  fileFilter: (req, file, cb) => {
    switch (file.mimetype) {
      case 'image.png':
        cb(null, true);
        break;
      case 'image.jpeg':
        cb(null, true);
        break;
      default:
        cb(new Error('Wrong type !'));
        break;
    }
  },
});

router.post('/register', (req, res, next) => {
  Profile.findOne({ mail: req.body.mail }, (err, profile) => {
    if (profile != undefined) {
      res.status(409).send({ error: 'Email address already registered.' });
    }
  });
  let profile = new Profile(req.body);
  Profile.addProfile(profile, (err, profile) => {
    if (err) return res.status(403).send('Error when creating an account');
    res.status(200).send({ success: true, message: 'Profile created !' });
  });
});

router.post('/login', (req, res, next) => {
  Profile.findOne({ username: req.body.username }, (err, profile) => {
    if (err || !profile) {
      return res.status(401).send({ error: 'Wrong username' });
    }
    Profile.comparePassword(req.body.password, profile.password, (err, match) => {
      if (err) {
        return res.status(401).send({ error: 'Wrong password' });
      }
      if (match) {
        const data = {
          token: jwt.sign(profile.toJSON(), config.secret, { expiresIn: 604800 }),
          expiresIn: 604800,
        };
        return res.status(200).send(data);
      }
      res.status(401).send({ error: 'Error when login' });
    });
  });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  ['_id', 'password'].forEach(element => delete req.user[element]);
  res.status(200).send(req.user);
});

router.put('/me', passport.authenticate('jwt', { session: false }), upload.single('avatar'), (req, res, next) => {
  const randomid = () => [...Array(64)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
  const img = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  async.waterfall(
    [
      callback => {
        if (!img) {
          callback(null, req.body);
        }
        const media = new Media({ id: randomid, data: img });
        media.save((err, media) => {
          if (err) {
            callback(err, null);
          }
          req.body.avatar = media.id;
          callback(null, req.body);
        });
      },
      (data, callback) => {
        Profile.findOneAndUpdate({ id: req.user.id }, data, (err, profile) => {
          if (err) {
            callback(err, null);
          }
          delete profile._id;
          callback(null, profile);
        });
      },
    ],
    (err, data) => {
      if (err) {
        return res.status(400).send(err);
      }
      return res.status(200).send(data);
    },
  );
});

router.get('/:id', (req, res, next) => {
  const projections = { _id: 0, password: 0, __v: 0 };
  Profile.findOne({ id: req.params.id }, projections, (err, profile) => {
    if (err) {
      res.status(404).send();
    }
    return res.status(200).send(profile);
  });
});

module.exports = router;
