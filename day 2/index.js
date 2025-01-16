
const http=require("http");
const PORT=3000;
const server=http.createServer((request,response)=>{
    // response.writeHead(200,{"Content-Type":"application/json"});
    // data={
    //     "message":"Welcome to NODE JS",
    // };
    // response.end(JSON.stringify(data));
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.end("Hi Node JS");

});
server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
});