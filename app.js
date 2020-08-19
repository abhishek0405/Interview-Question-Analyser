var express=require('express');
var app=express();

app.get('/',function(req,res){
	res.send("Welcome to HOME PAGE");
})

app.listen(3000,function(){
	console.log("Server Started");
})

alert("test");