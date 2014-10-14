(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#net', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.net(), this.elems, 'should be chainable');
  });

  test('is awesome', function() {
    expect(1);
    strictEqual(this.elems.net().text(), 'awesome0awesome1awesome2', 'should be awesome');
  });

  module('jQuery.net');

  test('is awesome', function() {
    expect(2);
    strictEqual($.net(), 'awesome.', 'should be awesome');
    strictEqual($.net({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

  module(':net selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is awesome', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':net').get(), this.elems.last().get(), 'knows awesome when it sees it');
  });

}(jQuery));


var testNet = $.net('/test/test');
var obj = {num:1};
var cb = function(data){
  console.log(data.msg);
}
testNet.connect(obj, cb);


// unaudit unlock plain hiderr
$.extend($.namespace('Baike.Net'), (function() {
    var obj = {};
    var trans = {};
    var errorHandlerObj = {
        'default': function(data) {
            data && data.msg && Baike.Dialog.warning(data.msg);
        }
    };

    function add(name, tranOpt) {
        tranOpt.name = name;
        trans[name] = tranOpt;
    }

    function connect(name, param, cb, errFunc) {
        var tran = trans[name];
        var curDate = new Date();
        // cb = $.isFunction(arguments[2]) ? cb : errFunc[0];
        if (!tran || (tran.sending && !tran.unlock)) {
            return false;
        }
        if (tran.delay) {
            if(tran._lastDate && (curDate - tran._lastDate <= tran.delay)) {
                return false;
            } else {
                tran._lastDate = curDate;
            }
        }
        tran.sending = true;
        param = param || {};
        request(tran, param, cb, errFunc);
    }

    function execute(func, data) {
        if ($.isFunction(func)) {
            func(data);
            return true;
        }
        return false;
    }

    function callbackHandler(handlerObj, data, hiderr) {
        !hiderr && data.errno != 0 && !execute(handlerObj[data.errno], data) && execute(handlerObj['default'], data);
        execute(handlerObj['finally'], data);
    }

    function request(tran, param, cb, errObj) {
        var config = {
            url: tran.url,
            type: tran.method,
            data: param,
            cache: false,
            dataType: tran.jsonp ? "jsonp" : "json",
            jsonp:'cb',
            jsonpCallback: "bk" + $.now(),
            success: function(data) {
                if(tran.unaudit){
                    cb && cb(data);
                    $(Baike.Net).trigger(tran.name,[data]);
                    return true;
                }
                data.errno = data.errno || 0;
                data.errno == 0 && cb && cb(data);
                errObj = $.extend({}, errorHandlerObj, errObj || {});
                callbackHandler(errObj, data, tran.hiderr);
                $(Baike.Net).trigger(tran.name,[data]);
            },
            complete: function(xhr, ts) {
                tran.sending = false;
            }
        }
        if(tran.plain){
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

    function getParamObj(params) {
        var i,
            params = params.split('&'),
            length = params.length,
            paramObj = {},
            item;
        if (params[0]) {
            for (i = 0; i < length; i++) {
                item = params[i].split('=');
                item[0] = decodeURIComponent(item[0]);
                item[1] = item[1] ? decodeURIComponent(item[1]) : true;
                paramObj[item[0]] = item[1];
            }
        }
        return paramObj;
    }

    function getUrlObj() {
        var location = window.location || {
            search: "",
            protocol: "file:"
        };
        var urlParams = getParamObj(location.search.slice(1));
        return urlParams;
    }

    obj.connect = connect;
    obj.status = status;
    obj.add = add;
    obj.getParamObj = getParamObj;
    obj.getUrlObj = getUrlObj;
    return obj;
})());


