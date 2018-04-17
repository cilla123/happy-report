'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * HappyPerformance
 */
var HappyPerformance = function () {
    function HappyPerformance(options, fn) {
        _classCallCheck(this, HappyPerformance);

        this.init(options);
    }

    /**
     * 初始化
     */


    _createClass(HappyPerformance, [{
        key: 'init',
        value: function init(options) {
            this.initOptions(options);
            this.initOptions();
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
                filterUrl: [],
                // 是否上报页面性能数据
                isUploadPagePerformanceData: true,
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
                // 页面性能列表
                performanceList: [],
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

            if (this.options.isUploadPageErrorInfo) {
                this.handleError();
            }

            // 绑定onload事件
            addEventListener("load", function () {
                _this.loadTime = new Date().getTime() - _this.beginTime;
                getAjaxAndOnLoadTime();
            }, false);
        }

        /**
         * 处理错误信息
         * 进行JS拦截
         */

    }, {
        key: 'handleError',
        value: function handleError() {
            var _this2 = this;

            // 捕捉img, script, css, jsonp
            window.addEventListener('error', function (e) {
                var defaultInfo = Object.assign({}, _this2.errorDefault);
                defaultInfo.resource = 'resource';
                defaultInfo.time = new Date().getTime();
                defaultInfo.msg = e.target.localName + ' \u8BFB\u53D6\u5931\u8D25';
                defaultInfo.method = 'GET';
                defaultInfo.data = {
                    target: e.target.localName,
                    type: e.type,
                    resourceUrl: e.target.currentSrc
                };
                if (e.target != window) {
                    _this2.config.errorList.push(defaultInfo);
                }
            }, true);

            // 捕捉js
            window.onerror = function (msg, url, line, col, error) {
                var defaultInfo = Object.assign({}, _this2.errorDefault);
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
                    _this2.config.errorList.push(defaultInfo);
                }, 0);
            };
        }

        /**
         * 获取Ajax和onLoad时候的时间长度
         */

    }, {
        key: 'getAjaxAndOnLoadTime',
        value: function getAjaxAndOnLoadTime() {}
    }]);

    return HappyPerformance;
}();