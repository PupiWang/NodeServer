var Q = require('q');
var userUtil = require('../util/userUtil');
var resourceUtil = require('../util/resourceUtil');

/**
 * 根据照片Id获取照片URL
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} picId    照片Id
 */
exports.getPictureByPicId = function (userId, password, picId) {

    var serviceDeferred = Q.defer();

    userUtil.validUser(userId, password)
        .then(function () {
            var deferred = Q.defer();
            deferred.resolve(picId);
            return deferred.promise;
        })
        .then(resourceUtil.getPictureURLByPicId)
        .then(function (data) {
            // Success
            serviceDeferred.resolve(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            serviceDeferred.reject(error);
        });

    return serviceDeferred.promise;

};