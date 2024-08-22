const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).send("Unauthorized: No token provided");
    }

    const bearerToken = token.split(" ")[1];

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .send("Unauthorized: Token Authentication Failed");
        }

        req.userId = decoded.sub; //adding decoded user to request object
        console.log("decode: ", JSON.stringify(decoded));
        next();
    });
}

async function createToken(userInfo) {
    const private
    const jwtToken = jwt.sign(
        {
            username: userInfo.username,
            email: userInfo.email,
            sub: userInfo.id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    return jwtToken;
}

module.exports = {
    verifyJWT,
    createToken,
};
