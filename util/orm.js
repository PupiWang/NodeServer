var orm = require("orm");

orm.connect("mysql://pupi:PUPI_1@onevoout.mysql.rds.aliyuncs.com/onevo", function (err, db) {

    db.settings.set("properties.primary_key", "_id");

    var User = db.define('user', {
        email: String,
        phone: String,
        password: String
    })

    User.get(4, function (err, user) {
        if (err) console.log(err);
        console.log(user.password);
    });
});