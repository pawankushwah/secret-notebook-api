const express = require("express");
const cookieParser = require("cookie-parser");
const { dbConnect, model } = require("./utils/models");
const bodyParser = require("body-parser");
const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieParser())

router.delete("/", async (req, res) => {
    let data = req.body;
    // now we will delete the user Session
    try {
        const msg = deleteToken({ refreshToken: data.refreshToken });
        return res.json(msg).status(200);
      } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Failed to delete token" }); // Handle error
      }
})

async function deleteToken(userData) {
    await dbConnect();
    const sessionTokenModel = await model("sessionToken");
    return await sessionTokenModel.deleteOne({ "refreshToken": userData.refreshToken });
}

module.exports = router;