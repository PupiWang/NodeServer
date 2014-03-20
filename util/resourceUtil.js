/**
 * 根据PicId获取图片URL
 * @param picId
 * @returns {promise|Q.promise}
 */
exports.getPictureURLByPicId = function (picId) {
    var deferred = Q.defer();
    var qiniu = require('../routes/qiniu');
    var url = qiniu.getUrl(picId);
    if (url) {
        deferred.resolve({status: 'success', code: 1, msg: url});
    } else {
        deferred.reject({status: 'error', code: 1, msg: '该资源不存在'});
    }
    return deferred.promise;
};