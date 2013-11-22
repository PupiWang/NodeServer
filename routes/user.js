var mongoose = require('mongoose');

var user = mongoose.model('user', {
	username:String,
	password:String
});

exports.list = function(req, res){
  	user.find(function(err,doc){
		res.send(doc);
	})
};

exports.login = function(req, res){
	var username=req.body.username,
  	  	password=req.body.password;
  	user.find({'username':username,'password':password},function(err,doc){
  		if(err){
  			console.log(err);
  		}else{
  			if(doc.length==1){
  				req.session.role=doc[0].username;
  				res.redirect('userInfo');
  			}
  			res.send('error');
  		}
  	})
};

exports.userinfo = function(req, res){
	res.render('userInfo',{title:req.session.role});
}

exports.signup = function(req, res){
  	var username=req.body.username_signup,
  	  	password=req.body.password_signup,
  	  	password_confirm=req.body.password_signup_confirm;
  	if(password==password_confirm){
	  	var newuser=new user({'username':username,'password':password});
	  	console.log(newuser);
	  	newuser.save(function(err){
	  	  password_confirm=req.body.password_signup_confirm;
			if(err){
				console.log(err);
				res.send('The Username you typed has been used');
			}else{
				res.redirect('/users');
			}
		})
	}else{
		res.send('Error');
	}
};