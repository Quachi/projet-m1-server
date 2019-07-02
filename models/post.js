const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const randomId = () => [...Array(64)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

const PostSchema = mongoose.Schema({
  id: { type: String, require: true, default: randomId() },
  user: { type: String, require: true },
  name: { type: String, require: true },
  description: { type: String, require: true },
  medias: [String],
  categories: [{ type: ObjectId, require: true, ref: 'Type' }],
  tags: [String],
  groupSize: { type: Number, require: true, default: 1 },
  attendees: { type: [String], default: [] },
  waitList: { type: [String], default: [] },
  unsub: { type: [String], default: [] },
  timestamp: { type: Number, require: true, default: new Date().getTime() },
  postal: { type: Number, require: true },
});

const Post = (module.exports = mongoose.model('Post', PostSchema));
module.exports.getById = (id, callback) => Post.findOne({ id: id }, callback);
