
var bodyParser = require('body-parser');
var mongoose =require("mongoose"),
	passportLocalMongoose=require("passport-local-mongoose");
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mongoose = require('mongoose');
const url = require('url');
//const params = new URLSearchParams(location.search);

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const uri = 'mongodb+srv://vishaka:Vishaka@cluster0.u0mor.mongodb.net/questions?retryWrites=true&w=majority';

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/login');
	}
}

//create a schema 
var quesSchema = new mongoose.Schema({
	ques: String,
	opt: [{option : String}],
	corrAns : String,
	level : String,
	company: String,
	frequency: Number,
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"comments"
		}
	]

});


//quesSchema.plugin(passportLocalMongoose);


var Question = mongoose.model('Question', quesSchema);
let getFrom;
var cat;
var comp;
var dataNew;
var qid;
var id;

module.exports =Question;


//function to check options
function checkAnswer(req,  data){

		console.log("CHECKING ANSWER");
		console.log(data);

		var userQues = Object.keys(req.query)[0];
		var userAns = Object.values(req.query)[0];

		var j = String(userQues).slice(-1);

		console.log(j);
		var result = [];

		if(data!== undefined)
		{
			console.log("hello");
			for(var i=0; i<data.length; i++)
			{
				
				if(i==j)
				{
					//console.log(typeof i);
					console.log(data[i].corrAns);
					if(userAns == data[i].corrAns)
						result.push("Correct!");
					else if(userAns != undefined && userAns != data[i].corrAns)
						result.push("Incorrect.");
					else
						result.push("");
				}
				else
					result.push("");

			}
			console.log(result);
		}
		
		return result;

}

function retrievediscussion(req,res,client,collectionName,route,qid){
	console.log("Quest to retrieve discussion");
	client.connect(err => {
    collection = client.db("questions").collection(collectionName);
	console.log(collectionName);
	console.log(qid);
	 id = mongoose.Types.ObjectId(qid);
	
	//collection.find({_id:qid},function(err,foundq){
	//collection.find({_id:id}).toArray(function(err,data){
	//collection.find({},function(err,foundq){
	collection.find({_id:id}).toArray(function(err,foundq){
		if(err){
			console.log(err);
		}
		else{
			console.log(foundq);
			
			res.render("./questions/qdiscuss",{foundq:foundq[0],subject:collectionName});
		}
	})
    // perform actions on the collection object
    client.close();
});
}




//function to retrieve all questions
function retrieveQuestions(req, res, client, collectionName, route)
{
	console.log("IN THE FUNCTION NOW");
	//let client = new MongoClient(uri, { useNewUrlParser: true});
	
		if( (!("filtercat" in req.query) && !("filtercomp" in req.query)) )
		{
			client.connect(err => {
					  collection = client.db("questions").collection(collectionName);
					  
					  console.log("success getting");
					  collection.find({}).toArray(function(err,data){
							if(err) throw err;
							console.log(data);

							var result = checkAnswer(req, data);
		
							res.render(route, {question : data, result : result, alert:"",subject:collectionName});

						});
			
			        });
					  	client.close();	
		}

}

//function to retrieve 
function retrieve(req, res, client, getFrom, route, back)
{
	console.log("IN RETRIEVE FUNCTION");
	var client = new MongoClient(uri, { useNewUrlParser: true});
	
	
	
		console.log("HITTING CHECK");
		console.log(req.query);
		console.log(cat);
		
		if(cat!==undefined && comp ===undefined)
		{
			console.log(cat);
			

			client.connect(err => {

			collection = client.db("questions").collection(getFrom);
			console.log("filtering stuff");
			collection.find({level: cat}).toArray(function(err,data){
						if(err) throw err;
						
						var result = checkAnswer(req, data);
						console.log(result);
						
						res.render('./questions/questionsNew.ejs', {question : data, result : result, back:back,subject:getFrom});
	
													
					
					});

			});
			client.close();
		}

		else if(cat===undefined && comp !==undefined)
		{
			console.log(cat);
			
			client.connect(err => {

			collection = client.db("questions").collection(getFrom);
			console.log("filtering stuff");
			collection.find({company: comp}).toArray(function(err,data){

						if(err) throw err;
						
						

						var result = checkAnswer(req, data);
						console.log(result);
						
						res.render('./questions/questionsNew.ejs', {question : data, result : result, back:back,subject:getFrom});
						
					
					});


			});
			client.close();
		}

		else if(cat!==undefined && comp !==undefined)
		{
			console.log(cat);
			
			client.connect(err => {

			collection = client.db("questions").collection(getFrom);
			console.log("filtering stuff");
			collection.find({level: cat, company:comp}).toArray(function(err,data){

						if(err) throw err;
						
	
						var result = checkAnswer(req, data);
						console.log(result);
						
						res.render('./questions/questionsNew.ejs', {question : data, result : result, back:back,subject:getFrom});
	
													
					
					});


			});
			client.close();
		}

	

}


