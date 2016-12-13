/*
 * net
 * https://github.com/iischajn/jquery-net
 *
 * Copyright (c) 2014 iischajn
 * Licensed under the MIT license.
 */
(function($) {

    var trans = {};

    var tranModel = {
        url: null,
        method: 'get', //post
        audit: true,
        lock: true,
        hook: false,
        jsonp: false,
        plain: false,
        sending: false,
        formdata: false,
        token: true,
        delay: false
    };

    function connect(name, param, cb, hookObj) {
        var tran = trans[name];
        var curDate = $.now();
        if(!tran){
            tran = add(name);
        }
        if (tran.lock && tran.sending) {
            return false;
        }
        if (tran.delay) {
            if (tran._lastDate && (curDate - tran._lastDate <= tran.delay)) {
                return false;
            } else {
                tran._lastDate = curDate;
            }
        }
        tran.sending = true;
        if ($.isFunction(param)) {
            hookObj = cb;
            cb = param;
            param = {};
        }
        request(tran, param, cb, hookObj);
    }

    function execute(func, data, tran) {
        if ($.isFunction(func)) {
            func(data, tran);
            return true;
        }
        return false;
    }

    function request(tran, param, cb, hookObj) {
        var opt = $.net.options;
        var url = tran.url;
        if (!url) {
            return false;
        }
        if (!tran.jsonp && opt.token) {
            $.extend(param, opt.token);
        }
        if(opt.host && url.indexOf('http') == -1){
            url = opt.host + url;
        }
        
        hookObj = $.extend({}, opt.hook, hookObj);
                                
        var config = {
            url: url,
            type: tran.method,
            data: param,
            cache: false,
            dataType: tran.jsonp ? "jsonp" : "json",
            jsonp: 'callback',
            jsonpCallback: 'cb' + $.now(),
            success: function(data) {
                if (tran.audit) {
                    data[opt.codeName] = data[opt.codeName] || 0;
                    var code = data[opt.codeName];
                    if (code === opt.okCode) {
                        if (cb) {
                            cb(data);
                        }
                    } else if (tran.hook) {
                        if (!execute(hookObj[code], data, tran)) {
                            execute(hookObj.normal, data, tran);
                        }
                    }
                    execute(hookObj.end, data, tran);
                } else {
                    if (cb) {
                        cb(data);
                    }
                }
                $($.net).trigger(tran.id, [data]);
            },
            complete: function() {
                tran.sending = false;
            },
            error: function() {
                execute(hookObj.error);
                execute(hookObj.end);
            }
        };
        if (tran.plain) {
            config.dataType = "";
        }
        if (param instanceof FormData) {
            config.contentType = false;
            config.processData = false;
        }
        $.ajax(config);
    }

    function status(name) {
        var tran = trans[name];
        if (tran && tran.sending) {
            return true;
        }
        return false;
    }

    function delay(id, url, method, opt) {
        opt = $.extend({
            'delay': $.net.options.delay,
            'lock': false
        }, opt);
        return add(id, url, method, opt);
    }

    function unlock(id, url, method, opt) {
        opt = $.extend({
            'lock': false
        }, opt);
        return add(id, url, method, opt);
    }

    function plain(id, url, method, opt) {
        opt = $.extend({
            'audit': false,
            'plain': true
        }, opt);
        return add(id, url, method, opt);
    }

    function jsonp(id, url, method, opt) {
        opt = $.extend({
            'audit': false,
            'jsonp': true
        }, opt);
        return add(id, url, method, opt);
    }

    function unaudit(id, url, method, opt) {
        opt = $.extend({
            'audit': false
        }, opt);
        return add(id, url, method, opt);
    }

    function get(id, url, opt) {
        return add(id, url, 'get', opt);
    }

    function post(id, url, opt) {
        return add(id, url, 'post', opt);
    }

    function add(id, url, method, opt) {
        var tran = {};

        if(id === undefined){
            throw "Invalid arguments";
        }
        if (arguments[1] === undefined) {
            url = arguments[0];
        }
        if (typeof arguments[1] === 'object') {
            tran = arguments[1];
        } else {
            tran.url = url;
            tran.method = method || 'get';
        }
        tran.id = id;
        if (trans[id]) {
            throw "There are a same tran";
        }
        tran = $.extend({}, tranModel, tran, opt);
        trans[id] = tran;
        return trans[id];
    }

    $.fn.net = function() {
        return this.each(function() {
            var el = $(this);
            var tran = el.data();
            if (tran.netId) {
                tran.el = el;
                add(tran.netId, tran);
            }
        });
    };
    $.fn.connect = function(param) {
        return this.each(function() {
            var el = $(this);
            var data = el.data();
            if (data.netId) {
                connect(data.netId, param);
            }
        });
    };
    
    $.fn.getFormData = function() {
        var obj = {};
        var params = this.serializeArray();
        $.each(params, function(i, field){
            obj[field.name] = field.value;
        });
        return obj;
    };

    $.fn.setFormData = function(item) {
        var elList = $(this).find('[name]');
        $.each(elList, function(i, el){
            el = $(el);
            var name = el.attr('name');
            if(typeof item == 'string'){
                el.val(item);
            }else if(item[name]){
                el.val(item[name]);
            }
        });
    };
    


    function getUrlParam(paramName) {
        if(paramName){
            var reg = new RegExp("(^|&)"+ paramName +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r!=null) return unescape(r[2]); return null;

        }
        
        var url = location.search; 
        var thisParam = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                thisParam[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
            }
        }
        return thisParam;
    }

    $.net = {
        add: add,
        get: get,
        post: post,
        plain: plain,
        jsonp: jsonp,
        delay: delay,
        unlock: unlock,
        unaudit: unaudit,
        connect: connect,
        request: request,
        status: status,
        getUrlParam:getUrlParam
    };
    $.net.options = {
        okCode: '0',
        delay: 10000,
        token: false,
        codeName: 'code',
        hook: {
            normal: function(res) {},
            end: function(res){
                console.log(res);
            },
            error: function(res) {}
        }
    };
}(jQuery));
