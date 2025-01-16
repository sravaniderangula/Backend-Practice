
const fs=require("fs");
const path=require("path");
const express = require("express");
const app = express();
const PORT=3500;

let filepath=path.join(__dirname,"data.json");

app.use(express.json());


const readFile=()=>{
    let data=fs.readFileSync(filepath,"utf-8");
    return JSON.parse(data);
}

const writeFile=(data)=>{
    fs.writeFileSync(filepath,JSON.stringify(data));
}

app.get("/index",(request,response)=>{
    response.status(200).json(readFile());

})

app.get("/customer/:id",(request,response)=>{
    let customerID=parseInt(request.params.id);
    let customers=readFile();
    let customer=customers.find((customer)=>customer.id==customerID);
    response.status(200).json(customer);

})

app.post("/add",(request,response)=>{
    let newData=request.body;
    let oldData=readFile();
    let newId=(oldData.length)?oldData[oldData.length-1].id+1:1;
    newData.id=newId;
    oldData.push(newData);
    writeFile(oldData);
    response.status(201).json(newData);

})

app.put("/update/:id",(request,response)=>{
    let customerID=parseInt(request.params.id);
    let customers=readFile();
    let update=request.body;
    let custInd=customers.findIndex((customer)=>customer.id==customerID);
    let updatedData={...customers[custInd],...update,id:customerID};
    customers[custInd]=updatedData;
    writeFile(customers);
    response.status(200).json(updatedData);

});


app.delete("/delete/:id",(request,response)=>{
    let customerID=parseInt(request.params.id);
    let customers=readFile();
    let custInd=customers.findIndex((customer)=>customer.id==customerID);
    let deletedData=customers.splice(custInd,1);
    writeFile(customers);
    response.status(200).json(deletedData);

});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})