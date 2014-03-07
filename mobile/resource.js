var sql = require('../util/sql');
var validUser = require('../util/userUtil').validUser;
var Q = require('q');

exports.pictures = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password');

  validUser(email, password)
    .then(function () {
      //验证通过
      var deferred = Q.defer();
      var s = 'SELECT * FROM resource_picture';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //成功返回结果
      res.send(data);
    })
    .catch(function (error) {
      // Handle any error from all above steps
      console.log('error : ' + error);
      res.send(error);
    });

};

exports.getPicture = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        picId = req.body.picId || req.param('picId');

    var getPictureURL = function () {
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

    validUser(userId, password)
        .then(getPictureURL)
        .then(function (data) {
            //成功返回结果
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log('error : ' + error);
            res.send(error);
        });

};

exports.videos = function (req, res) {

  var email = req.body.email || req.param('email'),
    password = req.body.password || req.param('password');

  validUser(email, password)
    .then(function () {
      //验证通过
      var deferred = Q.defer();
      var s = 'SELECT * FROM resource_video';
      sql.execute(s, function (err, rows, fields) {
        if (err) {
          console.log(err);
          deferred.reject({status: 'error', code: 501, msg: err});
        } else {
          deferred.resolve({status: 'success', code: 1, msg: '验证通过', results: rows});
        }
      });
      return deferred.promise;
    })
    .then(function (data) {
      //成功返回结果
      res.send(data);
    })
    .catch(function (error) {
      // Handle any error from all above steps
      console.log('error : ' + error);
      res.send(error);
    });

};