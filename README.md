# Net

a lightweight jQuery ajax manager

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/chajn/jquery-net/master/dist/net.min.js
[max]: https://raw.github.com/chajn/jquery-net/master/dist/net.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/net.min.js"></script>
<script>
jQuery(function($) {

    $.net.add('ajax1', '/test/ajax1','post', netOpt);
    $.net.get('ajax2', '/test/ajax2', netOpt);
    $.net.post('ajax4','/test/ajax4', netOpt);
    $.net.unaudit('ajax5','/test/ajax5');
    $.net.jsonp('ajax6','http://github.com/test/ajax7');

    $.net.connect('ajax1', {id:111}, function(data) {
    	console.log(data);
    },{
    	1:function(data){alert(data)},
    	normal:function(data){},
    	end:function(data){}
    });

    $.net.connect('ajax1', {id:111}, function(data) {
    	console.log(data);
    });
    $.net.connect('ajax2', function(data) {
    	console.log(data);
    });

    $.net.connect('ajax6');
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
