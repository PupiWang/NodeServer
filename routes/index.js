
exports.index = function (req, res) {
  res.render('index', { title: 'Express' });
};

exports.upLoadFile = function (req, res) {
  res.render('upload');
};