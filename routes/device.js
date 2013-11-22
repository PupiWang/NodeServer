// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/test');

var mongoose = require('mongoose');
var user_device = mongoose.model('user_device', {
	username:String,
	device_id:String
});

exports.getDevices = function(req,res){

	user_device.find({'username':req.session.role},function(err,doc){
		res.send(doc);
	})
};

exports.addDevice = function(req,res){

	var device = new user_device({'username':req.session.role,'device_id':req.body.device_id});

	device.save(function(err){
		if(err){
			console.log(err);
		}
		res.send('ok');
	})
};