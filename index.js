const express = require("express");
const compression = require("compression");
const db = require("./db/db.js");
const bcrypt = require("bcryptjs");
const csurf = require("csurf");
const config = require("./config");
const s3 = require("./s3");

const app = express();

//------ SETTING COOKIES
var cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret:
            process.env.SESSION_SECRET ||
            require("./secrets.json").cookieSecret,
        maxAge: 1000 * 60 * 10
        // maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());
app.use(function(req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(compression());

app.use(express.static("./public"));

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//--- REGISTERING A USER

app.post("/register", function(req, res) {
    console.log("Route /register");
    const { firstname, lastname, email, password } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash)
                .then(results => {
                    console.log(
                        "Got data from inserting into db, ",
                        results.rows[0]
                    );
                    const { id, firstname, lastname, email } = results.rows[0];

                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email
                    };

                    console.log("Setting cookies", req.session.loggedin);
                    res.json({
                        success: true,
                        loggedin: true,
                        user: req.session.loggedin
                    });
                });
        })
        .catch(err => {
            if (err.code == "23505") {
                console.log(err, "Same email");
                res.json({
                    success: false,
                    errorMsg:
                        "User with an email you just typed in already registered"
                });
            } else {
                console.log(err, "Undefined error occured, please try again");
                res.json({
                    success: false,
                    errorMsg: "Undefined error occured, please try again"
                });
            }
        });
});

app.post("/login", function(req, res) {
    console.log("Route /login", req.body);
    const { email, password } = req.body;
    console.log("Loggin route /login", req.body);
    return db
        .getDataByEmail(email)
        .then(results => {
            console.log("results from getDataByEmail", results.rows);
            if (!results.rows.length) {
                console.log("The email has not been registered yet");
                res.json({
                    success: false,
                    errorMsg:
                        "The email you have entered has not been registered yet. Please check if you typed it correctly or register"
                });
            } else {
                let hashedPassword = results.rows[0].password;
                return checkPassword(password, hashedPassword).then(
                    matching => {
                        if (!matching) {
                            console.log("Ups, the password did not match");
                            res.json({
                                success: false,
                                errorMsg:
                                    "The password you have entered did not match the given email"
                            });
                        } else {
                            //matching password ! setting cookies
                            let cookies = results.rows[0];
                            cookies.profilepic =
                                config.s3Url + cookies.profilepic;

                            console.log("Logged in cookies:", cookies);

                            req.session = {
                                loggedin: cookies
                            };
                            res.json({
                                success: true
                            });
                        }
                    }
                );
            }
        })
        .catch(err => console.log(err));
});

//--- GETTING USER DATA

app.get("/user", function(req, res) {
    console.log(req.session.loggedin);

    if (req.session.loggedin) {
        //i have all data from cookies, no db request shall be made
        res.json({ user: req.session.loggedin });
    } else {
        console.log("there is a problem, user is not logged in...");
        res.redirect("/welcome");
    }
});

//--- uploading the user img
app.post("/upload", uploader.single("profilepic"), s3.upload, (req, res) => {
    if (req.file) {
        console.log("Successfull upload", req.file.filename);
        return db
            .addProfilePic(req.file.filename, req.session.loggedin.id)
            .then(results => {
                //returning all data for now
                console.log("Results from db", results.rows[0].profilepic);
                //results.image = config.s3Url + results.image;
                req.session.loggedin.profilepic =
                    config.s3Url + results.rows[0].profilepic;
                res.json({ image: config.s3Url + results.rows[0].profilepic });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        console.log("Fail... upload");
        res.json({
            success: false
        });
    }
});

//--- updating user bio
app.post("/bio", function(req, res) {
    console.log("Inside route /bio, results:", req.body);

    if (req.body.bio) {
        return db
            .addBio(req.body.bio, req.session.loggedin.id)
            .then(results => {
                console.log("Results from addBio", results);
                res.json({
                    success: true
                });
            });
    } else {
        console.log("Fail... update");
        res.json({
            success: false
        });
    }

    //update cookies!
});

app.get("/welcome", function(req, res) {
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/", function(req, res) {
    if (!req.session.loggedin) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("*", function(req, res) {
    // if (req.session.loggedin && req.url == "/welcome") {
    //     res.redirect("/");
    // } else if (!req.session.loggedin && req.url == "/") {
    //     res.redirect("/welcome");
    // }
    res.sendFile(__dirname + "/index.html");
});

app.listen(8080, function() {
    console.log("I'm listening.");
});

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
