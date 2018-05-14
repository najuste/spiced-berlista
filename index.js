const express = require("express");
const compression = require("compression");
const db = require("./db/db.js");
const bcrypt = require("bcryptjs");
const csurf = require("csurf");
const config = require("./config");
const s3 = require("./s3");

const app = express();

//------ SOCKET
const server = require("http").Server(app);
//server has to detect that first meet: handshake
const allowedOrigins = "localhost:* https://berlista.herokuapp.com:*";
const io = require("socket.io")(server, { origins: allowedOrigins });
//listing places from where you are accepting the connections

//------ SETTING COOKIES
var cookieSession = require("cookie-session");

const cookieSessionMiddleware = cookieSession({
    secret:
        process.env.SESSION_SECRET || require("./secrets.json").cookieSecret,
    maxAge: 1000 * 60 * 60 * 24 * 90
});

app.use(cookieSessionMiddleware);
io.use(function(socket, next) {
    //socket io can user the cookieSession middleware and the wrap into socket middleware
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

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
    const { firstname, lastname, email, password, lat, lng } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash, lat, lng)
                .then(results => {
                    const {
                        id,
                        firstname,
                        lastname,
                        email,
                        lat,
                        lng
                    } = results.rows[0];

                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email,
                        lat,
                        lng
                    };
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
                    errorMsg: "User with such email already registered"
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
    const { email, password } = req.body;
    console.log("Loggin route /login");
    return db
        .getDataByEmail(email)
        .then(results => {
            if (!results.rows.length) {
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
                            if (cookies.profilepic) {
                                cookies.profilepic =
                                    config.s3Url + cookies.profilepic;
                            }
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

//--- ---- from COOKIES

app.get("/user", function(req, res) {
    if (req.session.loggedin) {
        res.json({ user: req.session.loggedin });
    } else {
        //testing purposes when cookies  are short term
        delete res.session.loggedin;
    }
});

//--- ---- from db getting data about user from both tables
app.get("/get-user-info/:id", function(req, res) {
    let loggedin_id = req.session.loggedin.id;
    if (loggedin_id == req.params.id) {
        res.json({ user: "same" });
    } else {
        return db
            .getDataById(req.params.id)
            .then(results => {
                if (results.rows.length) {
                    let user = results.rows[0];
                    delete user["password"];
                    if (user.profilepic) {
                        user.profilepic = config.s3Url + user.profilepic;
                    }
                    return db
                        .getFriendshipStatus(loggedin_id, req.params.id)
                        .then(friendsResults => {
                            if (friendsResults.rows.length) {
                                let friendship = friendsResults.rows[0];
                                //
                                user.status = friendship["status"];
                                user.sender_id = friendship["sender_id"];
                                user.recipient_id = friendship["recipient_id"];
                            } else {
                                user.status = 0;
                            }
                            res.json({ user });
                        })
                        .catch(err => console.log(err));
                } else {
                    res.json({ user: "none" });
                }
            })
            .catch(err => console.log("Error fetching data", err));
        //do query
    }
});

//--- uploading user img
//uploader.single("file") //file must be the same var as in FORM name(!)
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    if (req.file) {
        return db
            .addProfilePic(req.file.filename, req.session.loggedin.id)
            .then(results => {
                req.session.loggedin.profilepic =
                    config.s3Url + results.rows[0].profilepic;
                res.json({ image: config.s3Url + results.rows[0].profilepic });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

//--- updating user bio
app.post("/bio", function(req, res) {
    if (req.body.bio) {
        return db.addBio(req.body.bio, req.session.loggedin.id).then(() => {
            res.json({
                success: true
            });
        });
    } else {
        res.json({
            success: false
        });
    }
});

// --- leting user sign on the handleWallSubmit
app.post("/profile-wall", function(req, res) {
    const { receiver, msg } = req.body;
    db
        .writeMsgToProfileWall(req.session.loggedin.id, receiver, msg)
        .then(results => {
            let currentMessage = results.rows;
            let currentUser = req.session.loggedin;
            Object.assign(currentMessage, currentUser);
            res.json({ message: results.rows });
        })
        .catch(err => console.log(err));
    //RESPONSE
});

app.get("/profile-wall/:id", function(req, res) {
    db
        .getMsgsToProfileWall(req.params.id)
        .then(results => {
            let messages = results.rows;
            messages.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
            });
            res.json({ messages });
        })
        .catch(err => console.log(err));
});

//---- FRIENDSHIP UPDATES

app.post("/sendFriendshipRequest", function(req, res) {
    return db
        .sendFriendshipRequest(
            req.session.loggedin.id,
            req.body.id,
            req.body.status
        )
        .then(results => {
            res.json({
                status: 1,
                senderId: results.rows[0].sender_id,
                recipientId: results.rows[0].recipient_id
            });
        })
        .catch(err => console.log("Error in sending friend req:", err));
});

app.post("/updateFriendshipRequest", function(req, res) {
    return db
        .updateFriendshipRequest(
            req.session.loggedin.id,
            req.body.id,
            req.body.status
        )
        .then(results => {
            res.json({
                status: results.rows[0].status,
                senderId: results.rows[0].sender_id,
                recipientId: results.rows[0].recipient_id
            });
        })
        .catch(err => console.log("Error update friend req:", err));
});

app.get("/friendsAndWannabes", function(req, res) {
    return db
        .getfriendsAndWannabes(req.session.loggedin.id)
        .then(results => {
            let users = results.rows;
            users.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
            });
            res.json({ users });
        })
        .catch(err => console.log("Error get friends and wannabes req:", err));
});

// ---- SEARCH user
app.get("/users/:str", function(req, res) {
    return db
        .getUsersByString(req.params.str)
        .then(results => {
            let users = results.rows;
            users.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
            });
            res.json({ users }); // returning an array of users that can be empty
        })
        .catch(err => console.log("Error from getting by userString", err));
});

// ---- MAP users on a GoogleMaps
app.get("/userslocation", function(req, res) {
    return db
        .getUsersLocation()
        .then(results => {
            let users = results.rows;
            users.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
            });
            res.json({ users });
        })
        .catch(err =>
            console.log("Error from getting all users with loc", err)
        );
});

