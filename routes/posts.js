const express = require('express');
const multer = require('multer');
const passport = require('passport');
const async = require('async');

const Post = require('../models/post');
const Media = require('../models/media');
const Type = require('../models/type');

const router = express.Router();

const upload = multer({
  fileFilter: (req, file, cb) => {
    switch (file.mimetype) {
      case 'image/png':
        cb(null, true);
        break;
      case 'image/jpeg':
        cb(null, true);
        break;
      default:
        cb(new Error('Wrong type !'));
        break;
    }
  },
});

const subPost = (post, user) => {
  if (post.attendees.length < post.groupSize && !post.waitList.filter(el => el == user).length) {
    post.waitList.push(user);
  } else {
    post.attendees.push(user);
  }
  post.save((err, post) => {
    delete post._id;
    delete post.unsub;
    return post != undefined ? post : err;
  });
};

const unsubPost = (post, user) => {
  post.attendees = post.attendees.filter(el => el != user);
  post.unsub.push(user);
  if (post.attendees.length != post.groupSize && post.waitList.length) {
    post.attendees.push(post.waitList[0]);
    post.waitList.shift();
  }
  post.save((err, post) => {
    delete post._id;
    delete post.unsub;
    return post != undefined ? post : err;
  });
};
const imgToUrl = img => {
  const [server, port] = ['localhost', '8080'];
  return img.map(value => `http://${server}:${port}/media/${value}`);
};

router.post('/new', passport.authenticate('jwt', { session: false }), upload.array('images', 4), (req, res) => {
  const randomId = () => [...Array(64)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
  const media = req.files.map(img => {
    const image = { id: randomId(), data: `data:${img.mimetype};base64,${img.buffer.toString('base64')}` };
    return image;
  });
  async.waterfall(
    [
      callback => {
        Type.find({ id: { $in: req.body.categories } }, { _id: 1 }, (err, types) => {
          if (err) {
            callback(err, null);
          }
          req.body.categories = types;
          callback(null, req.body);
        });
      },
      (data, callback) => {
        Media.insertMany(media, (err, medias) => {
          if (err) {
            callback(err, null);
          }
          data['medias'] = medias.map(img => img.id);
          callback(null, data);
        });
      },
    ],
    (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      data.user = req.user.id;
      const post = new Post(data);
      post.postal = post.postal ? post.postal : req.user.postal;
      post.save((err, post) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.status(201).send({ id: post.id });
      });
    },
  );
});

router.put('/join/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return res.status(404).send();
    }
    if (post.user === req.user.id || post.unsub.filter(user => user === req.user.id).length())
      return res.status(400).send({ error: "Can't join the group" });
    const len = post.attendees.filter(user => user === req.user.id).length;
    const data = len ? subPost(post, req.user.id) : unsubPost(post, req.user.id);
    res.status(200).send(data);
  });
});

router.get('/search', (req, res) => {
  let conditions = {};
  const page = req.query.page ? req.query.page : 0;
  if (req.query.categories && req.query.tags) {
    conditions[$and] = [
      {
        $or: req.query.categories.split(',').map(element => {
          return { categories: element };
        }),
      },
      {
        $or: req.query.tags.split(',').map(element => {
          return { categories: element };
        }),
      },
    ];
  } else if (req.query.categories)
    conditions['$or'] = req.query.categories.split(',').map(element => {
      return { categories: element };
    });
  else if (req.query.tags)
    conditions['$or'] = req.query.categories.split(',').map(element => {
      return { tags: element };
    });
  if (req.query.name) {
    conditions['name'] = { $regex: new RegExp(req.query.name, 'i') };
  }
  if (req.query.postal) {
    conditions['postal'] = req.query.postal;
  }
  Post.find(conditions, { _id: 0 }, { skip: page, limit: page + 10 }, (err, posts) => {
    if (err) {
      return res.status(404).send();
    }
    posts.forEach((value, index) => {
      ['__id', 'description', 'waitList', 'unsub', 'postal', '__v'].forEach(key => delete posts[index][key]);
      posts[index].medias = imgToUrl(posts[index].medias);
      posts[index].medias.splice(1);
    });
    return res.status(200).send(posts);
  });
});

router.get('/:id', (req, res, next) => {
  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return res.status(404).send();
    }
    ['_id', '__v', 'unsub'].forEach(key => delete post[key]);
    post.medias = imgToUrl(post.medias);
    return res.status(200).send(post);
  });
});

router.put('/:id', passport.authenticate('jwt', { session: false }), upload.array('images', 4), (req, res, next) => {
  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return res.status(404).send();
    }
    if (post.user != req.user.id) {
      return res.status(405).send({ error: 'Cannot modify this post' });
    }
  });
  const randomId = () => [...Array(64)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
  const media = req.files.map(img => {
    const image = { id: randomId(), data: `data:${img.mimetype};base64,${img.buffer.toString('base64')}` };
    return image;
  });
  async.waterfall(
    [
      callback => {
        if (!req.body.categories) {
          callback(null, req.body);
        }
        Type.find({ id: { $in: req.body.categories } }, { _id: 1 }, (err, types) => {
          if (err) {
            callback(err, null);
          }
          req.body.categories = types;
          callback(null, req.body);
        });
      },
      (data, callback) => {
        Media.insertMany(media, (err, medias) => {
          if (err) {
            callback(err, null);
          }
          data['medias'] = medias.map(img => img.id);
          callback(null, data);
        });
      },
    ],
    (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      ['name', 'user', 'attendees', 'waitList', 'unsub'].forEach(element => delete data[element]);
      Post.findOneAndUpdate({ id: data.id }, data, (err, post) => {
        if (err) {
          return res.status(500).send(err);
        }
        ['_id', '__v'].forEach(key => delete post[key]);
        return res.status(200).send(post);
      });
    },
  );
});

module.exports = router;
