var _ = require('./util');
var bridgeApi = require('./bridge');

var root = _.inBrowser ? window : global;
var JSBridge = root.JSBridge || {};

var bridge = JSBridge;
var config = {
    version: '1.0.0',
    debug: false
};

var eventProps = {
    bubbles: true,
    cancelable: false
};

var eventDetail = {
    bridge: bridge
};

var JSBridgeClient = function getDescriptorFromJSBridgeClient() {
    if (!_.inBrowser) {
        return null;
    }
    var m = navigator.userAgent.match(/JSBridgeClient\/([\d.]*)/);
    if (m) {
        return {
          version: _.numberify(m[1])
        };
    }
    return null;
}();

function set(k, v) {
    var p;
    if (_.isObject(k)) {
        for (p in k) {
            if (_.hasOwnProperty.call(k, p) && _.hasOwnProperty.call(config, p)) {
                config[p] = k[p];
            }
        }
    } else if (_.isString(k)) {
        if (_.hasOwnProperty.call(config, k)) {
            config[k] = v;
        }
    }
};

bridge.set = set;

var bridgeApiList = Object.keys(bridgeApi);

if (JSBridgeClient) {
  try {
      bridgeApiList.forEach(function(api) {
          Object.defineProperty(bridge, api, {
              value: bridgeApi[api]
          });
      });
  } catch (e) {
    alert(JSON.stringify(e));
  }
}

root.JSBridgeReadyEventDispatched = false;

if (_.inBrowser) {
    try {
        Object.defineProperty(window, 'JSBridge', {
            value: bridge,
            writable: false,
            configurable: false,
            enumerable: false
        });
    } catch (e) {}
    if (!root.JSBridgeReadyEventDispatched) {
        var bridgeReadyEvent = _.createEvent('JSBridgeReady', eventProps, eventDetail);
        window.dispatchEvent(bridgeReadyEvent);
        root.JSBridgeReadyEventDispatched = true;
    }
}

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = JSBridge;
}