//--- UNLOGGED EXPERIENCE

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
    if (req.session.loggedin && req.url == "/welcome") {
        res.redirect("/");
    } else if (!req.session.loggedin && req.url == "/") {
        res.redirect("/welcome");
    }
    res.sendFile(__dirname + "/index.html");
});

// here connecting with another server, thus not app.listen but server.listen
server.listen(process.env.PORT || 8080, function() {
    console.log("I'm listening...");
});

// --------------- SOCKETS ---------------

let onlineUsers = []; //storing users and msgs in memory
let messagesData = [];

io.on("connection", function(socket) {
    console.log(`socket with the id ${socket.id} is now connected`);

    if (!socket.request.session || !socket.request.session.loggedin) {
        return socket.disconnect(true);
    }
    const userId = socket.request.session.loggedin.id;
    onlineUsers.push({
        userId,
        socketId: socket.id
    });
    //there are situations, when users connect again, (another tab), but we should not open the new socket
    //So we need to check if it is in the list. //or push and then check if just once in the list and then emit
    const oneConnection = () =>
        onlineUsers.filter(ou => ou.userId == userId).length == 1
            ? true
            : false;

    if (oneConnection()) {
        socket.broadcast.emit("userJoined", {
            user: socket.request.session.loggedin
        });
    }

    //--- handle CHAT messages
    socket.emit("chatMessages", messagesData);

    socket.on("chatMessage", text => {
        const {
            id,
            firstname: firstName,
            lastname: lastName,
            profilepic: profilePic
        } = socket.request.session.loggedin;
        const timestamp = new Date(Date.now());

        const msg = {
            timestamp,
            text,
            user: { id, firstName, lastName, profilePic }
        };
        messagesData.push({
            timestamp,
            text,
            user: { id, firstName, lastName, profilePic }
        });
        io.sockets.emit("chatMessage", {
            msg
        });
    });

    // --- handle CHAT typing event
    socket.on("typing", function() {
        let name = socket.request.session.loggedin.firstname;
        io.sockets.emit("typing", { name });
    });

    let onlineUsersIds = onlineUsers.map(ou => ou.userId);
    db
        .getUsersOnline(onlineUsersIds)
        .then(results => {
            let users = results.rows;
            users.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
            });
            socket.emit("onlineUsers", {
                visitors: users
            });
        })
        .catch(err => console.log(err));

    socket.on("disconnect", function() {
        if (oneConnection()) {
            io.sockets.emit("userLeft", {
                id: userId
            });
        }

        onlineUsers = onlineUsers.filter(ou => ou.socketId !== socket.id);
        console.log(`socket with the id ${socket.id} is now disconnected`);
    });
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
