const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId
const bcrypt = require("bcryptjs")

const ProfileSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    mail: {type: String, require: true},
    avatar: ObjectId,
    description: String,
    posts: [ObjectId],
    comments: [ObjectId],
    historyPosts: [ObjectId],
    historyComments: [ObjectId]
})

const UserSchema = mongoose.Schema({
    username: {type: String, required: true},
    mail: {type: String, required: true},
    password: {type: String, required: true, default: "haha"}
})

const Profile = module.exports = mongoose.model("Profile", ProfileSchema)

module.exports.getProfileById = (id, callback) => Profile.findById(id, callback)
module.exports.getProfileByUsername = (username, callback) => Profile.findOne({username:username}, callback)
module.exports.addProfile = (newUser, callback) => {
    bcrypt.genSalt(16, (err, salt) => {
        if(err) { throw(err) }
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password=hash
            newUser.save(callback)
        })
    })
}

module.exports.comparePassword = (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, match) => {
        if(err) { throw(err) }
        callback(null, match)
    })
}
