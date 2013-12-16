
exports.index = function (req, res) {
  console.log(req.signedCookies);
  if (req.signedCookies && req.signedCookies.user) {
    res.redirect('/userinfo');
  } else {
    res.render('index', { title: 'Index' });
  }
};

exports.upLoadFile = function (req, res) {
  res.render('upload');
};