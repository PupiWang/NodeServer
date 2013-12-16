
exports.index = function (req, res) {
  if (req.cookies.user) {
    res.redirect('/userinfo');
  } else {
    res.render('index', { title: 'Index' });
  }
};

exports.upLoadFile = function (req, res) {
  res.render('upload');
};