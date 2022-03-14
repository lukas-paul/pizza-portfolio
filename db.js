const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbPassword = "postgres";
const database = "pizza";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUsername}:${dbPassword}@localhost:5432/${database}`
);

module.exports.getReviews = () => {
    return db.query(`SELECT * FROM reviews ORDER BY id DESC LIMIT 10`);
};

module.exports.selectReviews = (id) => {
    let params = [id];
    return db.query(``);
};

module.exports.insertReview = (username, review, selected) => {
    let params = [username, review, selected];
    return db.query(
        `INSERT INTO reviews (username, review, selected) VALUES ($1, $2, $3)`,
        params
    );
};

module.exports.resetSelected = () => {
    return db.query(`UPDATE reviews SET selected = 'false';`);
};

module.exports.resetSelectedMenu = () => {
    return db.query(`UPDATE menu SET selected = 'false';`);
};

module.exports.updateSelected = (id) => {
    const params = [id];
    console.log("update: ", params);
    return db.query(`UPDATE reviews SET selected='true' WHERE id=$1`, params);
};

module.exports.updateSelectedMenu = (id) => {
    const params = [id];
    console.log("update: ", params);
    return db.query(`UPDATE menu SET selected='true' WHERE id=$1`, params);
};

module.exports.insertMenuItem = (name, ingredients, price, selected) => {
    let params = [name, ingredients, price, selected];
    return db.query(
        `INSERT INTO menu (name, ingredients, price, selected) VALUES ($1, $2, $3, $4)`,
        params
    );
};

module.exports.getMenuItems = () => {
    return db.query(`SELECT * FROM menu ORDER BY id DESC LIMIT 10`);
};

module.exports.checkLoginData = (user) => {
    let params = [user];
    return db.query(`SELECT * FROM userdata WHERE username=$1`, params);
};
