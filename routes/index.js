
exports.index = function (req, res) {
  //判断用户是否已登录，如果没有，渲染登陆页面；否则跳转到用户主页面
  if (req.signedCookies && req.signedCookies.user) {
//    res.redirect('/socketTest');
      res.render('indexForSignedUser', { title: 'Index' });
  } else {
    res.render('index', { title: 'Index' });
  }
};

exports.signup = function (req, res) {
  res.render('signup', {title: '用户注册'});
};