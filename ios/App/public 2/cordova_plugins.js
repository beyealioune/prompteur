
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-video-recorder.VideoRecorder",
          "file": "plugins/cordova-plugin-video-recorder/www/VideoRecorder.js",
          "pluginId": "cordova-plugin-video-recorder",
        "clobbers": [
          "window.VideoRecorder"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-video-recorder": "0.0.1"
    };
    // BOTTOM OF METADATA
    });
    