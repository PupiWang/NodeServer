exports.appRoutes = function (app) {
    // Files
    var routes = require('./routes/index'),
        user = require('./routes/user'),
//        m_user = require('./mobile/user'),
//        m_device = require('./mobile/device'),
//        m_resource = require('./mobile/resource'),
//        m_historyAlarm = require('./mobile/historyAlarm'),
        device = require('./routes/device'),
        qn = require('./routes/qiniu'),
        product = require('./routes/product');

    // Get
    app.get('/background', routes.index);
    app.get('/users', user.list);
    app.get('/signup', routes.signup);
    app.get('/logout', user.logout);
    app.get('/userinfo', user.userinfo);
    app.get('/devices', device.getDevices);
    app.get('/upToken', qn.getUploadToken);

    //socket test
    app.get('/socketTest', function (req, res) {
        res.render('socketTest');
    });

    // app.get('/mobile/user/reset', m_user.reset);

//    app.get('/mobile/resource/pictures', m_resource.pictures);
//    app.get('/mobile/resource/videos', m_resource.videos);


    // Post
    app.post('/login', user.login);
    app.post('/signup', user.signup);
    app.post('/adddevice', device.addDevice);
    app.post('/uploadCallback', qn.uploadCallback);
    app.post('/modifydevicename', device.modifyName);



    var controllers = require('./controllers');

    //Lewu product page
    app.get('/', product.index);
    app.get('/home', product.home);
    app.get('/shop', product.shop);
    app.get('/details', product.details);
    app.get('/download', product.download);
    app.get('/preorder', product.preorder);
    app.get('/contact', product.contact);
    app.get('/member', product.member);


    //user
    app.post('/mobile/user/login', controllers.user.login);                                                 //登陆
    app.post('/mobile/user/signup', controllers.user.signup);                                               //注册
    app.post('/mobile/user/modify', controllers.user.modifyPassword);                                       //修改密码
    app.post('/mobile/user/forget', controllers.user.forgetPassword);                                       //忘记密码
    app.post('/mobile/user/resetPassword', controllers.user.resetPassword);                                 //重置密码
    app.get('/mobile/user/sendActivationMessage', controllers.user.sendActivationMessage);                  //发送激活码
    app.get('/mobile/user/activation', controllers.user.activateUser);                                      //激活用户

    //device
    app.get('/mobile/device', controllers.device.getDevicesByUser);                                         //获取设备列表
    app.get('/mobile/device/getUsersByDevice', controllers.device.getUsersByDevice);                        //获取设备关联的普通用户
    app.post('/mobile/device/bindingAdmin', controllers.device.bindingAdmin);                               //绑定管理员
    app.post('/mobile/device/bindingUser', controllers.device.bindingUser);                                 //绑定普通用户
    app.post('/mobile/device/removeUser', controllers.device.removeUser);                                   //解绑普通用户
    app.post('/mobile/device/modifyDisplayName', controllers.device.modifyDeviceName);                      //修改显示名
    app.post('/mobile/device/switchDeviceAlarm', controllers.device.switchDeviceAlarm);                     //设备报警开关

    //resource
    app.get('/mobile/resource/getPicture', controllers.resource.getPictureByPicId);                         //获取照片资源链接

    //alarm
    app.get('/mobile/historyAlarm', controllers.alarm.getHistoryAlarm);                                     //获取历史告警
    app.post('/mobile/historyAlarm/readHistoryAlarm', controllers.alarm.readHistoryAlarm);                  //更新告警状态

};