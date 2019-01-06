const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    name: {
        type: String,
    }
},{ timestamps: { createdAt: 'created_at' }});


userSchema.methods = {
    // authenticate: function (password) {
    //     return passwordHash.verify(password, this.password);
    // },
    // getToken: function () {
    //     return jwt.encode(this, config.secret);
    // }
};

module.exports = mongoose.model('User', userSchema);
