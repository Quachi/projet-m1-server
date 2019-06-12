const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const randomId = () => [...Array(64)].map(i=>(~~(Math.random()*36)).toString(36)).join('')

const PostSchema = mongoose.Schema({
    id: {type: String, require: true, default: randomId()},
    userId : {type: String, require: true},
    name: {type: String, require: true},
    description: {type: String, default: "No description"},
    typeId: [{type: ObjectId, require: true, ref: "Type"}],
    medias: [ObjectId],
    users: {type: [ObjectId], default: [], ref: "Profile"},
    likes: {type: Number, require: true, default: 1},
    tags: [String]
})

const Post = module.exports = mongoose.model("Post", PostSchema)

module.exports.getById = (id, callback) => Post.findOne({id: id}, callback)