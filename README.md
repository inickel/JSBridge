# 0.客户端需处理

### IOS客户端使用WKWebView时注入

``` javascript
  window.isWKWebView = true;
```

### 客户端升级userAgent

目的是为了嗅探当前webview是否支持bridge的api

```
  JSBridgeClient/1.0.0;
```

# 1.客户端注入对象native

### UIWebView:

``` javascript
  //data is json object， recommend return string
  window.native.postMessage(data);
```
### WKWebView:

``` javascript
//data is json object， recommend return string
  window.webkit.messageHandlers.native.postMessage(data);
```

### AndroidWebView:

``` javascript
  //data is json string
  window.native.postMessage(data);
```

# 2.Invoke类型
### 第一步：```javascript``` 调用客户端方法 ```  window.native.postMessage(data);```

data:

  - methodName：调用方法名称

  - callback_id：回调id

  - data：传递给客户端的数据


``` json
{
  "methodName": "/api",
  "callback_id": 1001,
  "data": {
    "uid": ""
    }
}
```
### 第二步：客户端调用 ```javascript``` 方法 ```window.JSBridge.handleMessageFromNative(message);```

message:

 - type: 'callback' 此时为固定值 'callback'

 - methodName: 调用方法名称

 - callback_id: 回调id

 - data:  需要传递给javascript的数据

``` json
{
  "type": "callback",
  "methodName": "/api",
  "callback_id": 1001,
  "data": {

  }
}
```

# 3.Event类型

  事件类型需要再监听成功后回调给javascript，以便通知用户注册成功或者失败；

  重复监听同个事件类型时：

  - 每次监听都需要回调给javascript；

  - 每次监听配置信息都会覆盖上一次的配置信息，

  - 事件派发条件时native有触发到派发条件时（如右上角按钮被点击），而不是根据监听次数来派发。

  eg：

  第一次调用时：

  data：

  ``` json
  {
    "eventName": "networkChange",
    "callback_id": 1002,
    "data": {
      "text": "1"
    }
  }

  ```

  第二次调用时：

  data：

  ``` json
  {
    "eventName": "networkChange",
    "callback_id": 1002,
    "data": {
      "text": "2"
    }
  }

  ```


## 第一阶段：监听



### 第一步：```javascript``` 调用客户端方法 ```window.native.postMessage(data);```

data:

  - eventName：事件名称

  - callback_id：回调id

  - data：传递给客户端的数据

``` json
{
  "eventName": "networkChange",
  "callback_id": 1001,
  "data": {
    "text": "1"
    }
  }
```
### 第二步：客户端调用 ```javascript``` 方法```window.JSBridge.handleMessageFromNative(message);```

message:

 - type: 'callback' 此时为固定值 callback

 - eventName：事件名称

 - callback_id：回调id

 - data：传递给javascript的数据


``` json
{
  "type": "callback",
  "eventName": "networkChange",
  "callback_id": 1001,
  "data": {

  }
}
```

## 第二阶段：派发

### 第一步：客户端调用 ```javascript``` 方法```window.JSBridge.handleMessageFromNative(message);```

message:

 - type: 'event' 此时为固定值 event

 - eventName：事件名称

 - data：传递给javascript的数据

``` json
{
  "type": "event",
  "eventName": "networkChange",
  "data": {

  }
}
```
客户端调用：window.JSBridge.handleMessageFromNative(message)时

正常返回结果：{code: 200}
异常返回结果：{code: 404}
