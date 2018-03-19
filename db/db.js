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
