const Ajax = require('./ajax')

/**
 * HappyPerformance
 */
class HappyPerformance {

    constructor(options, fn){
        this.init(options)
        this.fn = fn
    }

    /**
     * 初始化
     */
    init(options){
        this.initOptions(options)
        this.initOptions()
        this.initErrorDefault()
        this.initEvent()
    }

    /**
     * 初始化选择项
     */
    initOptions(options){
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
            // 是否上报页面资源数据
            isUploadPageResource: true,
            // 是否上报错误信息
            isUploadPageErrorInfo: true
        }, options || {})
    }

    /**
     * 初始化配置
     */
    initConfig(){
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
            page: window.location.href,
        }
    }

    /**
     * 默认错误信息
     */
    initErrorDefault(){
        this.errorDefault = {
            time: '',   
            resource: 'js',
            msg: '',  
            data: {}
        }
    }

    /**
     * 初始化默认值
     */
    initDefaultData(){
        this.beginTime = new Date().getTime()
        this.loadTime = 0
        this.ajaxTime = 0
        this.fetchTime = 0
    }

    /**
     * 初始化事件
     */
    initEvent(){
        // 处理错误
        if (this.options.isUploadPageErrorInfo) {
            this.handleError()
        }

        // 绑定onload事件
        addEventListener("load", () => {
            this.loadTime = new Date().getTime() - this.beginTime
            getAjaxAndOnLoadTime()
        },false)

        // 执行fetch重写
        if(this.options.isUploadPageResource || this.options.isUploadPageErrorInfo) {
            this.handleFetch()
        }

        // 拦截Ajax
        if (this.options.isUploadPageResource || this.options.isUploadPageErrorInfo) {
            this.handleAjax()
        }
    }

    /**
     * 处理错误信息
     * 进行JS拦截
     */
    handleError(){
        // 捕捉img, script, css, jsonp
        window.addEventListener('error', (e) => {
            const defaultInfo = Object.assign({}, this.errorDefault)
            defaultInfo.resource = 'resource'
            defaultInfo.time = new Date().getTime()
            defaultInfo.msg = `${e.target.localName} 读取失败`
            defaultInfo.method = 'GET'
            defaultInfo.data = {
                target: e.target.localName,
                type: e.type,
                resourceUrl: e.target.currentSrc
            }
            if (e.target != window) {
                this.config.errorList.push(defaultInfo)
            }
        }, true)

        // 捕捉js
        window.onerror = (msg, url, line, col, error) => {
            const defaultInfo = Object.assign({}, this.errorDefault)
            // 使用定时器为了，以最小单元来捕捉线上代码，不然很容易出错
            setTimeout(() => {
                col = col || (window.event && window.event.errorCharacter) || 0
                defaultInfo.msg = error && error.stack ? error.stack.toString() : msg
                defaultInfo.method = 'GET'
                defaultInfo.data = {
                    line,
                    col,
                    resourceUrl: url,
                }
                defaultInfo.time = new Date().getTime()
                this.config.errorList.push(defaultInfo)
            }, 0)
        } 
    }

    /**
     * 获取Ajax和onLoad时候的时间长度
     */
    getAjaxAndOnLoadTime(){
        const { haveAjax, haveFetch } = this.config
        const ajaxTime = this.ajaxTime
        const fetchTime = this.fetchTime
        const loadTime = this.loadTime
        if (haveAjax && haveFetch && loadTime && fetchTime) {
            console.table({ loadTime, ajaxTime, fetchTime })
            this.reportData()
        }else if(haveAjax && !haveFetch && ajaxTime && loadTime){
            console.table({ loadTime, ajaxTime })        
            this.reportData()                
        }else if (!haveAjax && haveFetch && loadTime && fetchTime) {
            console.table({ loadTime, fetchTime })     
            this.reportData()                   
        }else if(!haveAjax && !haveFetch && loadTime){
            console.table({ loadTime })       
            this.reportData()                             
        }
    }

    /**
     * 数据汇报
     */
    reportData(){
        setTimeout(() => {
            if (this.options.isUploadPagePerformanceData) {
                this.performancePage()
            }
            if (this.options.isUploadPageResource) {
                this.performanceResource()
            }
            const { page, preUrl, appVersion, errorList, performance, resourceList } = this.config
            const reuslt = {
                page,
                preUrl,
                appVersion,
                errorList,
                performance,
                resourceList
            }
            console.log(JSON.stringify(reuslt))
            this.fn && this.fn(reuslt)
            if (!this.fn && window.fetch) {
                fetch(this.options.domain, {
                    method: "POST",
                    type: "report-data",
                    body: JSON.stringify(reuslt)
                })
            }
        }, this.options.outTimt)
    }

    /**
     * 统计页面性能
     */
    performancePage(){
        if (!window.performance) return;
    	const timing = performance.timing
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
    		andt: timing.domComplete - timing.domInteractive || 0, 
    	}
    }

    /**
     * 统计页面资源性能
     */
    performanceResource(){
        if (!window.performance && !window.performance.getEntries) return false;
    	const resource = performance.getEntriesByType('resource')

    	const resourceList = [];
    	if(!resource && !resource.length) return resourceList;

    	resource.forEach((item) => {
    		const json = {
                name: item.name,
                method: 'GET',
                type: item.initiatorType,
                duration: item.duration.toFixed(2) || 0,
                decodedBodySize: item.decodedBodySize || 0,
                nextHopProtocol: item.nextHopProtocol,
            }
            const { ajaxMsg } = this.config
            if(ajaxMsg && ajaxMsg.length){
                for( let i=0,len = ajaxMsg.length; i < len;i++ ){
                    if(ajaxMsg[i].url === item.name){
                        json.method = ajaxMsg[i].method || 'GET'
                        json.type = ajaxMsg[i].type || json.type
                    }
                }
            }
            resourceList.push(json)
    	})
        this.conf.resourceList = resourceList
    }

    /**
     * 处理fetch
     */
    handleFetch(){
        if(!window.fetch) return
        let _fetch = fetch 
        const self = this
    	window.fetch = function() {
            const result = self.fetchArg(arguments)
            if(result.type !== 'report-data'){
                self.clearPerformance()
                self.conf.ajaxMsg.push(result)
                self.conf.fetLength = self.conf.fetLength + 1
                self.conf.haveFetch = true
            }
    		return _fetch.apply(this, arguments).then((res)=>{ 
                if(result.type === 'report-data') return
                self.getFetchTime('success')
                return res 
            }).catch((err)=>{ 
                if(result.type === 'report-data') return
                self.getFetchTime('error')
                const defaultInfo = Object.assign({}, self.errorDefault)
                defaultInfo.time = new Date().getTime()
                defaultInfo.resource = 'fetch'
                defaultInfo.msg = 'fetch请求错误'
                defaultInfo.method = result.method
                defaultInfo.data = {
                    resourceUrl: result.url,
                    text:err.stack || err,
                    status: 0
                }
                self.conf.errorList.push(defaultInfo)
                return err  
            });
    	}
    }

    /**
     * 处理ajax
     */
    handleAjax(){
        Ajax({
            onreadystatechange: (xhr) => {
                if (xhr.readyState === 4) {
                    setTimeout(() => {
                        const { goingType } = this.config
                        if (goingType === 'load') return
                        goingType = 'readychange'

                        this.getAjaxTime('readychange')

                        if (xhr.status < 200 || xhr.status > 300) {
                            xhr.method = xhr.args.method
                            this.ajaxResponse(xhr)
                        }
                    }, 600)
                }
            },
            onerror: (xhr) => {
                this.getAjaxTime('error')
                if (xhr.args && xhr.args.length) {
                    xhr.method = xhr.args.method
                    xhr.responseURL = xhr.args.url
                    xhr.statusText = 'ajax请求路径错误!'
                }
                this.ajaxResponse(xhr)
            },
            onload: (xhr) => {
                if (xhr.readyState === 4) {
                    const { goingType } = this.config
                    if (goingType === 'readychange') return
                    goingType = 'load'
                    this.getAjaxTime('load')
                    if (xhr.status < 200 || xhr.status > 300) {
                        xhr.method = xhr.args.method
                        this.ajaxResponse(xhr)
                    }
                }
            },
            open: (arg, xhr) => {
                if (this.options.filterUrl && this.options.filterUrl.length) {
                    let begin = false
                    this.options.filterUrl.forEach(item => { if (arg[1].indexOf(item) != -1) begin = true })
                    if (begin) return
                }

                const result = { url: arg[1], method: arg[0] || 'GET', type: 'xmlhttprequest' }
                this.args = result

                this.clearPerformance()
                this.config.ajaxMsg.push(result)
                this.config.ajaxLength = this.config.ajaxLength + 1;
                this.config.haveAjax = true
            }
        })
    }

    /**
     * fetch参数
     */
    fetchArg(){
        const result = { method: 'GET', type: 'fetchrequest' }
        const args = Array.prototype.slice.apply(arg)

        if (!args || !args.length) return result;
        try {
            if (args.length === 1) {
                if (typeof (args[0]) === 'string') {
                    result.url = args[0]
                } else if (typeof (args[0]) === 'object') {
                    result.url = args[0].url
                    result.method = args[0].method
                }
            } else {
                result.url = args[0]
                result.method = args[1].method
                result.type = args[1].type
            }
        } catch (err) { }
        return result
    }

    /**
     * 清理Performance
     */
    clearPerformance(){
        if (!window.performance && !window.performance.clearResourceTimings) return
        const { haveAjax, haveFetch, ajaxLength, fetLength } = this.config
        if (haveAjax && haveFetch && ajaxLength == 0 && fetLength == 0) {
            clear()
        } else if (!haveAjax && haveFetch && fetLength == 0) {
            clear()
        } else if (haveAjax && !haveFetch && ajaxLength == 0) {
            clear()
        }
    }

    /**
     * 清楚Performance
     */
    clear() {
        performance.clearResourceTimings();
        this.config.performance = {}
        this.config.errorList = []
        this.config.preUrl = ''
        this.config.resourceList = ''
        this.config.page = window.location.href
    }

    /**
     * 获取Fetch的时间
     */
    getFetchTime(){
        this.config.fetchNumber += 1
        if (this.config.fetLength === this.config.fetchNumber) {
            if (type == 'success') {
                console.log('fetch success')
            } else {
                console.log('fetch error')
            }
            this.config.fetchNumber = this.config.fetLength = 0
            this.fetchTime = new Date().getTime() - beginTime
            this.getAjaxAndOnLoadTime()
        }
    }

    /**
     * 获取ajax的时间
     */
    getAjaxTime(){
        this.config.loadNumer += 1
        if (this.config.loadNumer === this.config.ajaxLength) {
            if (type == 'load') {
                console.log('====================================')
                console.log('AJAX onload')
                console.log('====================================')
            } else if (type == 'readychange') {
                console.log('====================================')
                console.log('AJAX onreadystatechange 方法')
                console.log('====================================')
            } else {
                console.log('====================================')
                console.log('error 方法')
                console.log('====================================')
            }
            this.config.ajaxLength = this.config.loadNumer = 0
            this.ajaxTime = new Date().getTime() - this.beginTime
            this.getAjaxAndOnLoadTime()
        }
    }

    /**
     * ajax响应汇报
     */
    ajaxResponse(xhr, type) {
        let defaultInfo = Object.assign({}, errordefo);
        defaultInfo.time = new Date().getTime();
        defaultInfo.resource = 'ajax'
        defaultInfo.msg = xhr.statusText || 'ajax请求错误';
        defaultInfo.method = xhr.method
        defaultInfo.data = {
            resourceUrl: xhr.responseURL,
            text: xhr.statusText,
            status: xhr.status
        }
        this.config.errorList.push(defaultInfo)
    }

}
