
var getDownloadUrl = function(domain,key){
	var qiniu = require('qiniu');
	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

	var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
	var policy = new qiniu.rs.GetPolicy();

	return(policy.makeRequest(baseUrl));
}

exports.getUploadToken = function(req,res){
	var qiniu = require('qiniu');
	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';
	
	var putPolicy = new qiniu.rs.PutPolicy('ov-orange-private');
		putPolicy.callbackUrl = 'http://115.29.179.7/uploadCallback';
		putPolicy.callbackBody = 'bucket=$(bucket)&etag=$(etag)&fname=$(fname)&fsize=$(fsize)' + 
								 '&mimeType=$(mimeType)&imageInfo=$(imageInfo)' + 
								 '&width=$(imageInfo.width)&height=$(imageInfo.height)' + 
								 '&format=$(imageInfo.format)&endUser=$(endUser)' + 
								 '&exif=$(exif)&ApertureValue=$(exif.ApertureValue)&val=$(exif.ApertureValue.val)' + 
								 '&user_id=$(x:user_id)&device_id=$(x:device_id)&time=$(x:time)';
	res.send(putPolicy.token());
}

// exports.getDownloadUrl = function(req,res){
// 	var qiniu = require('qiniu');
// 	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
// 	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

// 	var baseUrl = qiniu.rs.makeBaseUrl('ov-orange-private.u.qiniudn.com', 'FkHlgxgJf2CxejC94ia5AV4WXpnk');
// 	var policy = new qiniu.rs.GetPolicy();
// 	res.redirect(policy.makeRequest(baseUrl));

// }

exports.uploadCallback = function(req,res){

	console.log(req.body);
	res.end();

	var sql = require('./sql');

	var s = 'INSERT INTO picture_device (`key`, id_device, datetime_create) VALUES ("'+ 
			req.body.etag + '", "' + req.body.device_id + '", ' + req.body.time + ')';

	sql.execute(s,function(err, rows, fields) {
        if (err) throw err;
    });

    s = 'INSERT INTO resource_picture (bucket, `key`, name, size, type, datetime_upload) VALUES ("' +
    	req.body.bucket + '","' + req.body.etag + '","' + req.body.fname + '","' + 
    	req.body.fsize + '","' + req.body.mimeType + '",' + req.body.time + ')';

	sql.execute(s,function(err, rows, fields) {
        if (err) throw err;
    });

	var client_sockets = require('./socket').client_sockets;

	var url = getDownloadUrl('ov-orange-private.u.qiniudn.com', req.body.etag);

	for (var i = client_sockets.length - 1; i >= 0; i--) {
		if(client_sockets[i].user_id == req.body.user_id){
			client_sockets[i].emit('data',url);
		}
    };

}