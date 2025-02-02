const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

//Middleware to serve static data
app.use(express.static(path.join(__dirname,"public")));

let message = "Wouldn't you like to be a pepper too?";

function sendMessage(){
    console.log(message)
}

app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}));

//sendMessage();

//mongoDB connection setup
const mongoURI = "mongodb://localhost:27017/Assignment3";
mongoose.connect(mongoURI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB Connection Error"));
db.once("open", ()=>{console.log("Connected to MongoDB database")});

//schema setup
const gamesSchema = new mongoose.Schema({
    Name:String,
    Developer:String
});

const Game = mongoose.model("Game", gamesSchema, "Games");

//Read Route
app.get("/Games", async (req,res)=>{
    try
    {
        const games = await Game.find();
        res.json(games);
    }
    catch(err)
    {
        res.status(500).json({error:"Failed to get games from database"});
    }
});

//Another Read route to use in editgame.js
app.get("/getgame/:id", async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ error: "Game not found" });

        res.json(game);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve game" });
    }
});

//Create Route
app.post("/addgame", async (req,res)=>{
    try{
        const newGame = new Game(req.body);
        const saveGame = await newGame.save();
        res.redirect("/html/games.html");
        console.log(saveGame);
    }catch(err){
        res.status(501).json({error:"Failed to add new game"});
    }
});

//Update Route
app.put("/updategame/:id", (req, res)=>{
    //Example of a promise statement for async function
    Game.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true,
    }).then((updatedGame)=>{
        if(!updatedGame){
            return res.status(404).json({error:"Failed to find game"});
        }
        res.json(updatedGame);
    }).catch((err)=>{
        res.status(400).json({error:"Failed to update game"});
    });
});

//Delete Route
app.delete("/deletegame/:id", async (req, res) => {
    try {
        await Game.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Game deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete game" });
    }
});

//Our first example Route
app.get("/", function(req, res){
    //res.send("Hello Everyone!");
    res.sendFile(path.join(__dirname,"public","index.html"));
})

app.get("/testjson", ()=>{
    res.sendFile(path.join(__dirname,"public","json/games.json"));
});

setTimeout(()=>{
    console.log("Hello 2 seconds later")
},2000);

setTimeout(()=>{
    console.log("Hello now")
},0);

app.listen(port, function(){
    console.log(`Server is running on port: ${port}`);
})