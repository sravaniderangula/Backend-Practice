
const http=require("http");
const fs=require("fs");
const path=require("path");
const filepath=path.join(__dirname,"data.json");
const PORT=3700;
function readFile(){
   const data= fs.readFileSync(filepath,"utf-8");
   return JSON.parse(data);
}
function writeFile(input_data){
    fs.writeFileSync(filepath,JSON.stringify(input_data));
}
const Server=http.createServer((request,response)=>{
    const url=request.url;
    const method=request.method;
    if (method==="POST" && url==="/create"){
        let body='';
        request.on("data",(chunk)=>{body+=chunk});
        request.on("end",()=>{
            const oldData=readFile();
            const newData=JSON.parse(body);
            newData.id=(oldData.length)?oldData[oldData.length-1].id+1:1;
            oldData.push(newData);
            writeFile(oldData);
            response.writeHead(201,{"Content-Type":"application/json"});
            response.end(JSON.stringify(newData));
        })

    }
    else if(method=="GET" ){
        response.writeHead(200,{"Content-Type":"application/json"});
        let data=readFile();
        response.end(JSON.stringify(data));

    }
    else if(method=="GET" && url.startsWith('/read')){
        let itemID=url.split('/')[2];
        let items=readFile();
        let item=items.find((item)=>item.id==itemID);
        response.writeHead(200,{"Content-Type":"application/json"});
        response.end(JSON.stringify(item));

    }
    else if(method=="PUT" && url.startsWith('/update')){
        let body="";
        request.on("data",(chunk)=>{body+=chunk});
        request.on("end",()=>{
            let newData=JSON.parse(body);
            let itemID=url.split('/')[2];
            let items=readFile();
            let itemIndex=items.findIndex((item)=>item.id==itemID);
            let updatedItem={...items[itemIndex],...newData,itemID};
            items[itemIndex]=updatedItem;
            writeFile(items);
            response.writeHead(200,{"Content-Type":"application/json"});
            response.end(JSON.stringify(updateditem));

        })
        


    }
    else if(method=="DELETE" && url.startsWith('/delete')){
        let deleteID=url.split('/')[2];
        let items=readFile();
        let deleteIndex=items.findIndex((item)=>item.id==deleteID);
        let deletedItem=items.splice(deleteIndex,1);
        writeFile(items);
        response.writeHead(200,{"Content-Type":"application/json"});
        response.end(JSON.stringify(deletedItem));



    }
        

   
});
Server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})

Server.on("error", (err) => {
    console.error("Server error:", err);
});
