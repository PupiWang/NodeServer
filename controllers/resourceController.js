var resourceService = require('../services/resourceService');

/**
 * 根据照片Id获取照片URL
 * @param  {string} userId   用户名
 * @param  {string} password 密码
 * @param  {string} picId    照片Id
 */
exports.getPictureByPicId = function (req, res) {

    var userId = req.body.userId || req.param('userId'),
        password = req.body.password || req.param('password'),
        picId = req.body.picId || req.param('picId');

    resourceService.getPictureByPicId(userId, password, picId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            // Handle any error from all above steps
            console.log(error);
            res.send(error);
        });

};