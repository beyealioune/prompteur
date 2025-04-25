cordova.define("cordova-plugin-video-recorder.VideoRecorder", function(require, exports, module) { 
var exec = require('cordova/exec');

function VideoRecorder() {}

VideoRecorder.prototype.show = function (options, success, error) {
  exec(success, error, 'VideoRecorder', 'show', [options]);
};

VideoRecorder.install = function () {
  window.VideoRecorder = new VideoRecorder();
  return window.VideoRecorder;
};

cordova.addConstructor(VideoRecorder.install);
});