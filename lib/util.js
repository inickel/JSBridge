var _ = module.exports;

// convert '1.2.3.4' to 1.234
_.numberify = function numberify(s) {
    var c = 0;
    return parseFloat(s.replace(/\./g, function () {
        return (c++ === 0) ? '.' : '';
    }));
};

_.empty = function empty() {};

_.isAndroid = function isAndroid() {
    return navigator.userAgent.toLowerCase().lastIndexOf('android') > -1;
};

_.isObject = function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
};

_.isFunction = function isFunction(obj) {
    return typeof obj === 'function';
};

_.isString = function isString(obj) {
    return typeof obj === 'string';
};

_.createEvent = function createEvent(type, props, detail) {
    if (!_.inBrowser) {
      return;
    }

    var Event = window.Event;
    var CustomEvent = window.CustomEvent;
    var document = window.document;
    var event;

    if (_.isFunction(Event) && _.isFunction(CustomEvent)) {
        if (detail) {
            return new CustomEvent(type, {
                bubbles: props.bubbles,
                cancelable: props.cancelable,
                detail: detail
            });
        }
        return new Event(type, props);
    }

    if (detail) {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, props.bubbles, props.cancelable, detail);
        return event;
    }
    event = document.createEvent('Event');
    event.initEvent(type, props.bubbles, props.cancelable);
    return event;
};

_.log = function log(message) {
    if (!_.logEnabled()) {
        return;
    }
    if (_.inBrowser) {
        window._debug_log = _.log;
    }

    var date = +new Date;
    message = '[' + date + ']' + message;
    console.log(message);

    var info = typeof message === 'object' ? JSON.stringify(message) : message;
    var logNodeId = '_bridge-debug-container';
    var doc = window.document;
    var pre = doc.createElement('pre');
    var logNode = doc.getElementById(logNodeId);
    var logNodeStyle = [
        'position: absolute',
        'top: 0',
        'left: 0',
        'width: 100%',
        'font-size: 10px',
        'pointer-events: none',
        'padding: 10px',
        'color: #fff',
        'background: rgba(0,0,0,.67)'
    ].join(';');
    var codeStyle = ['white-space: normal', 'word-break: break-all'].join(';');

    if (!logNode) {
        logNode = doc.createElement('div');
        logNode.setAttribute('id', logNodeId);
        logNode.style.cssText = logNodeStyle;
        doc.body.appendChild(logNode);
    }

    pre.style.cssText = codeStyle;
    pre.innerHTML = info;
    logNode.appendChild(pre);
}

_.logEnabled = function logEnabled() {
    var flag = '__debug=1';
    if (!_.inBrowser) {
        return false;
    }
    if (window.location.search.indexOf(flag) > -1) {
        return true;
    }
    if (window.JSBridge && window.JSBridge.debug === true) {
      return true;
    }
    return false;
};

// helpers
_.hasOwnProperty = Object.prototype.hasOwnProperty;

_.inBrowser = !!(typeof window === 'object' && window.document);
