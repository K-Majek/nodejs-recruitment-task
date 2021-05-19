const express = require("express");
const router = express.Router();
const model = require("../server");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
// new file is created to separate routes 

//in order to complete the task, two different routes must be made
//one for fetching data, second for creating new objects

const parse_token = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    if(!token) return res.status(401).json({ error: "unauthorized" });
    jwt.verify(token, model.ENV_VARS.JWT_SECRET, (err, user) => {
        if(err) return res.status(403).json({ error: "token is expired or invalid" })
        req.user = user;
        next();
    });
}

router.get(/\/movies/, parse_token, async (req, res, next) => {
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
    const date = new Date();
    const limited_datetime = `${date.getFullYear()}${date.getMonth() + 1}01`;
    const [movie_rows, ] = await model.promise.query(`SELECT * FROM ${model.ENV_VARS.MYSQL_DATABASE}.movies WHERE added_at >= ?`, limited_datetime)
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
            const Released = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
            
            const [rows, ] = await model.promise.query(`SELECT Title, Released FROM ${model.ENV_VARS.MYSQL_DATABASE}.movies WHERE id = ? AND title = ? AND released = ?`, [req.user.userId, Title, Released]);
            if(rows.length === 1) return res.status(412).json({ error: "movie already exists on your account" });


            //checked released date, changed into datetime parseable format
            model.promise.query(`INSERT INTO ${model.ENV_VARS.MYSQL_DATABASE}.movies VALUES (?, ?, ?, ?, ?, NOW())`, [req.user.userId, Title, Released, Genre, Director])
            .then(result => { 
                res.status(201).json({ data: `movie ${req.body.title} stored successfully into database` })
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