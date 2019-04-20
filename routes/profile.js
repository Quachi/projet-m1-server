const express = require("express")
const Profile = require("../models/profile")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const config = require("../config/database")

const router = express.Router()

// all users routes
router.post("/register", (req, res, next) => {
    let newProfile = new Profile({
        username: req.body.username,
        mail: req.body.mail,
        password: req.body.password,
    })
    console.log(newProfile)
    Profile.addProfile(newProfile, (err, profile) => {
        if(err)
            return res.status(403).send("Error when creating an account")
        console.log("New account !")
        res.status(200).send({success: true, message: "Profile created !"})
    })
})

router.post("/login", (req, res, next) => {
    console.log(req.body)
    console.log(req.body.username)
    console.log(typeof req.body.username)        
    const username = req.body.username
    const password = req.body.password
    Profile.getProfileByUsername(username, (err, profile) => {
        if(err) { throw(err) }
        if(!profile)
            res.status(401).send({success: false, message: "Profile not found"})
        Profile.comparePassword(password, profile.password, (err, match) => {
            if(err) { throw(err) }
            if(match) {
                const token = jwt.sign(profile.toJSON(), config.secret, {expiresIn: 604800})
                res.status(200).send({
                    success: true,
                    token: "JWT "+token,
                    profile: {id: profile._id, username: profile.username, mail: profile.mail}
                })
            }
            else { res.status(401).send({success: false, message: "Error when login"}) }
        })
    })
})

router.get("/logout", (req, res, next) => { res.status(200).send("logout") })

router.get("/profile", passport.authenticate("jwt", {session:false}), (req, res, next) => {
    const data = {username: req.profile.username, mail: req.profile.mail}
    res.status(200).send({success: true, profile: data})
 })


module.exports = router