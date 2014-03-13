
exports.index = function(req, res){
    res.render('productIndex');
};

exports.home = function(req, res){
    res.render('productHome');
};

exports.shop = function(req, res){
    res.render('productShop');
};

exports.download = function(req, res){
    res.render('productDownload');
};

exports.details = function(req, res){
    res.render('productDetails');
};

exports.preorder = function(req, res){
    res.render('productPreorder');
};

exports.contact = function(req, res){
    res.render('productContact');
};