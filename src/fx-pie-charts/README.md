# fx-pie-charts

### The Crux of the Matter

fx-pie-charts is the JavaScript module for pie charts plotting. The module uses SVG or VML grammar where accessible to plot resolution independent pie chart images. In browsers with no SVG/VML support, fx-pie-charts uses HTML5 canvas element. The script may work both as a standalone module and as a jQuery plugin. It automatically detects whether jQuery is available and registers the `fxPieChart` method either in `$.fn` or in global namespace.

### Details & API

Using the module in jQuery environment:

```javascript
    $(selector).fxPieChart(params); // form (1)
    // or
    $(selector).fxPieChart(function (Element) {}); // form (2)
```

Using the module as a standalone script:

```javascript
    fxPieChart(params);
```

The allowed properties of the `params` object are:

* `data` — _[required if no `data-fx-chart` attribute is specified]_ an array of values to be used as the chart construction data. If the `data-fx-chart` attribute is defined for the target element then the attribute value may be used as the `data` property value. The format of the `data-fx-chart` attribute is a comma-separated list of values (e.g.
```html
    <div data-fx-chart="12.2,44.5,18,8"></div>
```
means that `params.data` will be `[12.2, 44.5, 18, 8]`);
* `container` — _[required in standalone mode]_ either a target DOM element the chart inserted into or a string (interpreted as `id` attribute of the target element). In case of jQuery environment the matched elements are used as containers if this property is not specified;
* `colors` — an array of CSS-formatted colors to be used to fill chart pies;
* `outline` — color of the chart's outline. If this parameter is not specified, then no outline is drawn;
* `width` — the desired width of the chart. Default to container's client width;
* `height` — the desired height of the chart. Default to container's client height;
* `handlers` — an object which maps DOM event types (object keys) into event handlers (object values). A handler is called for a pie the event is initialized by. The target pie's zero-based index is passed into the user-defined handler as an additional argument together with Event object.

When used as a jQuery plugin, the `fxPieChart` method may take a function as the argument (see form (2) in the example above). This function will be called for each element in the matched set. It receives the current element as the only argument (you may use `this` keyword instead) and should return the object to use as the `params` argument for the current element.

### Examples

* Usual chart initialization specifying data to plot and custom pie colors
```javascript
    $("#chart-wrapper").fxPieChart({
        data: [20.1, 30.5, 11.8, 40.3, 55, 8, 66, 11.5],
        colors: ["red", "blue", "yellow", "green", "#c0c0c0", "#f0f", "#ffa500", "navy"]
    });
```

* Register custom event handlers for chart pies
```javascript
    var colors = ["red", "green", "blue"];
    $("#chart-wrap").fxPieChart({
        data: [12, 20, 15],
        colors: colors,
        handlers: {
            click: function (event, pieIndex) {
                alert(colors[pieIndex] + " pie is clicked");
            }
        }
    });
```

* When used as a standalone script, fx-pie-charts requires the `container` parameter to be specified
```javascript
    window.onload = function () {
        fxPieChart({
            container: "container-id", // target container's id
            data: [10, 30, 5, 30, 25],
            colors: ["red", "blue", "yellow", "maroon", "silver"],
            handlers: {
                click: function (e, index) { console.log(index); }
            }
        });
    };
```

### Live demos

You may find more examples and some demos of use the fx-pie-charts module [here](http://amphiluke.github.io/pure-js/fx-pie-charts/).
