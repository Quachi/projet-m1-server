const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const mongoose = require("mongoose")
const config = require("./config/database")

const Initialize = require("./config/init")

mongoose.connect(config.database, {useNewUrlParser: true})
mongoose.connection.on("connected", () =>  console.log(`Connected to DB ${config.database}`) )
mongoose.connection.on("error", err =>  console.log(`DB error : ${err}`) )


// Server settings
const init = new Initialize()
init.loadTypes()
const app = express()
const port =  8080

const profile = require("./routes/profiles")
const post = require("./routes/posts")
const media = require("./routes/medias")

// Middlewares
app.use(bodyParser.json())
// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())
require("./config/passport")(passport)


// Routes
app.use("/profile", profile)
app.use("/post", post)
app.use("/media", media)
app.get("/", (req, res) =>  res.status(200).send("First GET.") )


// Start the server
app.listen(port, () => console.log(`Listening to port #${port}`) )
