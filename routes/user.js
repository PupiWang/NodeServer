var sql = require('./sql');

exports.list = function(req, res){

    var s = 'select * from user';

	sql.execute(s,function(err, rows, fields) {
        if (err) {
            throw err;
        } else {
            res.send(rows);
        }
    });

};

exports.signup = function(req, res){

    var email = req.body.email,
        password = req.body.password,
        password_confirm = req.body.password_confirm;

    var MD5 = require('MD5');



    if(password == password_confirm){

        var s = 'select * from user where email = "' + email + '"';

        sql.execute(s,function(err,rows,fields){
            
            if(rows.length >= 1){
                res.send('email already exist');
                return;
            }else {
                s = 'insert into user (email,password) VALUES ("' + email + '","' + MD5(password) + '")';

                sql.execute(s,function(err, rows, fields){
                    if (err) {
                        console.log(err);
                    } else {
                        req.session.role = email;
                        res.send('/users');
                    }
                });

            }
        })

    } else {
        res.send('the confirm one is not the same as password');
    }

};

exports.login = function(req, res){

	var email = req.body.email,
  	  	password = req.body.password;

    var MD5 = require('MD5');

  	if(email && password){
        var s = 'select password from user where email="' + email + '"';
        sql.execute(s,function(err, rows, fields){
            if (err) {
                console.log(err);
            } else {
                if (rows.length == 1 && rows[0].password == MD5(password)) {
                    req.session.role = email;
                    res.send('/userinfo');
                } else {
                    res.send('password error');
                }
            }
        })
    }

};

exports.userinfo = function(req, res){

	res.render('userInfo',{title:req.session.role});

}
