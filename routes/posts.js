const express = require("express")
const multer  = require('multer')
const passport = require("passport")
const mongoose = require("mongoose")
const async = require("async")

const Post = require("../models/post")
const Type = require("../models/type")

const router = express.Router()
// const upload = multer({ dest: 'uploads/' })

const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        switch(file.mimetype) {
            case "image/png": cb(null, true); break
            case "image/jpeg": cb(null, true); break
            default: cb(new Error("Wrong type !")); break
        }
    }
})

/**
 * create post (POST)
 * modify post (PUT)
 * see post (GET)
 * delete post (DELETE)
 * search posts (GET)
 */

router.post("/new", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    async.waterfall([
        callback => {
            let post = new Post(req.body)
            callback(null, post)
        },
        (post, callback) => {
            Type.find({id: {$in: req.body.types}}, {id: 0, name: 0}, (err, types) => {
                if(err) { callback(err, null) }
                types.forEach(type => {
                    post.typeId.push(type._id)
                })
                callback(null, post)
            })
        }
    ], (err, post) => {
        if(err) { res.status(400).send(err) }
        post.save((err, newPost) => {
            if(err) { return res.status(500).send({error: err}) }
            return res.status(201).send({id: newPost.id})
        })
    })
})

router.post("/upload", passport.authenticate("jwt", {session: false}), upload.single("avatar"), (req, res, next) => {
    if(req.is("multipart/form-data") != false)
    res.status(200).send()
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