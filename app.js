const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const mongoose = require("mongoose")
const config = require("./config/database")


mongoose.connect(config.database, {useNewUrlParser: true})
mongoose.connection.on("connected", () =>  console.log(`Connected to DB ${config.database}`) )
mongoose.connection.on("error", err =>  console.log(`DB error : ${err}`) )


// Server settings
const app = express()
const port =  8080
// const connect = require("./routes/comments")
const profile = require("./routes/profile")
// const search = require("./routes/search")
// const posts = require("./routes/posts")
// const comments = require("./routes/comments")


// Middlewares
app.use(bodyParser.json())
// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())
require("./config/passport")(passport)


// Routes
// app.use("connect/", connect)
app.use("/profile", profile)
// app.use("posts/", posts)
// app.use("search/", search)
// app.use("posts/", posts)
// app.use("comments/", comments)
app.get("/", (req, res) =>  res.status(200).send("First GET.") )


// Start the server
app.listen(port, () => console.log(`Listening to port #${port}`) )
