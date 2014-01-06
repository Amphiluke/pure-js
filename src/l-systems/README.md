# ls — L-system manager

### About the project

The project **ls** is the L-system manager written in pure JavaScript. It allows of designing, plotting, grouping, and persistent client-side storing the deterministic Lindenmayer fractal systems.

The project **ls** realization is based on new facilities introduced into JavaScript within the standards of ECMAScript 5, HTML5 and DOM Level 3. This implies that the correctness of the program work requires the use of the modern browsers which have already implemented (or almost implemented) these standards in their engines. Here is a list of some features the **ls** manager expects from a browser to support:

* canvas and the conventional API to interact with it via JavaScript;
* ES5 API for creating and processing objects (e.g. static methods of the `Object` constructor, property descriptors etc.);
* ES5 methods for array processing (`.forEach()`, `.map()`, `.reduce()`, `.indexOf()` etc.) and function binding (`.bind()`);
* the global `JSON` object;
* new DOM traversing methods (`.querySelector[All]()`);
* `localStorage`;
* `DOMTokenList` ( **ls** provides an emulation for IE 9 though);
* File API (optional).

The project core, the ls.js script, implements both the codeword building from an axiom and production rules, and the visual rendering of the L-system on the canvas. The user interface realization of the **ls** manager consists of several parts: ls.html, the basic HTML file with static markup; ls-interface.css, the file improving the UI appearance; and ls-interface.js, the script implementing the most important parts of the UI logic. All the scripts within the project meet the requirements of ES5 strict mode.

In **ls**, the user may apply any Latin letters in the production rules to construct an L-system. The letters F and B are reserved since they have predefined meaning: move forward with and without drawing a line respectively. One may not remove the predefined letters; however the corresponding production rules are allowed to be empty. All the other letters could be either added (using the "+" button) or replaced/removed (using the special menu which pops up when click a letter button).

One may group L-systems into custom collections and then store them in the persistent local storage. Create a new collection by pressing the "Create collection…" button. To add an L-system into a custom collection, just fill in the fields of L-system's parameters, and then press the "Add to collection…" button. For demonstration purposes, the **ls** project includes the "bundled" collection. Choose an L-system from a collection either by double clicking its name in the L-system list, or by pressing the Enter key on the selected option (hold the Ctrl key to render the selected L-system on the canvas immediately).

### Live demo

[Here](http://amphiluke.github.io/pure-js/l-systems/ls.html), you may find a live demo.
