/*

FIWARE Orion Context Broker adapter to Backbone JS Sync
The MIT License (MIT)

Copyright (c) 2015 Digitalilusion S.L.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function(){

	if (typeof(Backbone) === "undefined")
	{
		console.error("Backbone is not loaded");
		return;
	}
	var oldSync = Backbone.sync;
	// Helpers functions
	var isInt = function  (n) {
		return n % 1 === 0;
	}
	var getType = function  (v) {
		var kind = typeof(v);
		switch (kind)
		{
			case 'number':
			{
				kind = isInt(v) ? "integer" : "float";
				break;
			}

		}
		return kind;
	};
	var buildAttrs = function (attrs) {
		var opts = [];
		
		
		for (var k in attrs)
		{
			if (k == "id") continue;
			var kv = {'name': k, 'type': getType(attrs[k]), 'value': attrs[k]};
			opts.push(kv);

		}
		return opts;
		
	};
	var parseAttrs = function  (attrs) {
		var d = {};
		for (var i=0; i < attrs.length; i++)	
		{
			var o = attrs[i];
			d[o['name']] = o['value'];
		}
		return d;
	};
	var parseReadEntry = function (entry)
	{
		if ( ! ('statusCode' in entry ))
		{
			return null;
		}
		if ( entry['statusCode']['code'] != "200")
		{
			return null;
		}
		if ( ! ('contextElement' in entry))
		{
			return null;
		}
		var obj = parseAttrs(entry['contextElement']['attributes']);
		var id = entry['contextElement']['id'];
		var match = id.match(/.+\.\d+/);
		if (match == null)
		{
			return null;
		}
		obj['id'] = id.split(".")[1];
		return obj;		

	};
	var parseRead = function  (d) {

		var parsedObjects = [];
		if ('contextResponses' in d)
		{
			for (var i=0; i < d['contextResponses'].length; i++)
			{
				var entry = d['contextResponses'][i];
				var obj = parseReadEntry(entry);
				if (obj == null)
				{
					continue;
				}
				parsedObjects.push(obj);
			}
			return parsedObjects;
		}
		var obj = parseReadEntry(d);
		return obj;
		
	};
	var checkID = function  (model) {
		if (!('id' in model))
		{
			throw "ID attribute is necessary for Orion";
		}
		if ( isNaN(model['id']) || ! isInt(model['id']) || model['id'] <= 0)
		{
			throw "ID attribute isn't a natural number";	
		}

	};
	var OrionSync = function (method, model, options)
	{

		var obj = model;
		var isCollection = false;
		if ('model' in obj)
		{
			obj = model.model.prototype;
			isCollection = true;
		}
		
		if (! ('type' in obj))
		{
			throw "TYPE is required as Model property";
		}
		var ajaxCommons = {

			accepts: {'json': 'application/json'},
			dataType: 'json',
			contentType: "application/json",
			traditional: true,
			beforeSend: function(request)
					{
						if ('token' in model)
						{
							request.setRequestHeader("X-Auth-Token", model.token);
						}
						// Workaround bug Orion accept handling
						request.setRequestHeader("Accept", "application/json"); 
					}
		};
		switch (method)
		{
			case "update":
			case "create":
			{
				checkID(model);
				var attrs = buildAttrs(model.attributes);
				var url = model.urlRoot + "/v1/updateContext";
				var payload = {
					"contextElements": [
						{
							"type": obj.type,
							"isPattern": "false",
							"id": obj.type + "." + model.id,
							"attributes": attrs
						}
					],
					"updateAction": "APPEND"
				};
				var opts = _.extend({
					url: url,
					type: 'POST',
					data: JSON.stringify(payload),
					success: function  (d) {
						// Orion Context broker doesn't return values for attributes
						// so that, we call 'success' with original attrs
						if ('success' in options) options.success(model.attributes);
					},
					error: function  (er) {
						if ('error' in options) options.error(er, model.attributes);
					}

				}, ajaxCommons);
				Backbone.$.ajax(opts);
				break;
			}
			case "read":
			{
				//alert("read");
				var url;
				if ( isCollection)
				{
					url = model.urlRoot + "/v1/queryContext";
				}
				else
				{
					url = model.urlRoot + "/v1/contextEntities/" + model.id;
				}
				var payload = {};
				if ( isCollection){
					payload = {
					"entities": [
							{
								"type": obj.type,
								"isPattern": true,
								"id": obj.type + ".*" 
							}

						]
					};
				}  
				var opts = _.extend({
					url: url,
					type: isCollection ? 'POST' : 'GET',
					data: isCollection ? JSON.stringify(payload) : null,
					success: function  (d) {
						var r = parseRead(d);
						if ('success' in options) options.success(r);
					},
					error: function  (er,b,c) {
						if ('error' in options) options.error(er);
					}

				}, ajaxCommons);
				Backbone.$.ajax(opts);

				break;
			}
			case "delete":
			{
				//alert("destroy");
				var url = model.urlRoot + "/v1/updateContext";
				var payload = {
					"contextElements": [
						{
							"type": obj.type,
							"isPattern": "false",
							"id": obj.type + "." + model.id,
						}

					],
					"updateAction": "DELETE"
				};
				var opts = _.extend({
					url: url,
					type: 'POST',
					data: JSON.stringify(payload),
					success: function  (d) {
						
						if ('success' in options) options.success(d);
					},
					error: function  (er) {
						
						if ('error' in options) options.error(er);
					}

				}, ajaxCommons);
				Backbone.$.ajax(opts);
				break;
			}
		}
	};

	Backbone.OrionModel = Backbone.Model.extend({
		/*
		initialize: function (attributes, options)
		{
			this.options = options || {};
		},
		*/
		sync: OrionSync
	});
	Backbone.OrionCollection = Backbone.Collection.extend({

		sync: OrionSync
	});

})();
