const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const { register } = require("module");

const app = express();
const port = 3000;

//Middleware to serve static data
app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}));

//sets up the session variable
app.use(session({
    secret:"12345",
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}// Set to true is using https
}));

function isAuthenticated(req,res, next){
    if(req.session.user)return next();
    return res.redirect("/login");
}

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
app.post("/addgame", isAuthenticated, async (req,res)=>{
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
app.put("/updategame/:id", isAuthenticated, (req, res)=>{
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
app.delete("/deletegame/:id", isAuthenticated, async (req, res) => {
    try {
        await Game.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Game deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete game" });
    }
});

//App routes
app.post("/login", async (req, res) => {
    try {
        console.log("Login Request Body:", req.body); // Debugging

        const { Username, Password } = req.body;

        if (!Username || !Password) {
            console.log("Missing credentials.");
            return res.status(400).send("Both username and password are required.");
        }

        const user = await User.findOne({ Username });

        if (!user) {
            console.log("User not found.");
            req.session.error = "Invalid credentials.";
            return res.redirect("/login");
        }

        console.log("User found:", user); // Debugging

        const isMatch = await bcrypt.compare(Password, user.Password);

        if (!isMatch) {
            console.log("Incorrect password.");
            req.session.error = "Invalid credentials.";
            return res.redirect("/login");
        }

        req.session.user = Username;
        console.log("Login successful! Redirecting to /games");

        return res.redirect("/gamesroute");
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("Internal Server Error.");
    }
});

app.get("/gamesroute", isAuthenticated, (req, res) => {
    console.log("Serving games.html");  // Debugging
    res.sendFile(path.join(__dirname, "public", "html", "games.html")); // Adjust path if necessary
});


app.get("/register", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "html/register.html"));
})

app.post("/register", async (req, res) => {
    try {
        console.log("Raw request body:", req.body); // Debugging

        const { Username, Password, Email } = req.body;
        console.log("Extracted:", { Username, Password, Email }); // Debugging

        if (!Username || !Password || !Email) {
            return res.status(400).send("All fields are required.");
        }

        const existingUser = await User.findOne({ Username });
        console.log("Existing user query result:", existingUser); // Debugging

        if (existingUser) {
            return res.send("Username already taken. Try a different one");
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = new User({ Username, Password: hashedPassword, Email });

        await newUser.save();
        console.log("New user registered:", newUser);

        res.redirect("/index.html");
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).send("Error registering new user.");
    }
});


app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/index.html");
    })
});

app.get("/auth-status", (req, res) => {
    res.json({ isAuthenticated: !!req.session.user });
});



//Our first example Route
app.get("/", function(req, res){
    //res.send("Hello Everyone!");
    res.sendFile(path.join(__dirname,"public","index.html"));
})

app.get("/testjson", ()=>{
    res.sendFile(path.join(__dirname,"public","json/games.json"));
});

app.listen(port, function(){
    console.log(`Server is running on port: ${port}`);
})