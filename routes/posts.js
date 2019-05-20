const express = require("express")
const passport = require("passport")
const mongoose = require("mongoose")
const async = require("async")

const Post = require("../models/post")
const Type = require("../models/type")

const router = express.Router()

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
                    post.types.push(type._id)
                })
                callback(null, post)
            })
        }
    ], (err, post) => {
        if(err) { res.status(400).send(err) }
        console.log("----------")
        console.log(post)
        console.log("----------")
        post.save((err, newPost) => {
            if(err) { return res.status(500).send({error: err}) }
            return res.status(201).send({id: newPost.id})
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