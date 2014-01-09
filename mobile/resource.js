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