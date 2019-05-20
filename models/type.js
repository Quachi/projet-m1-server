const mongoose = require("mongoose")

const randomId= () => [...Array(64)].map(i=>(~~(Math.random()*36)).toString(36)).join('')
const TypeSchema = mongoose.Schema({
    name: {type: String, require: true},
    id: {type: String, require: true, default: randomId()}
})

const Type = module.exports = mongoose.model("Type", TypeSchema)