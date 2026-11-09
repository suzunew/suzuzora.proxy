self.__uv$config = {
  prefix: '/service/',
  bare: '/bare/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/engine/uv.handler.js',
  bundle: '/engine/uv.bundle.js',
  config: '/proxy.config.js',
  client: '/engine/uv.client.js',
  inject: [{
    host: /.*/,
    injectTo: 'head',
    html: '<script>(function(){try{Object.defineProperty(Navigator.prototype,"language",{configurable:true,get:function(){return "ja-JP"}});Object.defineProperty(Navigator.prototype,"languages",{configurable:true,get:function(){return ["ja-JP","ja","en-US","en"]}})}catch(e){}})();</script>'
  }]
};
