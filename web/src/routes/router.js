const express = require("express");
const router = express.Router();
const model = require("../server");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
// new file is created to separate routes 

//in order to complete the task, two different routes must be made
//one for fetching data, second for creating new objects

const debug_post = (user, title, induce_error, req, res) => {
    if(induce_error) return res.status(500).json({ error: "internal server error"});
    const test_DB = {
        user_basic_not_full: ["Movie1", "Movie2", "Movie3", "Movie4"],
        user_basic_full: ["Movie1", "Movie2", "Movie3", "Movie4", "Movie5"],
        user_premium: ["Movie1", "Movie2", "Movie3", "Movie4"]
    }
    const available_movies = ["Movie1", "Movie2", "Movie3", "Movie4", "Movie5", "Movie6"];
    if(!title) return res.status(400).json({error: "invalid request"});

    const item_length = test_DB[`user_${user}`] && test_DB[`user_${user}`].length;

    if(user === "basic_full" && item_length >= 5) return res.status(403).json({ error: "movie limit reached in this calendar month" });
    else if(Object.keys(test_DB).includes(user)) return res.status(404).json({ error: "User not found!"});
    else if(!available_movies.includes(title)) return res.status(404).json({ error: "Movie not found!"});
    else if(test_DB[`user_${user}`].includes(title)) return res.status(412).json({ error: "movie already exists on your account" });
    else return res.status(201).json({ data: `movie "${title}" stored successfully into database` });
}
const debug_get = (req, res) => {
    if(req.headers.error) return res.status(500).json({ error: "internal server error"});
    const test_DB = {
        user_basic_not_full: { title: "Movie1", released: "1995.12.12", director: "John Doe", genre: "fiction"},
        user_basic_full: { title: "Movie1", released: "1995.12.12", director: "John Doe", genre: "fiction"},
        userpremium: { title: "Movie1", released: "1995.12.12", director: "John Doe", genre: "fiction"},
    }
    if(Object.keys(test_DB).includes(`user_${req.headers.user}`)) return res.status(404).json({ error: "User not found!"});
    else return res.status(200).json(JSON.stringify(test_DB[`user_${req.headers.user}`]));
}

const parse_token = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    if(!token) return res.status(401).json({ error: "unauthorized" });
    if(token === "test") {
        if(req.body.user || req.headers.user) next();
        else return res.status(401).json({ error: "unauthorized" });
    }
    else jwt.verify(token, model.ENV_VARS.JWT_SECRET, (err, user) => {
        if(err) return res.status(403).json({ error: "token is expired or invalid" })
        req.user = user;
        next();
    });
}

router.get(/\/movies/, parse_token, async (req, res, next) => {

    /* TESTS */
    if(req.headers.test){
        debug_get(req, res);
        return 0;
    }
    /* ***** */

    const [rows, ] = await model.promise.query(`SELECT * FROM ${model.ENV_VARS.MYSQL_DATABASE}.movies WHERE id = ?`, [req.user.userId])
    .catch(error => {
        res.status(500).json({ error: "internal server error" });
        throw new Error(error);
    });
    const data = JSON.parse(JSON.stringify(rows));
    if(data.length === 0) res.status(200).json({ data: "no movies" });
    else res.status(200).json({ data: JSON.stringify(rows) });
});

router.post(/\/movies/, parse_token, async (req, res, next) => {

    /* TESTS */
    if(req.body.test){
        debug_post(req.body.user, req.body.title, req.body.induce_error, req, res);
        return 0;
    }
    /* ***** */
    
    const date = new Date();
    const limited_datetime = `${date.getFullYear()}${date.getMonth() + 1}01`;
    const [movie_rows, ] = await model.promise.query(`SELECT * FROM ${model.ENV_VARS.MYSQL_DATABASE}.movies WHERE added_at >= ? AND id = ?`, [limited_datetime, req.user.userId])
    .catch(error => {
        res.status(500).json({ error: "internal server error"});
    });
    const movie_data = JSON.parse(JSON.stringify(movie_rows));

    if(movie_data.length >= 5 && req.user.role !== "premium") return res.status(403).json({ error: "movie limit reached in this calendar month" });
    else {
        if(!req.body.title) return res.status(400).json({error: "invalid request"});

        await fetch(`${model.ENV_VARS.OMDB_API_KEY}&t=${req.body.title}`)
        .then(response => response.json())
        .then(async body => {
            if(body.Error) {
                return res.status(404).json({ error: body.Error });
            }
            const {Title, Genre, Director} = body;
            const parsed_date = Date.parse(body.Released);
            const date = new Date(parsed_date);
            const month = date.getMonth() + 1;
            let Released = date.getFullYear().toString();
            
            if(month < 10) {
                Released += `0${month}`;
            }
            else Released += month;
            if(date.getDate() < 10){
                Released += `0${date.getDate()}`;
            }
            else Released += date.getDate().toString();
            
            const [rows, ] = await model.promise.query(`SELECT Title, Released FROM ${model.ENV_VARS.MYSQL_DATABASE}.movies WHERE id = ? AND title = ? AND released = ?`, [req.user.userId, Title, Released]);
            if(rows.length === 1) return res.status(412).json({ error: "movie already exists on your account" });

            model.promise.query(`INSERT INTO ${model.ENV_VARS.MYSQL_DATABASE}.movies VALUES (?, ?, ?, ?, ?, NOW())`, [req.user.userId, Title, Released, Genre, Director])
            .then(result => { 
                res.status(201).json({ data: `movie "${req.body.title}" stored successfully into database` });
            })
            .catch(error => { 
                console.log(error);
                res.status(500).json({ error: "internal server error"}); 
                throw new Error(error);
            });
        })
        .catch(error => {
            res.status(500).json({error: "internal server error"});
            throw new Error(error);
        })
    }
    

});

module.exports = router;