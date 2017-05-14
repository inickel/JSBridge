var _ = require('./util');

var callbacksMap = {};
var eventHandlersMap = {};
var _callbackCount = 1000;
var _callbackIdKey = 'callback_id';
var _eventNameKey = 'eventName';
var _methodNameKey = 'methodName';
var _messageTypeKey = 'type';
var _messageDataKey = 'data';

module.exports = {
    invoke: invoke,
    wait: invoke,
    listen: on,
    on: on,
    off: off,
    handleMessageFromNative: handleMessageFromNative,
    postMessageToNative: postMessageToNative
};

function invoke(methodName, options, callback) {
    options = options || {};
    var callbackId = (_callbackCount++).toString();
    var data = {};

    data[_callbackIdKey] = callbackId;
    data[_methodNameKey] = methodName;
    data.data = options;
    if (typeof callback === 'function') {
        callbacksMap[callbackId] = callback;
    } else {
        callbacksMap[callbackId] = _.empty;
    }

    postMessageToNative(data);
};

function on(eventName, options, eventHandler, force) {
    options = options || {};
    var replace = true;

    if (typeof force !== 'undefined') {
        replace = !!force;
    }

    eventHandler = _.isFunction(eventHandler) ? eventHandler : _.empty;
    var callbackId = (_callbackCount++).toString();
    var callback = _.empty;
    var data = {};
    data[_callbackIdKey] = callbackId;
    data[_eventNameKey] = eventName;

    if (options.callback && _.isFunction(options.callback)) {
        callback = options.callback;
        delete options.callback;
    };

    data.data = options;
    callbacksMap[callbackId] = callback;

    if (replace || typeof eventHandlersMap[eventName] === 'undefined') {
        eventHandlersMap[eventName] = [];
    }

    var handlers = eventHandlersMap[eventName];
    handlers.push(eventHandler);
    eventHandlersMap[eventName] = handlers;
    postMessageToNative(data);

}

function off(eventName) {
    eventHandlersMap[eventName] = undefined;
}

function handleMessageFromNative(message) {
    _.log('[receive] ' + JSON.stringify(message));

    try {
        var type = message[_messageTypeKey];
        var data = message[_messageDataKey];
        if (type === 'callback') {
            var callbackId = message[_callbackIdKey];
            var callback = callbacksMap[callbackId];
            callback(message[_methodNameKey], data);
        } else if (type === 'event') {
            var eventName = message[_eventNameKey];
            var handlers = eventHandlersMap[eventName];
            if (Array.isArray(handlers)) {
                handlers.forEach(function (h) {
                    if (_.isFunction(h)) {
                        h(eventName, data);
                    }
                });
            }
        }
    } catch (e) {}
}

var isRejected = false;
var messageQueen = [];

function postMessageToNative(data) {
    _.log('[send] ' + JSON.stringify(data));
    messageQueen.push(data);
    flushMessageQueen();
}

function flushMessageQueen() {
  if (isRejected) {
    var data = messageQueen.shift();
    return excute(data);
  } else {
    var i = setInterval(function() {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
        var data = messageQueen.shift();
        clearInterval(i);
        isRejected = true;
        return excute(data);
      } else if (window.native) {
        var data = messageQueen.shift();
        isRejected = true;
        clearInterval(i);
        return excute(data);
      }
    }, 100);
  }
}

function excute(data) {
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
    return window.webkit.messageHandlers.native.postMessage(data);
  } else if (window.native) {
    if (_.isAndroid()) {
      return window.native.postMessage(JSON.stringify(data));
    } else {
      return window.native.postMessage(data);
    }
  }
}
