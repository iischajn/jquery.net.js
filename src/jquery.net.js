/*
 * net
 * https://github.com/chajn/jquery-net
 *
 * Copyright (c) 2014 chajn
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.net = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.net = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.net.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.net.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].net = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
