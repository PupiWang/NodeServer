var sql = require('./sql');

exports.list = function(req, res){

    var s = 'select * from user';

	sql.execute(s,function(err, rows, fields) {
        if (err) {
            throw err;
        }else {
            res.send(rows);
        }
    });

};

exports.signup = function(req, res){

    var username = req.body.username_signup,
        password = req.body.password_signup,
        password_confirm = req.body.password_signup_confirm;

    var MD5 = require('MD5');

    console.log('signup');

    if(password == password_confirm){
        var s = 'insert into user (username,password) VALUES ("' + username + '","' + MD5(password) + '")';
        sql.execute(s,function(err, rows, fields){
            if(err){
                console.log(err);
            }else {
                res.redirect('/users');
            }
        });
    }else{
        res.send('Error');
    }

};

exports.login = function(req, res){

	var username = req.body.username,
  	  	password = req.body.password;

    var MD5 = require('MD5');

  	if(username && password){
        var s = 'select password from user where username="' + username + '"';
        sql.execute(s,function(err, rows, fields){
            if (err){
                console.log(err);
            }else {
                if (rows.length == 1 && rows[0].password == MD5(password)) {
                    req.session.role = username;
                    res.redirect('/userinfo');
                }else {
                    res.send('password error');
                }
            }
        })
    }

};

exports.userinfo = function(req, res){

	res.render('userInfo',{title:req.session.role});

}
