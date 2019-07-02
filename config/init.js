const Type = require("../models/type")
const Profile = require("../models/profile")

class Init {

    constructor() {
        this.typeList = ["test"]
    }

    loadTypes() {
        this.typeList.forEach(element => {
            Type.findOne({name: element}, (err, type) => {
                if(!err && type==null)
                    this.createType(element)
            })
        })
        console.log("Type loading done !")
    }
    createType(element) {
        const type = new Type({name: element})
        type.save()
    }
}
module.exports = Init