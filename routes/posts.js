const express = require("express")
const multer  = require('multer')
const passport = require("passport")
const mongoose = require("mongoose")
const async = require("async")
const sharp = require("sharp")

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

router.post("/new", passport.authenticate("jwt", {session: false}), upload.array("images", 4), (req, res, next) => {
    if(!req.is("multipart/form-data"))
        return res.status(400).send()
    async.parallel(req.files.map(img => function(callback) {
        let media = new Media({data: `data:${img.mimetype};base64,${img.buffer.toString("base64")}`})
        media.save((err, element) => {
            if(err) { callback(err, null) }
            callback(null, `/media/${element.id}`)
        })
    }), (err, data) => {
        if(err) { return res.status(500).send(err) }
        async.waterfall([ callback => {
            let post = new Post(req.body)
            post.media = data
            callback(null, post)
        }, (post, callback) => {
            Type.find({id: {$in: req.body.types}}, {id: 0, name: 0}, (err, types) => {
                if (err) { callback(err, numm) }
                types.forEach(type => post.typeId.push(type._id))
                callback(null, post)
            })
        }], (err, post) => {
            if(err) { return res.status(500).send(err) }
            post.save((err, post) => {
                if(err) { return res.status(400).send(err) }
                return res.status(201).send({id: post.id})
            })
        })
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