
var sql = require('./sql');

exports.getDevices = function(req,res){

	var user = req.session.role;

	var s = 'select * from device where username="' + user + '"';

	sql.execute(s,function(err, rows, fields){
        if(err){
            console.log(err);
        }else {
            res.send(doc);
        }
    });

};

exports.addDevice = function(req,res){

	var user = req.session.role,
		device_id = req.body.device_id;

	var s = 'insert into user_device (username,id_device) VALUES ("' + user + '","' + device_id + '")';

	sql.execute(s,function(err, rows, fields){
        if(err){
            console.log(err);
        }else {
            res.send('ok');
        }
    });

};