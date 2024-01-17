const bodyParser = require("body-parser");
let express = require("express");
const { dbConnect, model } = require("./utils/models");
let router = express.Router();

const jwt = require("jsonwebtoken");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
    let data = req.body;
    const errors = validateData(data);
    if (Object.keys(errors).length !== 0) {
        console.log(errors);
        return res.json(errors);
    }

    await dbConnect();
    const usersModel = await model("users");
    const response = await usersModel.find({
        username: data.username
    });
    if (response.length != 1) return res.json({ login: 0, error: "Invalid username or password" });

    const isPasswordCorrect = checkPassword(response[0].password, data.password);
    if (response.length === 1 && isPasswordCorrect) {
        const jwtToken = await generateAccessToken({ username: response[0].username });
        const data = jwt.verify(jwtToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        const jwtRefreshToken = await generateRefreshToken({
            username: response[0].username,
            iat: data.iat,
            exp: data.exp
        });
        const cookiesData = jwtToken;
        res.cookie("token", cookiesData, { httpOnly: true })
        res.cookie("jwtRefreshToken", jwtRefreshToken, { httpOnly: true });
        res.cookie("userId", response[0]._id, { httpOnly: true });
        return res.json({ token: jwtToken, refreshToken: jwtRefreshToken, userId: response[0]._id, url: "dashboard", status: 307}).status(307);
    }
    return res.json({ errors: "Incorrect username or password" });
})

function validateData(data) {
    const errors = {};
    const passwordRegex = /^(?=.*[@#$&*!])(?=.*[a-z])(?=.*[A-Z]).{6,15}$/;

    if (!data.username.trim()) {
        errors.username = "Username is required";
    }
    if (!data.password) {
        errors.password = "Password is required";
    } else if (!data.password.match(passwordRegex)) {
        errors.error = "Invalid username or password";
    }
    return errors;
}

function checkPassword(storedPassword, userPassword) {
    if (storedPassword === userPassword) return true;
    return false;
}

async function generateAccessToken(userData, hasExpiredToken = false) {
    // if the user is logining up
    const newToken = jwt.sign(userData, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    if (!hasExpiredToken) return newToken;
  
    // if user has logined in but want to extend the expiration time
    // we will generate new token with new expiration time 
    // we will change the database by replacing access token with newAccessToken and putting the currentAccesToken into the blacklist
    const tokenExp = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET).exp;
    const username = userData.username;
    await dbConnect();
    const sessionTokenModel = await model("sessionToken");
    const currentSessionDataOfUser = await sessionTokenModel.find({ username });
    const currentBlacklist = await currentSessionDataOfUser.blackListedToken;
    const currentAccessToken = await currentSessionDataOfUser.accessToken;
    const result = await sessionTokenModel.updateOne(
      { username },
      {
        $set: {
          accessToken: { token: newToken, exp: tokenExp },
          blackListedToken: [...currentBlacklist, currentAccessToken],
        },
      }
    );
    console.log(result)
    return token;
  }
  
  async function generateRefreshToken(userData) {
    // it simply generates the new refreshtoken and put it into the database with its schema
    const token = jwt.sign(
      { username: userData.username },
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    const accessToken = generateAccessTokenWithNoExpiration(userData);
    await dbConnect();
    const sessionTokenModel = await model("sessionToken");
    const result = await sessionTokenModel.insertMany({
      username: userData.username,
      accessToken: { accessToken, exp: userData.exp },
      refreshToken: token,
      blackListedToken: [],
    });
    return token;
  }
  
  function generateAccessTokenWithNoExpiration(userData){
    return jwt.sign(userData, process.env.JWT_ACCESS_TOKEN_SECRET);
  }


module.exports = router;