var express=require('express');
var app=express(),
	mongoose= require("mongoose"),
	passport= require("passport"),
	bodyParser= require("body-parser"),
	LocalStrategy=require("passport-local"),
	passportLocalMongoose=require("passport-local-mongoose"),
	User = require('./models/user'),
 	fs   = require('fs'),
	path = require('path');
    require('dotenv/config');
var multer = require('multer'); 
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
var upload = multer({ storage: storage }); 


/*User.remove({},function(err){
	if(err){
		console.log(err);
	}
})*/
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/login');
	}
}

app.use(express('public'));
app.set("view engine","ejs");

mongoose.connect("mongodb://localhost/InterviewPrep",{ useNewUrlParser: true,useUnifiedTopology:true});
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require("express-session")({
	secret:"KEYTEST",
	resave:false,
	saveUninitialized:false
}))

app.use(passport.initialize());


app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.CurrentUser = req.user;
	next();
})	



app.get('/',function(req,res){
	res.render("landing");
})

app.get('/questions',isLoggedIn,function(req,res){
	
	res.render("questions/Qhome");
	
})

app.get('/register',function(req,res){
		res.render("auth/register");
})

app.post('/register',upload.single('DP'),function(req,res,next){
	var newuser = new User({name:req.body.name,
							username:req.body.username,
							easycount:0,
							midcount:0,
							hardcount:0,
							totalcount:0,
							rating:0,
							friends:[],
							DP: { 
            				data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            				contentType: 'image/png'
        					} 
});
	
	User.register(newuser,req.body.password,function(err,user){
		if(err){
			console.log("Not registered");

		}
		else{
			passport.authenticate("local")(req,res,function(){
				res.redirect('/questions');
			})
		}
	})
})



app.get('/login',function(req,res){
		res.render("auth/login");
})

app.post('/login',passport.authenticate("local",{
	successRedirect:"/questions",
	failureRedirect:"/login"

}),function(req,res){
	
})

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
})

app.get('/user/:id',isLoggedIn,function(req,res){
	User.findById(req.params.id).populate("friends").exec(function(err,foundUser){
		if(err){
			console.log(err);
		}
		else{
			isfriend=false
			myfriends=req.user.friends;
			for(var i=0;i<myfriends.length;i++){
				if(myfriends[i]==req.params.id){
					isfriend=true;
					break;
				}
			}
			res.render("user/userhome",{user:foundUser,isfriend:isfriend});
		}
	})
})

app.post('/user/search',function(req,res){
	console.log(req.body.searchuser);
	User.find({username:req.body.searchuser},function(err,foundUser){
		if(err){
			console.log("error occured while searchind for user");
		}
		else if(foundUser.length==0){
			res.render("user/usernotfound");
		}
		else{
			res.redirect('/user/'+foundUser[0]._id);
		}
	})
})

app.get("/user/friend/add/:id",isLoggedIn,function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			console.log("error while making friend");
		}
		else{
			req.user.friends.push(foundUser);
			req.user.save();
			res.redirect("/user/"+req.params.id);
		}
	})
	
})

app.get("/user/friend/remove/:id",function(req,res){
	User.update({ _id: req.user._id }, { $pull: { friends: req.params.id } }, function(err, user){
    if(err){
        console.log("error");
        
    }
	else{
		 res.redirect("/user/"+req.params.id);
	}
    
});
});
			
//require all controllers

var questionsController = require('./models/questionsController');
questionsController(app);




app.listen(3000,function(){
	console.log("Server Started");
})

