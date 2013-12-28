
exports.execute = function (sql, callback) {
  var mysql = require('mysql');

  var connection = mysql.createConnection({
    host     : 'onoveinmysql.mysql.rds.aliyuncs.com',
    user     : 'pupi',
    database : 'onevo',
    password : 'PUPI_1'
  });

  // var connection = mysql.createConnection({
  //   host     : 'localhost',
  //   user     : 'root',
  //   database : 'onevo',
  //   password : 'root'
  // });

  connection.connect(function () {
    console.log(sql);
  });

  connection.query(sql, callback);

  connection.end();

};