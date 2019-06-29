const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const mongoose = require("mongoose")
const config = require("./config/database")
const cors = require('cors');


const Initialize = require("./config/init")
mongoose.connect(config.database, {useNewUrlParser: true})
mongoose.connection.on("connected", () =>  console.log(`Connected to DB ${config.database}`) )
mongoose.connection.on("error", err =>  console.log(`DB error : ${err}`) )
// Server settings
const init = new Initialize()
init.loadTypes()

let app = express();
app.use(cors());
const port =  8080

const profile = require("./routes/profiles")
const post = require("./routes/posts")
const comment = require("./routes/comments")
const media = require("./routes/medias")
const type = require("./routes/types")

// Middlewares
app.use(bodyParser.json())
// app.use(cors({ credentials: true, origin: '*' }));

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())
require("./config/passport")(passport)


// Routes

app.use("/profile", profile)
app.use("/post", post)
app.use("/comment", comment)
app.use("/media", media)
app.use("/type", type)
app.get("/", (req, res) =>  res.status(200).send("First GET.") )


// Start the server
app.listen(port, () => console.log(`Listening to port #${port}`) )



/**
 * modification d'une annonce
 * recherche d'annonce avec paramètres
 * recherche d'annonce
 */

/**
 * vue détaillé d'un profile (50%)
 * commenter une annonce
 * s'inscrire à une annonce
 * 
 */


 /**
  * modifier le profile
  * commenter un profile
  */