const spicedPg = require("spiced-pg");

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./../secrets.json");
}

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPass}@localhost:5432/socialnetwork`
);

//--- UsersForm Module uses register
exports.register = function(firstname, lastname, email, hash, lat, lng) {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password, lat, lng) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
        [firstname, lastname, email, hash, lat, lng]
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

//  in FRIENDS.js getting a list of all friends and wanabees

exports.getfriendsAndWannabes = function(user_id) {
    const q = `
    SELECT users.id, firstname, lastname, profilepic, status
    FROM friendships
    JOIN users
    ON (status = 1 AND recipient_id = $1 AND sender_id = users.id)
    OR (status = 2 AND recipient_id = $1 AND sender_id = users.id)
    OR (status = 2 AND sender_id = $1 AND recipient_id = users.id)`;
    return db.query(q, [user_id]);
};

exports.getUsersOnline = function(usersIdList) {
    return db.query(
        `SELECT id, firstname, lastname, profilepic
        FROM users
        WHERE users.id = ANY ($1)`,
        [usersIdList]
    );
};
// `SELECT users.id, firstname, lastname, profilepic, status
// FROM users
// LEFT JOIN friendships
// ON (sender_id = users.id OR recipient_id = users.id)
// WHERE users.id = ANY ($1)`
// EXTRA----- feature - fetching all users from the DB from user query

exports.writeMsgToProfileWall = function(sender_id, walluser_id, msg) {
    return db.query(
        `INSERT INTO messages (sender_id, walluser_id, msg) VALUES($1, $2, $3) RETURNING *`,
        [sender_id, walluser_id, msg]
    );
};
exports.getMsgsToProfileWall = function(walluser_id) {
    return db.query(
        `SELECT firstname, lastname, profilepic, sender_id, msg
        FROM messages
        JOIN users
        ON messages.sender_id = users.id
        WHERE walluser_id = $1
        ORDER BY messages.created_at DESC`,
        [walluser_id]
    );
};

exports.getUsersByString = function(searchString) {
    const q = `SELECT id, firstname, lastname, profilepic
    FROM users
    WHERE lower(firstname||' '||lastname) LIKE '%'||lower($1)||'%'`;
    // const q2 = `SELECT users.id firstname, lastname, profilepic, status
    // FROM users JOIN friendships
    // ON (users.id = recipient_id)
    // OR (users.id = sender_id)
    // WHERE lower(firstname||' '||lastname) LIKE '%'||lower($1)||'%'`;
    return db.query(q, [searchString]);
};

exports.getUsersLocation = function() {
    const q = `SELECT id, firstname, lastname, profilepic, lat, lng, bio
    FROM users`;
    // const q2 = `SELECT users.id, firstname, lastname, profilepic, lat, lng, bio, f.status
    // FROM users INNER JOIN friendships f
    // ON (users.id = f.sender_id)
    // INNER JOIN friendships fr
    // ON (users.id = fr.recipient_id)`;

    return db.query(q);
};

//status - for it i should get from friendship
