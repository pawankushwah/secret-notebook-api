const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();

let getGuideMessages = require("./guide-messages.js")
let getSecretNotes = require("./secret-notes.js");
let login = require("./login.js")
let signup = require("./signup.js")
let getUserData = require("./getUserData.js")
let logout = require("./logout.js")
let setSecret = require("./setSecret.js")

const hostname = "127.0.0.1";
const port = 3333;

app.use(cors());

app.use("/getGuideMessages", getGuideMessages)
app.use("/getSecretNotes", getSecretNotes)
app.use("/login", login);
app.use("/signup", signup);
app.use("/getUserData", getUserData);
app.use("/logout", logout);
app.use("/setSecret", setSecret);

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.listen(port, hostname, () => {
    console.log(`server is running on http://${hostname}:${port}/`)
});
