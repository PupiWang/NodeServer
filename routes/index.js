
exports.index = function (req, res) {
  if (req.signedCookies.user) {
    res.redirect('/userinfo');
  } else {
    res.render('index', { title: 'Express' });
  }
};

exports.upLoadFile = function (req, res) {
  res.render('upload');
};