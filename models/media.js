const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const MediaSchema = mongoose.Schema({
    id: {type: String, require: true},
    data : {type: String, require: true},
})

const Media = module.exports = mongoose.model("Media", MediaSchema)

module.exports.getById = (id, callback) => Post.findOne({id: id}, callback)