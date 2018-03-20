const spicedPg = require("spiced-pg");

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./../secrets.json");
}

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPass}@localhost:5432/socialnetwork`
);

//--- UsersForm Module uses register
exports.register = function(firstname, lastname, email, hash) {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password) VALUES($1, $2, $3, $4) RETURNING *`,
        [firstname, lastname, email, hash]
    );
};

//--- LOGIN - getting a hashed password
exports.getDataByEmail = function(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

// get user data
exports.getDataById = function(id) {
    let q = `SELECT * FROM users WHERE id = $1`;
    return db.query(q, [id]);
};

exports.addProfilePic = function(profilepic, id) {
    return db.query(
        `UPDATE users SET profilepic = $1 WHERE id = $2 RETURNING *`,
        [profilepic, id]
    );
};

exports.addBio = function(bio, id) {
    return db.query(`UPDATE users SET bio = $1 WHERE id = $2 RETURNING *`, [
        bio,
        id
    ]);
};

// friendships

exports.getFriendshipStatus = function(loggedin_id, user_id) {
    // SELECT * FROM friendships WHERE (sender_id = 1 OR recipient_id = 1) AND (sender_id = 3 OR recipient_id = 3) AND status != 0
    let q = `SELECT * FROM friendships
    WHERE (sender_id = $1 OR recipient_id = $1) AND (sender_id = $2 OR recipient_id = $2) AND (status =1 OR status=2)`;
    return db.query(q, [loggedin_id, user_id]);
};

exports.sendFriendshipRequest = function(sender_id, recipient_id, status) {
    //if sender_id or recipient_id is in a db, do update
    return db.query(
        `INSERT INTO friendships (sender_id, recipient_id, status) VALUES($1, $2, $3) RETURNING *`,
        [sender_id, recipient_id, status]
    );
};

exports.updateFriendshipRequest = function(sender_id, recipient_id, status) {
    return db.query(
        `UPDATE friendships SET status = $1
        WHERE status < 3
        AND (sender_id = $2 OR recipient_id = $2)
        AND (recipient_id = $3 OR sender_id = $3) RETURNING *`,
        [status, sender_id, recipient_id]
    );
};
