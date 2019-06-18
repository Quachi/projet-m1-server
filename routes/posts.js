const express = require("express")
const multer  = require('multer')
const passport = require("passport")
const mongoose = require("mongoose")
const async = require("async")

const Post = require("../models/post")
const Media = require("../models/media")
const Type = require("../models/type")

const router = express.Router()
const upload = multer({
    fileFilter: (req, file, cb) => {
        switch(file.mimetype) {
            case "image/png": cb(null, true); break
            case "image/jpeg": cb(null, true); break
            default: cb(new Error("Wrong type !")); break
        }
    }
})


router.post("/new", passport.authenticate("jwt", {session: false}), upload.array("images", 4), (req, res) => {
    const randomId = () => [...Array(64)].map(i=>(~~(Math.random()*36)).toString(36)).join('')
    const media = req.files.map(img => {
        const image =  {id: randomId(), data: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`}
        return image
    })
    async.waterfall([
        callback => {
            Type.find({"id": {$in: req.body.categories}}, {_id: 1}, (err, types) => {
                if(err) { callback(err, null) }
                let data = req.body
                data.categories = types
                callback(null, data)
            })
        }, (data, callback) => {
            Media.insertMany(media, (err, medias) => {
                if(err) {callback(err, null)}
                data["medias"] = medias.map(img => img.id)
                callback(null, data)
            })
        }
    ], (err, data) => {
        data.user = req.user.id
        const post = new Post(data)
        post.save((err, post) => {
            if(err) { return res.status(500).send(err) }
            return res.status(201).send({id: post.id})
        })
    })
})

router.put("/subscribe/:id", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    Post.findOne({id: req.params.id}, (err, post) => {
        if(err)
            return res.status(404).send(err)
        if(post.user == req.user.id)
            return res.status(403).send({error: "Cannot subscribe: it is your own post"})
        if(post.group != post.group.filter(user => user != req.user.id)) {
            post.group = post.group.filter(user => user != req.user.id)
            post.save((err, post) => {
                if(err) { return res.status(500).send(err) }
                delete post._id
                return res.status(205).send(post)
            })
        }
        if(post.groupSize > post.group.length) {
            post.group.push(req.user.id)
            post.save((err, post) => {
                if(err) { return res.status(500).send(err) }
                delete post._id
                return res.status(200).send(post)
            })
        }
        res.status(403).send({error: "Cannot subscribe : the group is full"})
    })
})

router.get("/:id", (req, res, next) => {
    Post.findOne({id:req.params.id}, (err, post) => {
        if(err) { return res.status(404).send() }
        delete post._id
        return res.status(200).send(post)
    })
})

router.put("/:id", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    req.user.posts.forEach(element => {
        if(element == req.params.id) {
            Post.findByIdAndUpdate({id:req.params.id}, req.body, (err, post) => {
                if(err) { return res.status(500).send({error: err}) }
                delete post._id
                return res.status(200).send(post)
            })
        }
    })
    return res.status(403).send()
})

module.exports = router
