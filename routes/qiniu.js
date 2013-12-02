
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
								 '&exif=$(exif)&ApertureValue=$(exif.ApertureValue)&val=$(exif.ApertureValue.val)';
	res.send(putPolicy.token());
}

exports.getDownloadUrl = function(req,res){
	var qiniu = require('qiniu');
	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

	var baseUrl = qiniu.rs.makeBaseUrl('ov-orange-private.u.qiniudn.com', 'FkHlgxgJf2CxejC94ia5AV4WXpnk');
	var policy = new qiniu.rs.GetPolicy();
	res.redirect(policy.makeRequest(baseUrl));
	// res.send(policy.makeRequest(baseUrl));
}

exports.uploadCallback = function(req,res){

	console.log(req.body);
	res.end();

	var client_sockets = require('./socket').client_sockets;

	var qiniu = require('qiniu');
	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

	var baseUrl = qiniu.rs.makeBaseUrl('ov-orange-private.u.qiniudn.com', req.body.etag);
	var policy = new qiniu.rs.GetPolicy();

	var url = policy.makeRequest(baseUrl) + '?imageView/1/w/320/h/240';

	for (var i = client_sockets.length - 1; i >= 0; i--) {
        client_sockets[i].emit('data',url);
    };

}