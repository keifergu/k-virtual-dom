var Element = function (tagName, props, children) {
	this.tagName = tagName;
	this.props = props;
	this.children = children || [];

	var count = 0

	this.children.forEach(function (child, i) {
	  if (child instanceof Element) {
	    count += child.count;
	  } else {
	    children[i] = '' + child;
	  }
	  count++;
	});

	this.count = count;
};


Element.prototype.render = function () {
	var el = document.createElement(this.tagName);
	var props = this.props;

	for(var propName in props) {
		var propValue = props[propName];
		el.setAttribute(propName, propValue);
	}

	var children = this.children || [];

	children.forEach(function(child){
		var childEl = (child instanceof Element)
			? child.render()
			: document.createTextNode(child);
		el.appendChild(childEl);
 	});
 	return el;
};

module.exports = function(tagName, props, children) {
	return new Element(tagName, props, children);
};