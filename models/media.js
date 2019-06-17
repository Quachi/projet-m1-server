const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const randomId = () => [...Array(64)].map(i=>(~~(Math.random()*36)).toString(36)).join('')

const MediaSchema = mongoose.Schema({
    id: {type: String, require: true, default: randomId()},
    data : {type: String, require: true},
})

const Media = module.exports = mongoose.model("Media", MediaSchema)

module.exports.getById = (id, callback) => Post.findOne({id: id}, callback)