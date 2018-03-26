const express = require("express");
const compression = require("compression");
const db = require("./db/db.js");
const bcrypt = require("bcryptjs");
const csurf = require("csurf");
const config = require("./config");
const s3 = require("./s3");

const app = express();

//------ SOCKET
const server = require("http").Server(app); //server has to detect that first meet: handshake
const io = require("socket.io")(server, { origins: "localhost:8080" });

//listing places from where you are accepting the connections
// so socket io is listening for connections, so it would be your actual site

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
    const { firstname, lastname, lat, lng, email, password } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash, lat, lng)
                .then(results => {
                    // console.log(
                    //     "Got data from inserting into db, ",
                    //     results.rows[0]
                    // );
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

                    // console.log("Setting cookies", req.session.loggedin);
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
            console.log("results from getDataByEmail");
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
                            if (cookies.profilepic) {
                                cookies.profilepic =
                                    config.s3Url + cookies.profilepic;
                            }
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

//--- ---- from COOKIES

app.get("/user", function(req, res) {
    // console.log('It is me in:', req.session.loggedin);
    if (req.session.loggedin) {
        //i have all data from cookies, no db request shall be made
        res.json({ user: req.session.loggedin });
    } else {
        console.log("there is a problem, user is not logged in...");
        //testing purposes when cookies  are short term
        delete res.session.loggedin;
    }
});

//--- ---- from db getting data about user from both tables

app.get("/get-user-info/:id", function(req, res) {
    let loggedin_id = req.session.loggedin.id;
    console.log("Session id", req.session.loggedin, req.params);
    if (loggedin_id == req.params.id) {
        console.log("same user as requested profile");
        res.json({ user: "same" });
    } else {
        return db
            .getDataById(req.params.id)
            .then(results => {
                if (results.rows.length) {
                    // console.log("Got other user:", results.rows);
                    let user = results.rows[0];
                    delete user["password"];
                    if (user.profilepic) {
                        user.profilepic = config.s3Url + user.profilepic;
                    }
                    // console.log("Friendship state with:", req.params.id);
                    return db
                        .getFriendshipStatus(loggedin_id, req.params.id)
                        .then(friendsResults => {
                            console.log("Friendships:", friendsResults.rows);
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
            .catch(err => console.log("Error fetching data".err));
        //do query
    }
    // if (req.session.loggedin) {
    //     //i have all data from cookies, no db request shall be made
    //     res.json({ user: req.session.loggedin });
    // } else {
    //     console.log("there is a problem, user is not logged in...");
    //     res.redirect("/welcome");
    // }
});

//--- uploading the user img
//uploader.single("file") //file must be the same var as in FORM name(!)
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("Route /upload");
    if (req.file) {
        // console.log("Successfull upload", req.file.filename);
        return db
            .addProfilePic(req.file.filename, req.session.loggedin.id)
            .then(results => {
                //returning all data for now
                // console.log("Results from db", results.rows[0].profilepic);
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
    // console.log("Inside route /bio, results:", req.body);

    if (req.body.bio) {
        return db
            .addBio(req.body.bio, req.session.loggedin.id)
            .then(results => {
                console.log("Results from addBio");
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

//---- FRIENDSHIP UPDATES

app.post("/sendFriendshipRequest", function(req, res) {
    console.log("In route", req.body.id, req.body.status);
    return db
        .sendFriendshipRequest(
            req.session.loggedin.id,
            req.body.id,
            req.body.status
        )
        .then(results => {
            console.log(results.rows);
            res.json({
                status: 1,
                senderId: results.rows[0].sender_id,
                recipientId: results.rows[0].recipient_id
            });
        })
        .catch(err => console.log("Error send friend req:", err));
});

app.post("/updateFriendshipRequest", function(req, res) {
    // console.log("In route", req.body.id, req.body.status);
    return db
        .updateFriendshipRequest(
            req.session.loggedin.id,
            req.body.id,
            req.body.status
        )
        .then(results => {
            console.log("Updating friendship:", results.rows[0], "status");
            res.json({
                status: results.rows[0].status,
                senderId: results.rows[0].sender_id,
                recipientId: results.rows[0].recipient_id
            });
        })
        .catch(err => console.log("Error update friend req:", err));
});

app.get("/friendsAndWannabes", function(req, res) {
    console.log("In route get all friends and wanabees");
    return db
        .getfriendsAndWannabes(req.session.loggedin.id)
        .then(results => {
            // console.log("Getting all friends and wannabes", results.rows);
            let users = results.rows;
            users.map(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
                // return user.profilepic
            });
            // console.log("Got all friends and wannabes", users);
            res.json({ users });
        })
        .catch(err => console.log("Error get friends and wannabes req:", err));
});

// ---- SEARCH user
app.get("/users/:str", function(req, res) {
    //req.params.userString
    // console.log("Inside users/string", req.params.str);
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

// ---- MAP users on a Google Maps
app.get("/userslocation", function(req, res) {
    return db
        .getUsersLocation()
        .then(results => {
            console.log(results);
            res.json({ users: results.rows });
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

// here you sould tell that thre is another server you have created
//not app.listen, but server.listen
server.listen(8080, function() {
    console.log("I'm listening.");
});

// SOCKETS
let onlineUsers = []; //we'll just store online users here in memory

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

    // console.log("Initial users online", onlineUsers);

    //there are sit, when users connects, (another tab), but we should not open the new socket
    //So we need to check if it is in the list. //or push and then check if just once in the list and then emit

    const oneConnection = () =>
        onlineUsers.filter(ou => ou.userId == userId).length == 1
            ? true
            : false;

    if (oneConnection()) {
        socket.broadcast.emit("userJoined", {
            user: socket.request.session.loggedin
        });
    } else {
        // console.log(`Same user just opened another tab`);
    }

    //getting data from db about connected users
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

    //for sending a msg to client, one has to emit the event
    // socket.emit("welcome", {
    //     message: "Welome. It is nice to see you"
    // });
    //
    // socket.on("thanks", function(data) {
    //     console.log(data);
    // });

    socket.on("disconnect", function() {
        if (oneConnection()) {
            io.sockets.emit("userLeft", {
                id: userId
            });
            // console.log(`User left`, userId);
        } else {
            // console.log(`Same user just closed a tab, still some tab running`);
        }

        onlineUsers = onlineUsers.filter(ou => ou.socketId !== socket.id);
        // console.log("Removing the entry:", socket.id, onlineUsers);
        console.log(`socket with the id ${socket.id} is now disconnected`);
    });
    // console.log("Users online after disconnecting", onlineUsers);
});

// server sends events onlineUsers, userJoined, userLeft

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
