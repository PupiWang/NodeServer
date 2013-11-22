
exports.getUploadToken = function(req,res){
	var qiniu = require('qiniu');
	qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
	qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';
	var putPolicy = new qiniu.rs.PutPolicy('ov-orange-private');
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