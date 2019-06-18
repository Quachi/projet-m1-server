const express = require("express")
const config = require("../config/database")
const passport = require("passport")

const Comment = require("../models/comment")
const type = {
    profile: require("../models/profile"),
    post: require("../models/post"),
}



const router = express.Router()


router.post("/new", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    if(req.body.type != "profile" && req.body.type != "post")
        return res.status(400).send({error: "Wrong comment type"})
    type[req.body.type].getById(req.body.context, (err, data) => {
        if(err) { return res.status(400).send(err) }
        let comment = new Comment(req.body)
        comment.user = req.user.id
        comment.save((err, comment) => {
            if(err) { return res.status(500).send(err) }
            return res.status(201).send()
        })
    })
})

router.get("/:type/:id")


router.get("/:id", (req, res) => {
    Media.findOne({id: req.params.id}, (err, media) => {
        if(err) { return res.status(400).send(err) }
        return res.status(200).send(media.data)
    })
})

module.exports = router