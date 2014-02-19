var app = require('./app').app;

// Files
var routes = require('./routes/index'),
  user = require('./routes/user'),
  m_user = require('./mobile/user'),
  m_device = require('./mobile/device'),
  m_resource = require('./mobile/resource'),
  device = require('./routes/device'),
  qn = require('./routes/qiniu');

// Get
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/signup', routes.signup);
app.get('/logout', user.logout);
app.get('/userinfo', user.userinfo);
app.get('/devices', device.getDevices);
app.get('/upToken', qn.getUploadToken);

// app.get('/mobile/user/reset', m_user.reset);
app.get('/mobile/user/sendActivationMessage', m_user.sendActivationMessage);
app.get('/mobile/user/activation', m_user.activation);
app.get('/mobile/device', m_device.device);
app.get('/mobile/resource/pictures', m_resource.pictures);
app.get('/mobile/resource/videos', m_resource.videos);

// Post
app.post('/login', user.login);
app.post('/signup', user.signup);
app.post('/adddevice', device.addDevice);
app.post('/uploadCallback', qn.uploadCallback);
app.post('/modifydevicename', device.modifyName);

app.post('/mobile/user/login', m_user.login);
app.post('/mobile/user/signup', m_user.signup);
app.post('/mobile/user/modify', m_user.modifyPassword);
app.post('/mobile/user/forget', m_user.forget);
app.post('/mobile/user/resetPassword', m_user.resetPassword);
app.post('/mobile/device/add', m_device.addDevice);