const jwt = require("jsonwebtoken");
const settings = require("../config/settings");

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, settings.secret, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.render("error", {
                    msg: "Oops! you are not Logined yet, Please Login.",
                });
            } else {
                res.locals.username = decodedToken.username;
                res.locals.id = decodedToken.id;
                res.locals.name = decodedToken.name;
                res.locals.role = decodedToken.role;
                next();
            }
        });
    } else {
        res.render("error", {
            msg: "Oops! you are not Logined yet, Please Login.",
        });
    }
};

module.exports = { requireAuth };
