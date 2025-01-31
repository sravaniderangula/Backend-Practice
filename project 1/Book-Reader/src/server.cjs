const express = require("express");
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const app = express();
app.use(express.json());

const PORT = process.env.DB_PORT;
console.log(ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, PORT);

const cors = require('cors');

app.use(cors({
  origin: [ 'http://localhost:5174'], 
}));


let client;

const connectToDatabase = async () => {
    if (!client) {
        client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false },
        });

        try {
            await client.connect();
            console.log("Connected to the database successfully");
        } catch (error) {
            console.error("Error connecting to the database:", error);
            throw error;
           }
    }

    return client;
};

// Register Route
app.post("/api/register", async (req, res) => {
    const { name, email, role, password } = req.body;

    try {
        await connectToDatabase();  
        const userExists = await client.query(`SELECT * FROM Users WHERE email = $1`, [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const query = `INSERT INTO Users (name, email, role, password) VALUES ($1, $2, $3, $4)`;
        await client.query(query, [name, email, role, hashedPassword]);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Authenticate User Middleware
async function authenticateUser(req, res, next) {
    const { email, password } = req.body;

    try {
        await connectToDatabase();
        const users = await client.query(`SELECT * FROM Users WHERE email = $1`, [email]);
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
app.post("/api/login", authenticateUser, (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign({ userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role }, ACCESS_TOKEN_SECRET, {
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
app.get("/api/profile", authorizeUser, (req, res) => {
    const user = req.user;
    return res.status(200).json({
        role: user.userRole,
    });
});

// Start the server after connecting to the database
connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });



    app.post("/api/addBook", async (req, res) => {
        const data = req.body;
        try {
            await connectToDatabase();
            const { book_id, book_name, price, rented_status, customer_name } = data;
            await client.query(
                `INSERT INTO BooksAdmin (book_id, book_name, price, rented_status, customer_name) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [book_id, book_name, price, rented_status, customer_name]
            );
            res.status(201).json({ message: "Book details added successfully" });
        } catch (error) {
            console.error("Error while adding book: ", error.message);
            res.status(500).json({ message: "Error while adding book", error: error.message });
        }
    });
    
    app.get("/api/getBook", async (req, res) => {
        try {
            await connectToDatabase();
            const result = await client.query("SELECT * FROM BooksAdmin");
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "No books found" });
            }
            res.status(200).json({ books: result.rows });
        } catch (error) {
            console.error("Error while fetching books: ", error.message);
            res.status(500).json({ message: "Error while connecting to database", error: error.message });
        }
    });
    
    app.put("/api/updateBook/:id", async (req, res) => {
        const book_id = parseInt(req.params.id);
        const updates = req.body;
        const updateFields = ["price", "rented_status", "customer_name"];
        
        const updateKeys = Object.keys(updates).filter((key) => updateFields.includes(key));
        const data = updateKeys.map((key, index) => `${key} = $${index + 1}`);
        const values = updateKeys.map((key) => updates[key]); 
        values.push(book_id);  
    
        try {
            await connectToDatabase();
            const query = `UPDATE BooksAdmin SET ${data.join(", ")} WHERE book_id = $${values.length} RETURNING *`;
            const result = await client.query(query, values);
    
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Book not found" });
            }
    
            res.status(200).json({ message: "Book details updated successfully", updatedBook: result.rows[0] });
        } catch (error) {
            console.error("Error while updating book: ", error.message);
            res.status(500).json({ message: "Error while updating book", error: error.message });
        }
    });
    