//function to post new questions to appropriate database
function postTo(client, connectTo, newQues)
{

		client.connect(err => {

			  collection = client.db("questions").collection(connectTo);
			  
			  console.log("success");

			  	collection.insertOne(newQues, (err, result) => {
				        if(err) {
				            return res.status(500).send(err);
				            console.log(err);
				        }

				 
				        	console.log("done");
				
	        });
			  	client.close();
		});
}



module.exports = function(app){
	//making express app available here
	app.use(bodyParser.json());


	app.get('/questions/dbms',isLoggedIn,function(req,res){

		
		var client1 = new MongoClient(uri, { useNewUrlParser: true});
		getFrom = "dbms";
		
		retrieveQuestions(req, res, client1, "dbms", './questions/questionsDbms.ejs');

	});
		
	


	app.get('/questions/os',isLoggedIn, function(req,res){

		var client3 = new MongoClient(uri, { useNewUrlParser: true});
		getFrom ="os";
		
		retrieveQuestions(req, res, client3,  "os", './questions/questionsOs.ejs');
		
		
	});



	app.get('/questions/network',isLoggedIn, function(req,res){

		var client5 = new MongoClient(uri, { useNewUrlParser: true});
		getFrom = "network";
		
		retrieveQuestions(req, res, client5,  "network", './questions/questionsNetwork.ejs');

	});



	app.get('/questions/dsa',isLoggedIn, function(req,res){

		var client4 = new MongoClient(uri, { useNewUrlParser: true});
		getFrom = "dsa";
		
		retrieveQuestions(req, res, client4, "dsa", './questions/questionsDsa.ejs');
		
	});



	app.get('/questions/aptitude',isLoggedIn, function(req,res){

		var client2 = new MongoClient(uri, { useNewUrlParser: true});
		getFrom = "aptitude";
		
		retrieveQuestions(req, res, client2, "aptitude", './questions/questionsAptitude.ejs');
		
	});



	app.get('/question',isLoggedIn, function(req,res){

		res.render('./questions/questionsMainPage.ejs');


	});

	app.get('/questions/filter',isLoggedIn, function(req, res){

		var client = new MongoClient(uri, { useNewUrlParser: true});
		console.log(req.query);
		
		if("filtercat" in req.query)
		{
			cat = req.query.filtercat;
			comp = undefined;
		}
		if("filtercomp" in req.query)
		{
			 comp = req.query.filtercomp;
			 cat = undefined;
		}

		console.log("entering filter");
		/*console.log(cat);
		console.log(comp);
		console.log(getFrom);*/
		
		retrieve(req, res, client, getFrom, './questions/questionsNew.ejs', getFrom);

	});
	
	app.get("/discuss/:subject/:qid",isLoggedIn,function(req,res){

		var client = new MongoClient(uri, { useNewUrlParser: true });
		getfrom = req.params.subject;
		var qid = req.params.qid;
		console.log(getfrom);
		console.log(qid);
		retrievediscussion(req,res,client,getfrom,'./questions/discuss.ejs',qid);

	
});
	
	
	



	app.get('/questions/new',isLoggedIn, function(req, res){

		res.render('./questions/addNewquestions.ejs');

	});

	


	app.post('/questions/new', urlencodedParser,  function(req, res){

		console.log(req.body);
		var data = req.body;

		var newQues = new Question({ques:data.question, 
						opt:[{option:data.optionA}, {option: data.optionB},{option: data.optionC},{option: data.optionD}], 
						corrAns: data.correct, 
						level: data.level, 
						company: data.company, 
						frequency: data.frequency,
						comments:[]
					});

			
		console.log(data.category);
		var connectTo = data.category;
		var database,collection;

		if(connectTo =="dbms")
		{
			var client1 = new MongoClient(uri, { useNewUrlParser: true});
			postTo(client1, "dbms", newQues);

		}
		else if(connectTo == "aptitude")
		{
			var client2 = new MongoClient(uri, { useNewUrlParser: true});
			postTo(client2, "aptitude", newQues);
		}

		else if(connectTo == "os")
		{
			var client3 = new MongoClient(uri, { useNewUrlParser: true});
			postTo(client3, "os", newQues);
		}

		else if(connectTo == "dsa")
		{
			var client4 = new MongoClient(uri, { useNewUrlParser: true});
			postTo(client4, "dsa", newQues);
		}

		else if(connectTo == "network")
		{
			var client5 = new MongoClient(uri, { useNewUrlParser: true});
			postTo(client5, "network", newQues);
		}
		
        res.render("./questions/addNewquestions.ejs");
        

	});

	

};