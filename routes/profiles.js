const express = require("express")
const Profile = require("../models/profile")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const config = require("../config/database")

const router = express.Router()

const projections = {_id: 0, username: 1, avatar: 1, description: 1, posts: 1, comments: 1}
const putOptions = {new: true, useFindAndModify: false}

router.post("/register", (req, res, next) => {
    Profile.findOne({mail: req.body.mail}, (err, profile) => {
        if(profile != undefined) { res.status(409).send({error: "Email address already registered."}) }
    })
    Profile.addProfile(req.body, (err, profile) => {
        if(err)
            return res.status(403).send("Error when creating an account")
        res.status(200).send({success: true, message: "Profile created !"})
    })
})

router.get("/login", (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    Profile.getProfileByUsername(username, (err, profile) => {
        if(err) { throw(err) }
        if(!profile) { res.status(401).send({success: false, message: "Profile not found"}) }
        Profile.comparePassword(password, profile.password, (err, match) => {
            if(err) { throw(err) }
            if(match) {
                const data = {

                    token: jwt.sign(profile.toJSON(), config.secret, {expiresIn: 604800}),
                    expiresIn: 604800
                }
                res.status(200).send(data)
            }
            else { res.status(401).send({"error": "Error when login"}) }
        })
    })
})

router.get("/logout", (req, res, next) => { res.status(200).send("logout") })

router.get("/me", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    ["_id", "password"].forEach(element => delete req.user[element])
    res.status(200).send(req.user)
})

router.put("/me", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    const id = req.body.id
    if(id != req.user.id) { return res.status(403).send({error: "Wrong id"}) }
    ["_id", "id", "username", "password", "mail", "posts", "comments", "historyPosts", "historyComments"].forEach(element => delete req.body[element])
    Profile.findOneAndUpdate({id: id}, {$set: req.body}, putOptions, (err, profile) => {
        if(err) { return res.status(500).send() }
        return res.status(204).send(profile)
    })
})

router.get("/:id", passport.authenticate("jwt", {session: false}), (req, res, next) => {
    if(req.user.id == req.params.id){
        ["_id", "password"].forEach(element => delete req.user[element])
        return res.status(200).status(req.user)
    }
    Profile.findOne({id: req.param.id}, projections, (err, profile) => {
        if(profile) { return res.status(200).send(profile) }
        return res.status(400).send({error: err})
    })
})


module.exports = router