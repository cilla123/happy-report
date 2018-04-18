'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * HappyPerformance
 */
var HappyPerformance = function () {
    function HappyPerformance(options, fn) {
        _classCallCheck(this, HappyPerformance);

        this.fn = fn;
        this.init(options);
    }

    /**
     * 初始化
     */


    _createClass(HappyPerformance, [{
        key: 'init',
        value: function init(options) {
            this.initOptions(options);
            this.initConfig();
            this.initDefaultData();
            this.initErrorDefault();
            this.initEvent();
        }

        /**
         * 初始化选择项
         */

    }, {
        key: 'initOptions',
        value: function initOptions(options) {
            // 选择项
            this.options = Object.assign({
                // 上报地址
                domain: '',
                // 延迟上报时间
                outTimt: 1000,
                // ajax请求的时候需要过滤的url信息
                filterUrl: ['http://localhost:35729/livereload.js?snipver=1', 'https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js', 'http://localhost:8080/dist/happy-report.js'],
                // 是否上报页面性能数据
                isUploadPagePerformanceData: true,
                // 是否上报页面资源数据
                isUploadPageResource: true,
                // 是否上报错误信息
                isUploadPageErrorInfo: true
            }, options || {});
        }

        /**
         * 初始化配置
         */

    }, {
        key: 'initConfig',
        value: function initConfig() {
            this.config = {
                // 资源列表
                resourceList: [],
                // 页面性能集合
                performance: {},
                // 错误列表
                errorList: [],
                // 页面fetch数量
                fetchNumber: 0,
                // 读取的数量
                loadNumer: 0,
                // 页面ajax数量
                ajaxLength: 0,
                // 页面fetch总数量
                fetLength: 0,
                // 页面ajax信息
                ajaxMsg: [],
                // ajax成功执行函数
                goingType: '',
                // 是否有ajax
                haveAjax: false,
                // 是否有fetch
                haveFetch: false,
                // 来自域名
                preUrl: document.referrer && document.referrer !== window.location.href ? document.referrer : '',
                // 浏览器信息
                appVersion: navigator.appVersion,
                // 当前页面
                page: window.location.href
            };
        }

        /**
         * 默认错误信息
         */

    }, {
        key: 'initErrorDefault',
        value: function initErrorDefault() {
            this.errorDefault = {
                time: '',
                resource: 'js',
                msg: '',
                data: {}
            };
        }

        /**
         * 初始化默认值
         */

    }, {
        key: 'initDefaultData',
        value: function initDefaultData() {
            this.beginTime = new Date().getTime();
            this.loadTime = 0;
            this.ajaxTime = 0;
            this.fetchTime = 0;
        }

        /**
         * 初始化事件
         */

    }, {
        key: 'initEvent',
        value: function initEvent() {
            var _this = this;

            // 处理错误
            if (this.options.isUploadPageErrorInfo) {
                this.handleError();
            }

            // 绑定onload事件
            addEventListener("load", function () {
                _this.loadTime = new Date().getTime() - _this.beginTime;
                _this.getAjaxAndOnLoadTime();
            }, false);

            // 执行fetch重写
            if (this.options.isUploadPageResource || this.options.isUploadPageErrorInfo) {
                this.handleFetch();
            }

            // 拦截Ajax
            if (this.options.isUploadPageResource || this.options.isUploadPageErrorInfo) {
                this.handleAjax();
            }
        }

        /**
         * 处理错误信息
         * 进行JS拦截
         */

    }, {
        key: 'handleError',
        value: function handleError() {

            var self = this;

            // 捕捉img, script, css, jsonp
            window.addEventListener('error', function (e) {
                console.log(e);
                var defaultInfo = Object.assign({}, self.errorDefault);
                defaultInfo.resource = 'resource';
                defaultInfo.time = new Date().getTime();
                defaultInfo.msg = e.target.localName + ' \u8BFB\u53D6\u5931\u8D25';
                defaultInfo.method = 'GET';
                defaultInfo.data = {
                    target: e.target.localName,
                    type: e.type,
                    resourceUrl: e.target.localName == 'img' ? e.target.currentSrc : e.target.href
                };
                if (e.target != window) {
                    console.log(defaultInfo);
                    self.config.errorList.push(defaultInfo);
                }
            }, true);

            // 捕捉js
            window.onerror = function (msg, url, line, col, error) {
                var defaultInfo = Object.assign({}, self.errorDefault);
                // 使用定时器为了，以最小单元来捕捉线上代码，不然很容易出错
                setTimeout(function () {
                    col = col || window.event && window.event.errorCharacter || 0;
                    defaultInfo.msg = error && error.stack ? error.stack.toString() : msg;
                    defaultInfo.method = 'GET';
                    defaultInfo.data = {
                        line: line,
                        col: col,
                        resourceUrl: url
                    };
                    defaultInfo.time = new Date().getTime();
                    console.log(defaultInfo);
                    self.config.errorList.push(defaultInfo);
                }, 1000);
            };
        }

        /**
         * 获取Ajax和onLoad时候的时间长度
         */

    }, {
        key: 'getAjaxAndOnLoadTime',
        value: function getAjaxAndOnLoadTime() {
            var _config = this.config,
                haveAjax = _config.haveAjax,
                haveFetch = _config.haveFetch;

            var ajaxTime = this.ajaxTime;
            var fetchTime = this.fetchTime;
            var loadTime = this.loadTime;
            console.log(haveAjax, haveFetch, ajaxTime, fetchTime, loadTime);
            if (haveAjax && haveFetch && loadTime && fetchTime) {
                console.table({ loadTime: loadTime, ajaxTime: ajaxTime, fetchTime: fetchTime });
                this.reportData();
            } else if (haveAjax && !haveFetch && ajaxTime && loadTime) {
                console.table({ loadTime: loadTime, ajaxTime: ajaxTime });
                this.reportData();
            } else if (!haveAjax && haveFetch && loadTime && fetchTime) {
                console.table({ loadTime: loadTime, fetchTime: fetchTime });
                this.reportData();
            } else if (!haveAjax && !haveFetch && loadTime) {
                console.table({ loadTime: loadTime });
                this.reportData();
            }
        }

        /**
         * 数据汇报
         */

    }, {
        key: 'reportData',
        value: function reportData() {
            var _this2 = this;

            setTimeout(function () {
                if (_this2.options.isUploadPagePerformanceData) {
                    _this2.performancePage();
                }
                if (_this2.options.isUploadPageResource) {
                    _this2.performanceResource();
                }
                var _config2 = _this2.config,
                    page = _config2.page,
                    preUrl = _config2.preUrl,
                    appVersion = _config2.appVersion,
                    errorList = _config2.errorList,
                    performance = _config2.performance,
                    resourceList = _config2.resourceList;

                var reuslt = {
                    page: page,
                    preUrl: preUrl,
                    appVersion: appVersion,
                    errorList: errorList,
                    performance: performance,
                    resourceList: resourceList
                };
                console.log(JSON.stringify(reuslt));
                _this2.fn && _this2.fn(reuslt);
                if (!_this2.fn && window.fetch) {
                    fetch(_this2.options.domain, {
                        method: "POST",
                        type: "report-data",
                        body: JSON.stringify(reuslt)
                    });
                }
            }, this.options.outTimt);
        }

        /**
         * 统计页面性能
         */

    }, {
        key: 'performancePage',
        value: function performancePage() {
            if (!window.performance) return;
            var timing = performance.timing;
            this.config.performance = {
                // DNS解析时间
                dnst: timing.domainLookupEnd - timing.domainLookupStart || 0,
                //TCP建立时间
                tcpt: timing.connectEnd - timing.connectStart || 0,
                // 白屏时间  
                wit: timing.responseStart - timing.navigationStart || 0,
                //dom渲染完成时间
                domt: timing.domContentLoadedEventEnd - timing.navigationStart || 0,
                //页面onload时间
                lodt: timing.loadEventEnd - timing.navigationStart || 0,
                // 页面准备时间 
                radt: timing.fetchStart - timing.navigationStart || 0,
                // 页面重定向时间
                rdit: timing.redirectEnd - timing.redirectStart || 0,
                // unload时间
                uodt: timing.unloadEventEnd - timing.unloadEventStart || 0,
                //request请求耗时
                reqt: timing.responseEnd - timing.requestStart || 0,
                //页面解析dom耗时
                andt: timing.domComplete - timing.domInteractive || 0
            };
        }

        /**
         * 统计页面资源性能
         */

    }, {
        key: 'performanceResource',
        value: function performanceResource() {
            var _this3 = this;

            if (!window.performance && !window.performance.getEntries) return false;
            var resource = performance.getEntriesByType('resource');

            var resourceList = [];
            if (!resource && !resource.length) return resourceList;

            resource.forEach(function (item) {
                var json = {
                    name: item.name,
                    method: 'GET',
                    type: item.initiatorType,
                    duration: item.duration.toFixed(2) || 0,
                    decodedBodySize: item.decodedBodySize || 0,
                    nextHopProtocol: item.nextHopProtocol
                };
                var ajaxMsg = _this3.config.ajaxMsg;

                if (ajaxMsg && ajaxMsg.length) {
                    for (var i = 0, len = ajaxMsg.length; i < len; i++) {
                        if (ajaxMsg[i].url === item.name) {
                            json.method = ajaxMsg[i].method || 'GET';
                            json.type = ajaxMsg[i].type || json.type;
                        }
                    }
                }
                resourceList.push(json);
            });
            this.config.resourceList = resourceList;
        }

        /**
         * 处理fetch
         */

    }, {
        key: 'handleFetch',
        value: function handleFetch() {
            if (!window.fetch) return;
            var _fetch = fetch;
            var self = this;
            window.fetch = function () {
                var result = self.fetchArg(arguments);
                if (result.type !== 'report-data') {
                    self.clearPerformance();
                    self.config.ajaxMsg.push(result);
                    self.config.fetLength = self.config.fetLength + 1;
                    self.config.haveFetch = true;
                }
                return _fetch.apply(this, arguments).then(function (res) {
                    if (result.type === 'report-data') return;
                    self.getFetchTime('success');
                    return res;
                }).catch(function (err) {
                    if (result.type === 'report-data') return;
                    self.getFetchTime('error');
                    var defaultInfo = Object.assign({}, self.errorDefault);
                    defaultInfo.time = new Date().getTime();
                    defaultInfo.resource = 'fetch';
                    defaultInfo.msg = 'fetch请求错误';
                    defaultInfo.method = result.method;
                    defaultInfo.data = {
                        resourceUrl: result.url,
                        text: err.stack || err,
                        status: 0
                    };
                    self.config.errorList.push(defaultInfo);
                    return err;
                });
            };
        }

        /**
         * 处理ajax
         */

    }, {
        key: 'handleAjax',
        value: function handleAjax() {
            var self = this;
            this.Ajax({
                onreadystatechange: function onreadystatechange(xhr) {
                    if (xhr.readyState === 4) {
                        setTimeout(function () {
                            if (self.config.goingType === 'load') return;
                            self.config.goingType = 'readychange';

                            self.getAjaxTime('readychange');

                            if (xhr.status < 200 || xhr.status > 300) {
                                xhr.method = xhr.args.method;
                                self.ajaxResponse(xhr);
                            }
                        }, 600);
                    }
                },
                onerror: function onerror(xhr) {

                    console.log("*---------*");
                    console.log(xhr);
                    console.log("*---------*");

                    self.getAjaxTime('error');
                    if (xhr.args) {
                        xhr.method = xhr.args.method;
                        xhr.responseURL = xhr.args.url;
                        xhr.statusText = 'ajax请求路径错误!';
                    }
                    self.ajaxResponse(xhr);
                },
                onload: function onload(xhr) {
                    if (xhr.readyState === 4) {
                        if (self.config.goingType === 'readychange') return;
                        self.config.goingType = 'load';
                        self.getAjaxTime('load');
                        if (xhr.status < 200 || xhr.status > 300) {
                            xhr.method = xhr.args.method;
                            self.ajaxResponse(xhr);
                        }
                    }
                },
                open: function open(arg, xhr) {
                    if (self.options.filterUrl && self.options.filterUrl.length) {
                        var begin = false;
                        self.options.filterUrl.forEach(function (item) {
                            if (arg[1].indexOf(item) != -1) begin = true;
                        });
                        if (begin) return;
                    }
                    var result = { url: arg[1], method: arg[0] || 'GET', type: 'xmlhttprequest' };
                    self.args = result;

                    self.clearPerformance();
                    self.config.ajaxMsg.push(result);
                    self.config.ajaxLength = self.config.ajaxLength + 1;
                    self.config.haveAjax = true;
                }
            });
        }

        /**
         * fetch参数
         */

    }, {
        key: 'fetchArg',
        value: function fetchArg(arg) {
            var result = { method: 'GET', type: 'fetchrequest' };
            var args = Array.prototype.slice.apply(arg);
            if (!args || !args.length) return result;
            try {
                if (args.length === 1) {
                    if (typeof args[0] === 'string') {
                        result.url = args[0];
                    } else if (_typeof(args[0]) === 'object') {
                        result.url = args[0].url;
                        result.method = args[0].method;
                    }
                } else {
                    result.url = args[0];
                    result.method = args[1].method;
                    result.type = args[1].type;
                }
            } catch (err) {
                console.log(err);
            }
            return result;
        }

        /**
         * 清理Performance
         */

    }, {
        key: 'clearPerformance',
        value: function clearPerformance() {
            if (!window.performance && !window.performance.clearResourceTimings) return;
            var _config3 = this.config,
                haveAjax = _config3.haveAjax,
                haveFetch = _config3.haveFetch,
                ajaxLength = _config3.ajaxLength,
                fetLength = _config3.fetLength;

            if (haveAjax && haveFetch && ajaxLength == 0 && fetLength == 0) {
                clear();
            } else if (!haveAjax && haveFetch && fetLength == 0) {
                clear();
            } else if (haveAjax && !haveFetch && ajaxLength == 0) {
                clear();
            }
        }

        /**
         * 清楚Performance
         */

    }, {
        key: 'clear',
        value: function clear() {
            performance.clearResourceTimings();
            this.config.performance = {};
            this.config.errorList = [];
            this.config.preUrl = '';
            this.config.resourceList = '';
            this.config.page = window.location.href;
        }

        /**
         * 获取Fetch的时间
         */

    }, {
        key: 'getFetchTime',
        value: function getFetchTime(type) {
            this.config.fetchNumber += 1;
            if (this.config.fetLength === this.config.fetchNumber) {
                if (type == 'success') {
                    console.log('fetch success');
                } else {
                    console.log('fetch error');
                }
                this.config.fetchNumber = this.config.fetLength = 0;
                this.fetchTime = new Date().getTime() - this.beginTime;
                this.getAjaxAndOnLoadTime();
            }
        }

        /**
         * 获取ajax的时间
         */

    }, {
        key: 'getAjaxTime',
        value: function getAjaxTime(type) {
            this.config.loadNumer += 1;
            if (this.config.loadNumer === this.config.ajaxLength) {
                if (type == 'load') {
                    console.log('====================================');
                    console.log('AJAX onload');
                    console.log('====================================');
                } else if (type == 'readychange') {
                    console.log('====================================');
                    console.log('AJAX onreadystatechange 方法');
                    console.log('====================================');
                } else {
                    console.log('====================================');
                    console.log('error 方法');
                    console.log('====================================');
                }
                this.config.ajaxLength = this.config.loadNumer = 0;
                this.ajaxTime = new Date().getTime() - this.beginTime;
                this.getAjaxAndOnLoadTime();
            }
        }

        /**
         * ajax响应汇报
         */

    }, {
        key: 'ajaxResponse',
        value: function ajaxResponse(xhr, type) {
            var defaultInfo = Object.assign({}, this.errorDefault);
            defaultInfo.time = new Date().getTime();
            defaultInfo.resource = 'ajax';
            defaultInfo.msg = xhr.statusText || 'ajax请求错误';
            defaultInfo.method = xhr.method;
            defaultInfo.data = {
                resourceUrl: xhr.responseURL,
                text: xhr.statusText,
                status: xhr.status
            };
            this.config.errorList.push(defaultInfo);
        }

        /**
         * AJax
         */

    }, {
        key: 'Ajax',
        value: function Ajax(funs) {
            window._ahrealxhr = window._ahrealxhr || XMLHttpRequest;
            XMLHttpRequest = function XMLHttpRequest() {

                this.xhr = new window._ahrealxhr();
                for (var attr in this.xhr) {
                    var type = "";
                    try {
                        type = _typeof(this.xhr[attr]);
                    } catch (e) {}
                    if (type === "function") {
                        this[attr] = hookfun(attr);
                    } else {
                        Object.defineProperty(this, attr, {
                            get: getFactory(attr),
                            set: setFactory(attr)
                        });
                    }
                }
            };

            /**
             * 获取工厂
             */
            function getFactory(attr) {
                return function () {
                    return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                };
            }

            /**
             * 设置工厂
             */
            function setFactory(attr) {
                return function (f) {
                    var xhr = this.xhr;
                    var that = this;
                    if (attr.indexOf("on") != 0) {
                        this[attr + "_"] = f;
                        return;
                    }
                    if (funs[attr]) {
                        xhr[attr] = function () {
                            funs[attr](that) || f.apply(xhr, arguments);
                        };
                    } else {
                        xhr[attr] = f;
                    }
                };
            }

            /**
             * 钩子函数
             */
            function hookfun(fun) {
                return function () {
                    var args = [].slice.call(arguments);
                    if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
                        return;
                    }
                    console.log(this.xhr[fun].apply(this.xhr, args));
                    return this.xhr[fun].apply(this.xhr, args);
                };
            }

            return window._ahrealxhr;
        }
    }]);

    return HappyPerformance;
}();