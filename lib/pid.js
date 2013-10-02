

var Pid = module.exports = function (config) {
  this.config = config;
};


Pid.prototype.downgrade = function (cb) {
  if(typeof cb === 'undefined') {
    cb = function(){};
  }
  //windows can't do this
  if (process.platform === 'win32') {
    return cb(null, null);
  }

  if (process.getuid() === 0) {
    process.setgid(this.config.gid);
    process.setuid(this.config.uid);
  }

  cb(process.getuid(), process.getgid());
};