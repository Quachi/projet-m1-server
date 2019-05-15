const jsonwebtoken = require("passport-jwt")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const Profile = require("../models/profile")
const config = require("../config/database")




module.exports = passport => {
    let options = {
        "jwtFromRequest": ExtractJwt.fromAuthHeaderAsBearerToken(),
        "secretOrKey": config.secret
    }
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        Profile.getProfileById(jwt_payload.id, (err, profile) => {
            if(err) { return done(err, false) }
            if(profile) { return done(null, profile) }
            else { return done(null, false) }
        })
    }))
}
