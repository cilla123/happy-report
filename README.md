# happy-report
网站监控上报，客户端代码

## 浏览器直接引用

- 1.下载dist/dist/happy-report.min.js
- 2.html中引入happy-report.min.js文件
- 3.初始化HappyPerformance

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>happy-report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="../dist/happy-report.min.js"></script>
    <script>
        HappyPerformance()
    </script>
</head>
```

## 参数说明：

```js
HappyPerformance({
    domain:'你的上报地址', 
    outtime:500,
    isPage:true,
    isResource:true,
    isError:true,
    filterUrl:['http://www.baidu.com']
},(data)=>{
	fetch('自定义上报地址',{type:'POST',body:JSON.stringify(result)}).then((data)=>{})
})
```

- 同时传入 domain和传入的function ，function优先级更高
- domain：上报api接口
- outtime：上报延迟时间，保证异步数据的加载 （默认：1000ms）
- isPage：是否上报页面性能数据 （默认：true）
- isResource：是否上报页面资源性能数据 （默认：true）
- isError：是否上报页面错误信息数据 （默认：true）
- filterUrl：不需要上报的ajax请求
- fn：自定义上报函数，上报方式可以用ajax可以用fetch (非必填：默认使用fetch)

## otherData  ：上报时自定义的数据

```js
HappyPerformance.otherData(function(data){
    data.userInfo = { "userId": 1, "username": "Ben", "phone": "110" }
})
```

## 结果图
![结果](https://github.com/cilla123/happy-report/blob/master/assets/%E7%BB%93%E6%9E%9C.jpeg?raw=true)


## 提交的数据结构

```json
{
	"page": "http://localhost:8080/test/",  // 当前页面
	"preUrl": "",       // 上一页面
	"type": "resource",	// 请求类型（resource：资源，action: 用户动作）
	"actionList": ["/html", "/html/body/input", "/html", "/html", "/html/body", "/html/body/button[2]"],		// 用户操作流程，xpath
	"appVersion": "5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36", // 当前浏览器信息
	"errorList": [{ // 错误资源列表信息
		"time": 1524060958497,  // 资源时间
		"resource": "resource", // 资源类型
		"msg": "link is load error", // 错误信息
		"data": {
			"target": "link",   // 目标
			"type": "error" // 类型
		},
		"method": "GET"
	}, {
		"time": 1524060960813,
		"resource": "resource",
		"msg": "script is load error",
		"data": {
			"target": "script",
			"type": "error"
		},
		"method": "GET"
	}, {
        "time": 1524060960870,
		"resource": "js",
		"msg": "ReferenceError: weimingming is not defined\n    at http://localhost:8080/test/:42:21",
		"data": {
			"resourceUrl": "http://localhost:8080/test/",   // 资源地址
			"line": 42, // 行号
			"col": 21   // 列
		},
		"method": "GET"    // 请求方法
	}, {
		"time": 1524060961308,
		"resource": "fetch",
		"msg": "fetch请求错误",
		"data": {
			"resourceUrl": "http://rap2api.taobao.o123123rg/app/mock/7042//test/hotel/meizho",
			"text": "TypeError: Failed to fetch",
			"status": 0
		},
		"method": "POST"
	}, {
		"time": 1524061004656,
		"resource": "resource",
		"msg": "img is load error",
		"data": {
			"target": "img",
			"type": "error",
			"resourceUrl": "http://www.baidu222.com92929/"
		},
		"method": "GET"
	}, {
		"time": 1524061006443,
		"resource": "ajax",
		"msg": "ajax请求路径有误",
		"data": {
			"resourceUrl": "http://rap2api.taobao.o123123rg/app/mock/7042//test/hotel/meizho",
			"text": "ajax请求路径有误",
			"status": 0
		},
		"method": "POST"
	}],
	"performance": {    // 页面资源性能数据(单位均为毫秒)
		"dnst": 0,  // DNS解析时间
		"tcpt": 0,  // 	TCP建立时间
		"wit": 9,   // 白屏时间
		"domt": 2403,   // dom渲染完成时间
		"lodt": 46241, // 页面onload时间
		"radt": 2,  // 页面准备时间
		"rdit": 0,  // 页面重定向时间
		"uodt": 0,  // unload时间
		"reqt": 7,  // 	request请求耗时
		"andt": 43839   // 页面解析dom耗时
	},
	"resourceList": [{  // 页面资源性能数据
		"name": "http://localhost:8080/dist/happy-report.min.js",   // 请求资源路径
		"method": "GET",    // 请求方式
		"type": "script",   // 请求资源类型：script，img，fetchrequest，xmlhttprequest，other
		"duration": "50.40",    // 资源耗时
		"decodedBodySize": 6705,    // 资源返回数据大小
		"nextHopProtocol": "http/1.1"   // http协议版本
	}, {
		"name": "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js",
		"method": "GET",
		"type": "script",
		"duration": "2357.30",
		"decodedBodySize": 0,
		"nextHopProtocol": "h2"
	}, {
		"name": "http://localhost:35729/livereload.js?snipver=1",
		"method": "GET",
		"type": "script",
		"duration": "2389.10",
		"decodedBodySize": 0,
		"nextHopProtocol": "http/1.1"
	}, {
		"name": "http://rap2api.taobao.org/app/mock/7042//test/hotel/meizhou",
		"method": "POST",
		"type": "xmlhttprequest",
		"duration": "392.20",
		"decodedBodySize": 0,
		"nextHopProtocol": "http/1.1"
	}],
	"OTHERDATA": {  // 其他自定义的信息
		"userInfo": {
			"userId": 1,
			"username": "Ben",
			"phone": "110"
		}
	}
}
```
