const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const path = require("path");
const db = require("./db.js");
app.use(cors());

app.use(express.static("public"));

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use(express.json());

app.get("/reviews", (req, res) => {
    console.log("reviews requested in server");
    db.getReviews().then((results) => {
        console.log(results.rows);
        return res.json(results.rows);
    });
});

app.post("/send-review", (req, res) => {
    console.log("reviews: ", req.body);
    let username = req.body.username;
    let review = req.body.review;
    let selected = "false";
    db.insertReview(username, review, selected);
});

app.post("/update-selected", (req, res) => {
    console.log("update selected: ", req.body);
    let ids = req.body.selected;
    db.resetSelected().then(() => {
        ids.forEach((id) => {
            console.log("each id: ", id);
            db.updateSelected(id);
        });
    });
});

app.post("/update-selected-menu", (req, res) => {
    console.log("update selected menu: ", req.body);
    let ids = req.body.selected;
    db.resetSelectedMenu().then(() => {
        ids.forEach((id) => {
            console.log("each id: ", id);
            db.updateSelectedMenu(id);
        });
    });
});

app.post("/add-menu-item", (req, res) => {
    console.log("new item in server: ", req.body);
    let name = req.body.name;
    let ingredients = req.body.ingredients;
    let price = req.body.price;
    let selected = req.body.selected;
    db.insertMenuItem(name, ingredients, price, selected);
});

app.get("/menu-items", (req, res) => {
    console.log("reviews requested in server");
    db.getMenuItems().then((results) => {
        console.log(results.rows);
        return res.json(results.rows);
    });
});

app.post("/send-login-data", (req, res) => {
    console.log("login data in server: ", req.body);
    db.checkLoginData(req.body.user).then((result) => {
        console.log("login results: ", result.rows);
        return result.rows
    }).then((result)=> {
        if (result.length>0) {
            return res.json({success: true})
        } else {
            return res.json({success: false})
        }
    });
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
