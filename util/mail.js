var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
exports.transport = nodemailer.createTransport("SMTP", {
  service: "Hotmail",
  auth: {
    user: 'dreamjl@live.cn',
    pass: 'a7758258'
  }
});

// // setup e-mail data with unicode symbols
// var mailOptions = {
//   from: '皇上<dreamjl@live.cn>', // sender address
//   to: 'wz@ov-orange.com', // list of receivers
//   subject: 'Node Email Test', // Subject line
//   text: 'Node Email Test', // plaintext body
//   html: '<b>Node service start</b>' // html body
// };

// transport.sendMail(mailOptions, function (error, response) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Message sent: " + response.message);
//   }
//   // if you don't want to use this transport object anymore, uncomment following line
//   //smtpTransport.close(); // shut down the connection pool, no more messages
// });