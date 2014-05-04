var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = 'obDE4SpABqsQANOkEvNHOvmj4gFaHXhdSKo29yKp';
qiniu.conf.SECRET_KEY = 'mlVKnO88LPHbR9WcgMy0bttvN2n5iqIIn0Sw_zCo';
var domain = 'lewu.qiniudn.com';
var bucketName = 'lewu';

/**
 * 根据资源空间域名和资源名生成url
 * @param  {string} domain 资源空间域名ov-orange-private.u.qiniudn.com
 * @param  {string} key    资源名
 * @return {string} url    资源链接
 */
var getDownloadUrl = function (domain, key) {
    if (!key) {
        return '';
    }

    var baseUrl = qiniu.rs.makeBaseUrl(domain, key),
        policy = new qiniu.rs.GetPolicy();

    return policy.makeRequest(baseUrl);
};

/**
 * 暴露给别的模块用的方法，同getDownloadUrl
 * @param  {string} domain 资源空间域名
 * @param  {string} key    资源名
 * @return {string} url    资源链接
 */
exports.getUrl = function (key) {
    return getDownloadUrl(domain, key);
};

/**
 * 获取上传令牌
 */
exports.getUploadToken = function (req, res) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName);
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
 * 获取上传令牌
 */
exports.getAccessToken = function (req, res) {
    var crypto = require('crypto');
    //加密对象
    var hmacSha1 = crypto.createHmac('sha1', qiniu.conf.SECRET_KEY);
    //签名
    var sign = hmacSha1.update('/pfop/\nbucket=ov-orange-private&key=wangzhi.mp4&fops=avthumb%2Fm3u8%2Fab%2F320k%2Fr%2F24&notifyURL=http%3A%2F%2Ffake.com%2Fqiniu%2Fnotify&');
    //编码
    var encodeSign = sign.digest('base64');
    //最后，将AccessKey和encodedSign用:连接起来
    var accessToken = qiniu.conf.ACCESS_KEY + ':' + encodeSign;
    console.log(accessToken);
    return accessToken;
};

//exports.getAccessToken();

/**
 * 资源上传完成后的回调
 */
exports.uploadCallback = function (req, res) {

    var sql = require('../util/sql');

    var s, i;

    var url;

    if (req.body.mimeType === 'image/jpeg') {
        //如果上传的资源是图片
        //picture_device
        s = 'INSERT INTO picture_device (`key`, id_device, datetime_create) VALUES ("' +
            req.body.etag + '", "' + req.body.device_id + '", ' + req.body.time * 1000 + ')';

        sql.execute(s, function (err) {
            if (err) {
                throw err;
            }
        });

        //resource_picture
        s = 'INSERT INTO resource_picture (bucket, `key`, name, size, type, datetime_upload, width, height) VALUES ("' +
            req.body.bucket + '","' + req.body.etag + '","' + req.body.fname + '","' +
            req.body.fsize + '","' + req.body.mimeType + '",' + req.body.time * 1000 + ',' +
            req.body.width + ',' + req.body.height + ')';

        sql.execute(s, function (err) {
            if (err) {
                throw err;
            }
        });

        var alarmUtil = require('../util/alarmUtil');
        alarmUtil.addAlarm(req.body.device_id, req.body.etag);

        res.end();

    } else if (req.body.mimeType === 'video/mp4') {
        //如果上传的资源是视频
        ////在video_device、resource_video两个表中插入数据
        s = 'INSERT INTO video_device (`key`, id_device, datetime_create) VALUES ("' +
            req.body.etag + '", "' + req.body.device_id + '", ' + req.body.time * 1000 + ')';

        sql.execute(s, function (err) {
            if (err) {
                throw err;
            } else {
                s = 'INSERT INTO resource_video (bucket, `key`, name, size, type, datetime_upload) VALUES ("' +
                    req.body.bucket + '","' + req.body.etag + '","' + req.body.fname + '","' +
                    req.body.fsize + '","' + req.body.mimeType + '",' + req.body.time * 1000 + ')';

                sql.execute(s, function (err) {
                    if (err) {
                        throw err;
                    } else {
                        //两条插入操作成功执行
                        //构造视频链接，根据给定的user_id找到client_sockets发送信息
                        url = getDownloadUrl(domain, req.body.etag);

                        for (i = client_sockets.length - 1; i >= 0; i--) {
                            var c = client_sockets[i];
                            if (c.user_id === req.body.user_id) {
                                if (c.write) {
                                    var protbufConvertor = require('./../socketServer').protbufConvertor;
                                    protbufConvertor(c, {from: req.body.device_id, to: req.body.user_id, info: url, responseStatus: 1, cmd: 2});
                                } else {
                                    c.emit('data', {'type': 'video', 'url': url});
                                }
                            }
                        }

                    }

                });
            }
        });
    }

};