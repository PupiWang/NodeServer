/**
 * 根据资源空间域名和资源名生成url
 * @param  {string} domain 资源空间域名ov-orange-private.u.qiniudn.com
 * @param  {string} key    资源名
 * @return {string} url    资源链接
 */
var getDownloadUrl = function (domain, key) {
  var qiniu = require('qiniu');
  qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
  qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

  if (!key) {
    return '';
  }

  var baseUrl = qiniu.rs.makeBaseUrl(domain, key),
    policy = new qiniu.rs.GetPolicy();

  var url = policy.makeRequest(baseUrl);

  return url;
};

/**
 * 暴露给别的模块用的方法，同getDownloadUrl
 * @param  {string} domain 资源空间域名ov-orange-private.u.qiniudn.com
 * @param  {string} key    资源名
 * @return {string} url    资源链接
 */
exports.getUrl = function (domain, key) {
  var url = getDownloadUrl(domain, key);
  return url;
};

/**
 * 获取上传令牌
 */
exports.getUploadToken = function (req, res) {
  var qiniu = require('qiniu');
  qiniu.conf.ACCESS_KEY = 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6';
  qiniu.conf.SECRET_KEY = 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R';

  var putPolicy = new qiniu.rs.PutPolicy('ov-orange-private');
  //七牛回调链接
  putPolicy.callbackUrl = 'http://115.29.179.7/uploadCallback';
  //魔法变量和自定义变量
  putPolicy.callbackBody = 'bucket=$(bucket)&etag=$(etag)&fname=$(fname)&fsize=$(fsize)' +
                           '&mimeType=$(mimeType)&imageInfo=$(imageInfo)' +
                           '&width=$(imageInfo.width)&height=$(imageInfo.height)' +
                           '&format=$(imageInfo.format)&endUser=$(endUser)' +
                           '&exif=$(exif)&ApertureValue=$(exif.ApertureValue)&val=$(exif.ApertureValue.val)' +
                           '&user_id=$(x:user_id)&device_id=$(x:device_id)&time=$(x:time)';
  res.send(putPolicy.token());
};

/**
 * 资源上传完成后的回调
 */
exports.uploadCallback = function (req, res) {

  var sql = require('../util/sql');

  var s, i;

  var url;

  var client_sockets = require('./socket').client_sockets;


  if (req.body.mimeType === 'image/jpeg') {
    //如果上传的资源是图片
    //在picture_device、resource_picture两个表中插入数据
    s = 'INSERT INTO picture_device (`key`, id_device, datetime_create) VALUES ("' +
            req.body.etag + '", "' + req.body.device_id + '", ' + req.body.time * 1000 + ')';

    sql.execute(s, function (err, rows, fields) {
      if (err) {
        throw err;
      } else {

        s = 'INSERT INTO resource_picture (bucket, `key`, name, size, type, datetime_upload, width, height) VALUES ("' +
          req.body.bucket + '","' + req.body.etag + '","' + req.body.fname + '","' +
          req.body.fsize + '","' + req.body.mimeType + '",' + req.body.time * 1000 + ',' +
          req.body.width + ',' + req.body.height + ')';

        sql.execute(s, function (err, rows, fields) {
          if (err) {
            throw err;
          } else {
            //两条插入操作成功执行
            //构造图片链接，根据给定的user_id找到client_sockets发送信息
            url = getDownloadUrl('ov-orange-private.u.qiniudn.com', req.body.etag);

            for (i = client_sockets.length - 1; i >= 0; i--) {
              var c = client_sockets[i];
              if (c.user_id === req.body.user_id) {
                if (c.write) {
                  var protbufConvertor = require('./socket').protbufConvertor;
                  protbufConvertor(c, {from: req.body.device_id, to: req.body.user_id, time: url});
                } else {
                  c.emit('data', {'type': 'img', 'url': url});
                }
              }
            }
          }
        });
      }
    });

  } else if (req.body.mimeType === 'video/mp4') {
    //如果上传的资源是视频
    ////在video_device、resource_video两个表中插入数据
    s = 'INSERT INTO video_device (`key`, id_device, datetime_create) VALUES ("' +
            req.body.etag + '", "' + req.body.device_id + '", ' + req.body.time * 1000 + ')';

    sql.execute(s, function (err, rows, fields) {
      if (err) {
        throw err;
      } else {
        s = 'INSERT INTO resource_video (bucket, `key`, name, size, type, datetime_upload) VALUES ("' +
          req.body.bucket + '","' + req.body.etag + '","' + req.body.fname + '","' +
          req.body.fsize + '","' + req.body.mimeType + '",' + req.body.time * 1000 + ')';

        sql.execute(s, function (err, rows, fields) {
          if (err) {
            throw err;
          } else {
            //两条插入操作成功执行
            //构造视频链接，根据给定的user_id找到client_sockets发送信息
            url = getDownloadUrl('ov-orange-private.u.qiniudn.com', req.body.etag);

            for (i = client_sockets.length - 1; i >= 0; i--) {
              if (client_sockets[i].user_id === req.body.user_id) {
                client_sockets[i].emit('data', {'type': 'video', 'url': url});
              }
            }

          }

        });
      }
    });
  }

};