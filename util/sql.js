
exports.execute = function (sql, callback) {
  var mysql = require('mysql');

  var connection = mysql.createConnection({
    host     : 'onevoout.mysql.rds.aliyuncs.com',
    user     : 'pupi',
    database : 'onevo',
    password : 'PUPI_1'
  });

  connection.connect(function () {
    console.log(sql);
  });

  connection.query(sql, callback);

  connection.end();

};