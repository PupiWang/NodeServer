
var sql = require('./sql');

exports.getDevices = function(req,res){

	var user = req.session.role;

	var s = 'select * from user_device where email="' + user + '"';

	sql.execute(s,function(err, rows, fields){
        if(err){
            console.log(err);
        }else {
            res.send(rows);
        }
    });

};

exports.addDevice = function(req,res){

	var user = req.session.role,
		device_id = req.body.device_id;

	var s = 'insert into user_device (email,id_device) VALUES ("' + user + '","' + device_id + '")';

	sql.execute(s,function(err, rows, fields){
        if(err){
            console.log(err);
        }else {
            res.send('ok');
        }
    });

};