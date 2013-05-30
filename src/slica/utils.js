(function (global) {

"use strict";

var SLICA = global.SLICA;

if (!SLICA) {
	SLICA = global.SLICA = {};
}

SLICA.utils = {

	$: document.querySelector.bind(document),
	$$: document.querySelectorAll.bind(document),
	$i: document.getElementById.bind(document),

	/**
	 * Create an array of elements from an existing passed node list or from one obtained by a passed selector
	 * @param {String|NodeList} elements Either a selector or a node list to construct an array from
	 * @returns {Array} The resulting array of elements
	 */
	getElementArray: function (elements) {
		if (typeof elements === "string") {
			elements = this.$$(elements);
		}
		return Array.prototype.slice.call(elements, 0);
	},

	// copied with slight modifications from http://underscorejs.org/underscore.js
	throttle: function (func, wait) {
		var context, args, timeout, result,
			previous = 0,
			later = function () {
				previous = new Date();
				timeout = null;
				result = func.apply(context, args);
			};
		return function () {
			var now = new Date(),
				remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
			} else if (!timeout) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	}

};

})(this);