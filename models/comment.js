const mongoose = require("mongoose")

const CommentSchema = mongoose.Schema({
    user: {type: String, require: true},
    text: { type: String, require: true},
    timestamp: {type: Number, default: new Date().getTime()},
    type: String,
    context: {type: String, require: true}
})

const Comment = module.exports = mongoose.model("Comment", CommentSchema)
module.exports.getById = (id, callback) => Comment.findOne({id: id}, callback)