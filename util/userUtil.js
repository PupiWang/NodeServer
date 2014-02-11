var sql = require('./sql');
var Q = require('q');

exports.validUser = function (email, password) {
  var deferred = Q.defer();

  if (email && password) {
    var s = 'select * from user where email="' + email + '"';
    sql.execute(s, function (err, rows, fields) {

      if (err) {
        console.log(err);
        deferred.reject({status: 'error', code: 501, msg: err});
      } else {
        if (rows.length === 1) {
          if (rows[0].password === password) {
            if (rows[0].activation_date === 0) {
              deferred.reject({status: 'error', code: 404, msg: '此账户尚未激活...'});
            } else {
              deferred.resolve();
            }
          } else {
            deferred.reject({status: 'error', code: 403, msg: '密码错误...'});
          }
        } else {
          deferred.reject({status: 'error', code: 402, msg: '用户名错误...'});
        }
      }

    });

  } else {
    //用户名或密码为空，直接返回false
    deferred.reject({status: 'error', code: 401, msg: '用户名或密码为空,验证无法通过...'});
  }

  return deferred.promise;

};