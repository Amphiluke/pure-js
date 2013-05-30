(function (global) {

"use strict";

var SLICA = global.SLICA,
	elements = SLICA.elements = {},
	$i = SLICA.utils.$i;


// `SLICA.core` accumulates core calculation routines for the SLICA application
// ============================================================================

SLICA.core = {

	/**
	 * Estimate droplet-surface cross points coordinates by solving simultaneous equations
	 * of the approximating ellipse curve and the line
	 * @returns {Object} Coordinates of two cross points (left and right)
	 */
	findCrossPoints: function () {
		var ellipse = elements.ellipse.coefs,
			line = elements.surface.coefs,
			// auxiliary variables
			sqrC = ellipse.c * ellipse.c,
			sqrD = ellipse.d * ellipse.d,
			// alpha, beta, gamma are the coefficients of a quadratic equation
			alpha = line.k * line.k * sqrC + sqrD,
			beta = 2 * ((line.b - ellipse.b) * line.k * sqrC - ellipse.a * sqrD),
			gamma = (line.b * line.b - 2 * ellipse.b * line.b + ellipse.b * ellipse.b - sqrD) * sqrC +
				ellipse.a * ellipse.a * sqrD,
			rootedDiscriminant = Math.sqrt(beta * beta - 4 * alpha * gamma),
			// Note that both alpha and rootedDiscriminant are nonnegative, so the solution with "-" corresponds to
			// the left cross point (lesser abscissa), and the solution with "+" corresponds to the right one
			crossPoints = {
				left: {x: 0.5 * (-beta - rootedDiscriminant) / alpha},
				right: {x: 0.5 * (-beta + rootedDiscriminant) / alpha}
			};
		crossPoints.left.y = line.k * crossPoints.left.x + line.b;
		crossPoints.right.y = line.k * crossPoints.right.x + line.b;
		return crossPoints;
	},

	/**
	 * Calculate a derivative of an ellipse curve (tangent angular coefficient) at the given cross point
	 * @param {Object} point Coordinates of a point where to derive
	 * @returns {Number} Derivative value
	 */
	calcDerivative: function (point) {
		var ellipse = elements.ellipse.coefs,
			// auxiliary variables
			sqrC = ellipse.c * ellipse.c,
			dist = point.x - ellipse.a,
			derivative = ellipse.d * dist / (sqrC * Math.sqrt(1 - dist * dist / sqrC));
		return (point.y < ellipse.b) ? derivative : -derivative;
	},

	adjustTangents: function () {
		var crossPoints = this.findCrossPoints(),
			type, derivative;
		for (type in crossPoints) {
			if (crossPoints.hasOwnProperty(type) && !isNaN(crossPoints[type].x) && !isNaN(crossPoints[type].y)) {
				derivative = this.calcDerivative(crossPoints[type]);
				elements.tangents[type].coefs = {
					k: derivative,
					b: crossPoints[type].y - derivative * crossPoints[type].x
				};
			}
		}
	},

	/**
	 * Calculate left and right contact angles for the current disposition of a surface line and tangent lines
	 * @returns {Object} Left and right contact angles (in radians)
	 */
	getContactAngles: function () {
		var surfSlope = elements.surface.coefs.k,
			surfAngle = Math.atan(surfSlope),
			leftTanSlope = elements.tangents.left.coefs.k,
			rightTanSlope = elements.tangents.right.coefs.k,
			// Subtracting two angles (surface slope and a tangent slope), we always get the intersection angle
			// from the *right* side of cross point
			contactAngles = {
				left: Math.abs(surfAngle - Math.atan(leftTanSlope)),
				right: Math.abs(surfAngle - Math.atan(rightTanSlope))
			};
		// As noted, the above calculated angles are both from the right side of a cross point,
		// so analyze the sign of a tangent slope to get the correct contact angle.
		// Also consider that the ordinate is top-down increasing in computer axes
		if (leftTanSlope > 0) {
			contactAngles.left = Math.PI - contactAngles.left;
		}
		if (rightTanSlope < 0) {
			contactAngles.right = Math.PI - contactAngles.right;
		}
		return contactAngles;
	}

};


// `SLICA.elements.frame` represents a frame the user moves and resizes to fit a working ellipse to a droplet
// ==========================================================================================================

elements.frame = {

	// Basic frame initialization
	// --------------------------

	init: function () {
		this.self = $i("slica-frame");
		this.owner = this.self.ownerSVGElement;
		this.strokeWidth = parseInt(window.getComputedStyle(this.self, null).strokeWidth);
		this.mousedown = this._mousedown.bind(this);
		this.mousemove = SLICA.utils.throttle(this._mousemove.bind(this), 50);
		this.mouseup = this._mouseup.bind(this);
		this.self.addEventListener("mousedown", this.mousedown, false);
		this.self.addEventListener("mousemove", SLICA.utils.throttle(this.updateCursor.bind(this), 50), false);
	},

	// Event handlers
	// --------------

	updateCursor: function (e) {
		if (!this.moveStartData) { // whether or not the frame is dragged (no need to update cursor when in drag)
			this.self.style.cursor = this._hitTest(e.clientX, e.clientY);
		}
	},

	// Mouse event handlers for a period of frame moving/resizing
	// ----------------------------------------------------------

	_mousedown: function (e) {
		var owner = this.owner;
		this.moveStartData = {
			x: owner.x.baseVal.value,
			y: owner.y.baseVal.value,
			width: owner.width.baseVal.value,
			height: owner.height.baseVal.value
		};
		this.moveStartData.dx = e.clientX - this.moveStartData.x;
		this.moveStartData.dy = e.clientY - this.moveStartData.y;
		// `this.moveResize` references to one of 9 specific functions from the "Frame move/resize routines" section below
		this.moveResize = this[this._hitTest(e.clientX, e.clientY)];
		document.addEventListener("mousemove", this.mousemove, false);
		document.addEventListener("mouseup", this.mouseup, false);
	},
	_mousemove: function (e) {
		if (this.moveStartData) { // play safe (throttled calls are possible, when `this.moveStartData` is already `null`)
			this.moveResize(this.owner, this.moveStartData, e.clientX, e.clientY);
		}
	},
	_mouseup: function () {
		document.removeEventListener("mousemove", this.mousemove, false);
		document.removeEventListener("mouseup", this.mouseup, false);
		this.moveStartData = null;
	},

	// Frame move/resize routines
	// --------------------------

	/**
	 * All the 9 routines of this section takes the same set of parameters
	 * @param {SVGSVGElement} owner Owner SVG element of the frame. It is precisely this element that moved/resized
	 * @param {Object} moveStartData Data storing initial frame position and size (see `this._mousedown`)
	 * @param {Number} clientX Current pointer x-coordinate
	 * @param {Number} clientY Current pointer y-coordinate
	 */
	move: function (owner, moveStartData, clientX, clientY) {
		owner.x.baseVal.value = clientX - moveStartData.dx;
		owner.y.baseVal.value = clientY - moveStartData.dy;
	},
	"n-resize": function (owner, moveStartData, clientX, clientY) {
		var newY = clientY - moveStartData.dy;
		owner.y.baseVal.value = newY;
		owner.height.baseVal.value = owner.viewBox.baseVal.height = moveStartData.height + moveStartData.y - newY;
	},
	"s-resize": function (owner, moveStartData, clientX, clientY) {
		owner.height.baseVal.value = owner.viewBox.baseVal.height =
			moveStartData.height - moveStartData.y + clientY - moveStartData.dy;
	},
	"w-resize": function (owner, moveStartData, clientX, clientY) {
		var newX = clientX - moveStartData.dx;
		owner.x.baseVal.value = newX;
		owner.width.baseVal.value = owner.viewBox.baseVal.width = moveStartData.width + moveStartData.x - newX;
	},
	"e-resize": function (owner, moveStartData, clientX, clientY) {
		owner.width.baseVal.value = owner.viewBox.baseVal.width =
			moveStartData.width - moveStartData.x + clientX - moveStartData.dx;
	},
	"nw-resize": function () {
		this["n-resize"].apply(this, arguments);
		this["w-resize"].apply(this, arguments);
	},
	"ne-resize": function () {
		this["n-resize"].apply(this, arguments);
		this["e-resize"].apply(this, arguments);
	},
	"sw-resize": function () {
		this["s-resize"].apply(this, arguments);
		this["w-resize"].apply(this, arguments);
	},
	"se-resize": function () {
		this["s-resize"].apply(this, arguments);
		this["e-resize"].apply(this, arguments);
	},

	// Auxiliary and service routines
	// ------------------------------

	/**
	 * Determine the type of region containing the point with the given coordinates
	 * @param {Number} x Point abscissa
	 * @param {Number} y Point ordinate
	 * @returns {String} The CSS `cursor`-formatted value corresponding the type of region the point belongs to
	 * (e.g. "e-resize" for the right sizing border; "sw-resize" for the top-left corner; "move" for the inner frame body)
	 */
	_hitTest: function (x, y) {
		var strokeWidth = this.strokeWidth,
			rect = this.self.getBoundingClientRect(),
			diffX = x - rect.left,
			diffY = y - rect.top,
			result = "";
		if (Math.abs(diffY) <= strokeWidth) {
			result += "n";
		} else if (Math.abs(diffY - rect.height) <= strokeWidth) {
			result += "s";
		}
		if (Math.abs(diffX) <= strokeWidth) {
			result += "w";
		} else if (Math.abs(diffX - rect.width) <= strokeWidth) {
			result += "e";
		}
		return (result) ? result + "-resize" : "move";
	}

};


// `SLICA.elements.ellipse` is a working shape, the ellipse approximating the droplet in a picture
//  ==============================================================================================

elements.ellipse = {

	self: $i("slica-ellipse"),

	get coefs() {
		var owner = elements.frame.owner;
		return {
			a: 0.5 * owner.width.baseVal.value + owner.x.baseVal.value,
			b: 0.5 * owner.height.baseVal.value + owner.y.baseVal.value,
			c: this.self.rx.baseVal.value,
			d: this.self.ry.baseVal.value
		};
	}

};


// `SLICA.elements.surface` represents a line the user moves towards a solid-liquid interface
// ==========================================================================================

elements.surface = {

	// Basic surface object initialization
	// -----------------------------------

	init: function () {
		this.self = $i("slica-surface");
		this.line = $i("slica-surface-line");
		this.mousedown = this._mousedown.bind(this);
		this.mousemove = SLICA.utils.throttle(this._mousemove.bind(this), 50);
		this.mouseup = this._mouseup.bind(this);
		this.self.addEventListener("mousedown", this.mousedown, false);
	},

	// Mouse event handlers for a period of surface line moving
	// --------------------------------------------------------

	_mousedown: function (e) {
		this.coord = e.target.getAttribute("data-coord");
		if (this.coord) {
			this.point = e.target;
			this.moveStartData = {
				dy: e.clientY - this.line[this.coord].baseVal.value
			};
			document.addEventListener("mousemove", this.mousemove, false);
			document.addEventListener("mouseup", this.mouseup, false);
		}
	},
	_mousemove: function (e) {
		if (this.moveStartData) { // play safe (throttled calls are possible, when `this.moveStartData` is already `null`)
			this.line[this.coord].baseVal.value = this.point.cy.baseVal.value = e.clientY - this.moveStartData.dy;
		}
	},
	_mouseup: function () {
		document.removeEventListener("mousemove", this.mousemove, false);
		document.removeEventListener("mouseup", this.mouseup, false);
		this.moveStartData = null;
	},

	get coefs() {
		var coefs = {};
		coefs.k = (this.line.y2.baseVal.value - this.line.y1.baseVal.value) /
			(this.line.x2.baseVal.value - this.line.x1.baseVal.value);
		coefs.b = this.line.y1.baseVal.value - coefs.k * this.line.x1.baseVal.value;
		return coefs;
	}

};


// `SLICA.elements.tangents` represents a pair of tangents at the points of ellipse-surface intersection
// =====================================================================================================

elements.tangents = {

	init: function () {
		["left", "right"].forEach(function (prop) {
			this[prop] = Object.create(Object.prototype, {
				self: {
					value: $i("slica-tangent-" + prop),
					writable: true,
					enumerable: true,
					configurable: true
				},
				coefs: {
					get: this._getCoefs,
					set: this._setCoefs,
					enumerable: true,
					configurable: true
				}
			});
		}, this);
	},

	/**
	 * A getter and a setter for a tangent equation coefficients. The object the getter expects (and the setter returns)
	 *  should have 2 numeric properties: k (a slope) and b (a constant term)
	 * @this {Object} Either SLICA.elements.tangents.left or SLICA.elements.tangents.right
	 */
	_getCoefs: function () {
		var tangent = this.self,
			coefs = {};
		coefs.k = (tangent.y2.baseVal.value - tangent.y1.baseVal.value) /
			(tangent.x2.baseVal.value - tangent.x1.baseVal.value);
		coefs.b = tangent.y1.baseVal.value - coefs.k * tangent.x1.baseVal.value;
		return coefs;
	},
	_setCoefs: function (coefs) {
		var invK = 1 / coefs.k;
		if (isFinite(invK)) {
			this.self.x1.baseVal.value = (this.self.y1.baseVal.value - coefs.b) * invK;
			this.self.x2.baseVal.value = (this.self.y2.baseVal.value - coefs.b) * invK;
		}
	}

};


elements.frame.init();
elements.surface.init();
elements.tangents.init();

})(this);