var sql = require('./sql');

exports.validUser = function (email, password) {

  if (email && password) {
    var s = 'select * from user where email="' + email + '"';
    sql.execute(s, function (err, rows, fields) {

      if (err) {
        console.log(err);
      } else {
        if (rows.length === 1 && rows[0].password === password) {
          return true;
        }
        return false;
      }

    });
  } else {
    //用户名或密码为空，直接返回false
    return false;
  }
};