const express = require("express");
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(express.json());

const port = 3011;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Application-Level Middleware
function defaultMiddleware(req, res, next) {
    console.log("Default middleware executed");
    console.log(`Request Method: ${req.method} and Request URL: ${req.url}`);
    next();
}

app.use(defaultMiddleware);

// Route-Level Middleware for License Check
function authorizeCheck(req, res, next) {
    if (!req.query.license) {
        console.log("Please provide your license");
        return res.status(400).json({ message: "License not provided" });
    } else if (req.query.license !== "JTD") {
        console.log("Sorry!!! You don't have access");
        return res.status(400).json({ message: "Permissions Denied" });
    } else {
        next();
    }
}

// Test Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome To Express JS course" });
});

app.get("/authorize-license", authorizeCheck, (req, res) => {
    res.status(200).json({ message: "Welcome To JTD Backend Course" });
});

client.connect();

// Register Route
app.post("/register", async (req, res) => {
    const { name, email, role, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const query = `INSERT INTO Users (name, email, role, password) VALUES ($1, $2, $3, $4)`;
        await client.query(query, [name, email, role, hashedPassword]);

        res.status(201).json({ message: "User registered successfully!!!" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Authenticate User Middleware
async function authenticateUser(req, res, next) {
    const { name, password } = req.body;

    try {
        const users = await client.query(`SELECT * FROM Users WHERE name = $1`, [name]);
        if (users.rows.length > 0) {
            const user = users.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.user = user;
                next();
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            return res.status(400).json({ message: "User does not exist" });
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Login Route
app.post("/login", authenticateUser, (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign({ userName: user.name, userEmail: user.email }, ACCESS_TOKEN_SECRET, {
            expiresIn: "3h",
        });

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error while generating token:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Authorize User Middleware
function authorizeUser(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}

// Protected Route
app.get("/profile", authorizeUser, (req, res) => {
    const user = req.user;
    return res.status(200).json({
        message: `Welcome Back, ${user.userName}`,
        user,
    });
});
