const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const Profile = require("../models/profile")
const config = require("../config/database")

module.exports = passport => {
    let options = {}

    options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    options.secretOrKey = config.secret
    
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        Profile.getProfileById(jwt_payload._id, (err, profile) => {
            if(err)
                return(done(err, false))
            if(profile)
                return(done(null, user))
            else
                return(done (null, false))
        })
    }))
}
