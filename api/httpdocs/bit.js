var ajax = new (function () {
	var self = this,
		defaultURL = document.location.href.toString(),
		addRandom = '',
		argTypes = {
			STATUS: 1,
			ERROR: 2,
			TEXT: 3,
			JSON: 4
		};
	var args = [argTypes.ERROR, argTypes.JSON];
	function iton(i) {
		for (var k in argTypes) if (argTypes[k] === i) return k;
		return null;
	}
	Object.defineProperty(this, 'defaultURL', {
		get: function () { return defaultURL; },
		set: function (v) { defaultURL = v.toString(); }
	});
	Object.defineProperty(this, 'addRandom', {
		get: function () { return addRandom.length > 0; },
		set: function (v) { addRandom = typeof (v) === 'string' ? v : (v ? 'rnd' : '') }
	});
	for (var k in argTypes) {
		(function (k) {
			Object.defineProperty(self, 'TYPE_' + k, { get: function () { return argTypes[k]; } });
		})(k);
	}
	Object.defineProperty(this, 'callbackArgs', {
		get: function () {
			var ret = '';
			for (var i = 0; i < args.length; i++) ret += iton(i);
			return ret;
		},
		set: function (v) {
			if (typeof (v) === 'number') args = iton(v) !== null ? [v] : [argTypes.TEXT];
			else {
				for (var i = v.length - 1; i >= 0; i--) if (iton(v[i]) === null) v.splice(i, 1);
				args = v;
			}
		}
	});

	this.get = function (url, getdata, cb) {
		var u = defaultURL, p = null, c = null;
		if (typeof (cb) === 'function') {
			if (url) u = url;
			if (getdata) p = getdata;
			c = cb;
		} else if (typeof (getdata) === 'function') {
			if (typeof (url) === 'string') u = url;
			else p = url;
			c = getdata;
		} else if (typeof (url) === 'function') {
			c = url;
		}
		if (typeof (p) === 'object') {
			var tmp = '';
			for (var k in p) tmp += (tmp.length > 0 ? '&' : '') + k + '=' + encodeURIComponent(p[k]);
			p = tmp;
		}
		if (p !== null) u += (u.indexOf('?') >= 0 ? '&' : '?') + p;
		if (addRandom.length > 0) u += (u.indexOf('?') >= 0 ? '&' : '?') + addRandom + '=' + (Math.random() * 900000 + 100000 | 0);
		var obj = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

		obj.onreadystatechange = onReadyState(obj, c);

		obj.open('GET', u, true);
		obj.send();
	};

	this.post = function (url, postdata, cb) {
		var u = defaultURL, p = null, c = null;
		if (typeof (cb) === 'function') {
			if (url) u = url;
			if (postdata) p = postdata;
			c = cb;
		} else if (typeof (postdata) === 'function') {
			if (typeof (url) === 'string') u = url;
			else p = url;
			c = postdata;
		} else if (typeof (url) === 'function') {
			c = url;
		}
		if (typeof (p) === 'object') {
			var tmp = '';
			for (var k in p) tmp += (tmp.length > 0 ? '&' : '') + k + '=' + encodeURIComponent(p[k]);
			p = tmp;
		}

		var obj = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

		obj.onreadystatechange = onReadyState(obj, c);

		obj.open('POST', u, true);
		obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		obj.send(p);
	};

	function onReadyState(obj, c) {
		if (c === null) return function () { };
		return function () {
			if (obj.readyState == 4) {
				if (c !== null) {
					var stra = args.toString();
					if (stra === '2,3') {
						c(obj.status !== 200, obj.responseText);
						return;
					} else if (stra === '3') {
						c(obj.responseText);
						return;
					}
					var al = ['', obj.status, obj.status !== 200, obj.responseText];
					var fnargs = [];
					for (var i = 0; i < args.length; i++) {
						if (args[i] === 4) {
							try {
								al.push(JSON.parse(al[3]));
							} catch (e) {
								al[2] = e;
								al.push(null);
							}
							break;
						}
					}
					if (stra === '2,4') {
						c(al[2], al[4]);
						return;
					} else if (stra === '4') {
						c(al[4]);
						return;
					}
					for (var i = 0; i < args.length; i++) {
						fnargs.push(al[args[i]]);
					}
					c.apply(window, fnargs);
					//c (obj.responseText);
				}
			}
		};
	}
})();




function elem(opts, callback) {
	/*
		tag: 'div',
		css: {
		},
		events: {
		},
		children: [
			elem ({..})
		],
		appendTo: document.body,
		done: function (self) {...}
	*/
	var el = document.createElement(opts.tag || 'div');
	var cb = null;
	if (opts.innerText) el.innerText = opts.innerText;
	if (opts.innerHTML) el.innerHTML = opts.innerHTML;
	var apto = null;
	for (opt in opts) {
		var val = opts[opt];
		switch (opt) {
			case 'style':
			case 'css':
				for (var k in val) {
					el.style[k] = val[k];
				}
				break;
			case 'events':
				for (var k in val) {
					el.addEventListener(k, val[k], false);
				}
				break;
			case 'children':
				for (var i = 0; i < val.length; i++) {
					el.appendChild(val[i]);
				}
				break;
			case 'appendTo':
				apto = val;
				break;
			case 'done':
				cb = val;
				break;
			case 'innerText':
			case 'innerHTML':
				break;
			default:
				if (val !== null) el[opt] = val;
		}
	}
	if (apto !== null) apto.appendChild(el);
	if (callback) callback(el);
	if (cb) cb(el);
	return el;
}


elem.findParentByTag = function (el, tag) {
	var ret = null;
	tag = tag.toLowerCase();
	while (el !== document.body && el.parentNode) {
		if (el.tagName && el.tagName.toLowerCase() === tag) {
			return el;
		}
		el = el.parentNode;
	}
	return null;
};