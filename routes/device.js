
var sql = require('./sql');

exports.getDevices = function(req,res){

	var email = req.session.role;

	var s = 'select * from user_device where email="' + email + '"';

	sql.execute(s,function(err, rows, fields){
        if(err){
            console.log(err);
        }else {
            res.send(rows);
        }
    });

};

exports.addDevice = function(req,res){

	var email = req.session.role,
		id_device = req.body.device_id;

	var s = 'select * from user_device where email = "' + email + '" and id_device = "' + id_device + '"';

	console.log(s);

	sql.execute(s,function(err, rows, fields){
		
		if(rows.length >= 1){
			res.send('same binding');
			return;
		}else {

			s = 'insert into user_device (email,id_device) VALUES ("' + email + '","' + id_device + '")';

			sql.execute(s,function(err, rows, fields){
		        if(err){
		            console.log(err);
		        }else {
		            res.send('ok');
		        }
		    });

		}
	})
	
};