let express = require("express");
let router = express.Router();

const messageBubbleMessageList = [
    ["Welcome to Secret Notes! Here you can read the secrets of other people"],
    ["You can change the page of the Secret book by clicking on the page or swiping the page"],
    ["If you want to create your own secret than you can click on the pen available on the right side of the secret book"],
    ["Now you are ready for the Enjoy the secrets. Have Fun!"]
]

router.post("/", (req, res) => {
    res.send(messageBubbleMessageList).status(200);
})

module.exports = router;