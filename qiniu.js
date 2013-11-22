var qiniu=require('node-qiniu');

qiniu.config({
  access_key: 'Q-IdFFb3t_WoE_u_cHHB0cG5TM4ABtetTlsBsXW6',
  secret_key: 'up-RiROP73u2M8hf94ysPRFf9OlDGr07Xr426r9R'
});

var imagesBucket = qiniu.bucket('ov-orange');

imagesBucket.putFile('exampleKey', __dirname + '/example.jpg', function(err, reply) {
  if (err) {
    return console.error(err);
  }

  console.dir(reply);
});