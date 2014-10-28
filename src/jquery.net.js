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
        delay: false
    };

    function connect(name, param, cb, hookObj) {
        var tran = trans[name];
        var curDate = $.now();
        if (!tran || (tran.lock && tran.sending)) {
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

    function execute(func, data) {
        if ($.isFunction(func)) {
            func(data);
            return true;
        }
        return false;
    }

    function request(tran, param, cb, hookObj) {
        if (!tran.url) {
            return false;
        }
        var config = {
            url: tran.url,
            type: tran.method,
            data: param,
            cache: false,
            dataType: tran.jsonp ? "jsonp" : "json",
            jsonp: 'cb',
            jsonpCallback: 'cb' + $.now(),
            success: function(data) {
                if (tran.audit) {
                    var opt = $.net.options;
                    data[opt.codeName] = data[opt.codeName] || 0;
                    var code = data[opt.codeName];
                    hookObj = $.extend({}, opt.hook, hookObj);
                    if (code === opt.okCode) {
                        if (cb) {
                            cb(data);
                        }
                    } else if (tran.hook) {
                        if (!execute(hookObj[code], data)) {
                            execute(hookObj.normal, data);
                        }
                    }
                    execute(hookObj.end, data);
                } else {
                    if (cb) {
                        cb(data);
                    }
                }
                $($.net).trigger(tran.id, [data]);
            },
            complete: function() {
                tran.sending = false;
            }
        };
        if (tran.plain) {
            config.dataType = "";
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
            'delay': $.net.options.delay
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
        if (id === undefined || arguments[1] === undefined) {
            throw "Invalid arguments";
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
        status: status
    };
    $.net.options = {
        okCode: 0,
        delay: 10000,
        codeName: 'errno',
        hook: {
            normal: function() {},
            end: false
        }
    };
}(jQuery));