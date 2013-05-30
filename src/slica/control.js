(function (global) {

"use strict";

var RAD2DEG = 180 / Math.PI;

var SLICA = global.SLICA,
	control = SLICA.control = {},
	$ = SLICA.utils.$,
	$$ = SLICA.utils.$$,
	$i = SLICA.utils.$i,
	getElementArray = SLICA.utils.getElementArray.bind(SLICA.utils);


// Entire form processing
// ----------------------

control.form = {

	init: function () {
		this.self = $i("ctrl-pnl");
		this.self.addEventListener("submit", this._submit.bind(this), false);
	},

	_submit: function (e) {
		var angles;
		SLICA.core.adjustTangents();
		angles = SLICA.core.getContactAngles();
		$i("left-angle").value = (angles.left * RAD2DEG).toFixed(2) + "°";
		$i("right-angle").value = (angles.right * RAD2DEG).toFixed(2) + "°";
		control.tabs.activate($i("report-tab"));
		e.preventDefault();
	}

};


// Tabs processing
// ===============

control.tabs = {

	init: function () {
		this.self = getElementArray(".ctrl-pnl-tabs a");
		$(".ctrl-pnl-tabs").addEventListener("click", this.tabClick.bind(this), false);
	},

	// Event handlers
	// --------------

	tabClick: function (e) {
		if (this.self.indexOf(e.target) > -1) {
			this.activate(e.target);
			e.preventDefault();
		}
	},

	// General public routines
	// -----------------------

	activate: function (which) {
		this.self.forEach(function (tab) {
			if (tab === which) {
				tab.classList.add("active");
				$(tab.getAttribute("href")).classList.add("active");
			} else {
				tab.classList.remove("active");
				$(tab.getAttribute("href")).classList.remove("active");
			}
		});
	}

};


// Photo loading and processing
// ============================

control.picture = {

	init: function () {
		var url = window.URL || window.webkitURL || window,
			picture = $i("picture"),
			dummyImg = new Image();
		dummyImg.onload = function () {
			control.picture.update(this);
		};
		if (url.createObjectURL) {
			picture.addEventListener("change", function () {
				dummyImg.src = url.createObjectURL(this.files[0]);
			}, false);
		} else {
			$("#control .ctrl-pnl-field-list").classList.add("fallback");
			picture = $i("picture-fallback");
			picture.addEventListener("change", function () {
				dummyImg.src = this.value;
			}, false);
		}
	},

	/**
	 * Update SVG workspace size and background image
	 * @param {HTMLImageElement} img A new image substituting the old one
	 */
	update: function (img) {
		var photo = $i("photo"),
			workspace = $i("slica-workspace");
		workspace.width.baseVal.value = workspace.viewBox.baseVal.width = img.width + 50;
		workspace.height.baseVal.value = workspace.viewBox.baseVal.height = img.height + 50;
		photo.setAttribute("width", img.width + "px");
		photo.setAttribute("height", img.height + "px");
		photo.setAttributeNS("http://www.w3.org/1999/xlink", "href", img.src);
	}

};


// Color fields processing
// =======================

control.colors = {

	init: function () {
		this.self = getElementArray("#ctrl-pnl-colors input[type='text']");
		$i("ctrl-pnl-colors").addEventListener("change", this._change.bind(this), false);
		this.self.forEach(this.update, this);
	},

	// Event handlers
	// --------------

	_change: function (e) {
		var target = e.target;
		if (this.self.indexOf(target) > -1) {
			target.value = target.value.toUpperCase();
			this.update(target);
		}
	},

	// General public routines
	// -----------------------

	/**
	 * Apply a new color after changing the value in one of color input elements
	 * @param {HTMLInputElement} target A text field where a color is updated
	 */
	update: function _ctrlClrUpd(target) {
		var element;
		if (target.checkValidity()) {
			// this will change background of a preview pseudo-element on the right (see main.css for details)
			target.parentNode.style.backgroundColor = target.value || target.defaultValue;
			element = target.dataset.target;
			if (element) {
				if (!_ctrlClrUpd[element]) {
					_ctrlClrUpd[element] = getElementArray(element); // memoize element references
				}
				_ctrlClrUpd[element].forEach(function (el) {
					el.style.stroke = target.value;
				});
			}
		}
	}

};


control.form.init();
control.tabs.init();
control.picture.init();
control.colors.init();

})(this);