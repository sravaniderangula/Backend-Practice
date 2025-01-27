
require('dotenv').config();

const express = require("express");
const app = express();
const PORT = 20304;
app.use(express.json());



const { Client } = require("pg");

const client = new Client({

    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});



app.get("/index", async (request, response) => {
    await client.connect();
    let data = await client.query("SELECT * FROM Customers");
    await client.end();
    response.status(200).json(data.rows);

})

app.get("/customer/:id", async (request, response) => {
    let customerID = parseInt(request.params.id);
    await client.connect();
    let data = await client.query(`SELECT * FROM Customers where id=${customerID}`);
    await client.end();
    response.status(200).json(data.rows);

})

app.post("/add", async (request, response) => {
    let newData = request.body;
    await client.connect();
    let data = await client.query(`insert into Customers (name,age,Address) Values('${newData.name}',${newData.age},'${newData.address}')`);
    await client.end();
    response.status(201).json(newData);

})

app.put("/update/name/:id", async (request, response) => {
    let customerID = parseInt(request.params.id);
    let update = request.body;
    await client.connect();
    let updatedData = await client.query(`Update  Customers set name='${update.name}' where id =${customerID}`);
    await client.end();
    response.status(200).json(updatedData);

});

app.put("/update/age/:id", async (request, response) => {
    let customerID = parseInt(request.params.id);
    let update = request.body;
    await client.connect();
    let updatedData = await client.query(`Update Customers set age=${update.age} where id =${customerID}`);
    await client.end();
    response.status(200).json(updatedData);

});

app.put("/update/address/:id", async (request, response) => {
    let customerID = parseInt(request.params.id);
    let update = request.body;
    await client.connect();
    let updatedData = await client.query(`Update  Customers set Address='${update.address}' where id =${customerID}`);
    await client.end();
    response.status(200).json(updatedData);

});


app.delete("/delete/:id", async (request, response) => {
    let customerID = parseInt(request.params.id);
    await client.connect();
    let deletedData = await client.query(`delete from Customers where id=${customerID}`);
    await client.end();
    response.status(200).json(deletedData);

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})