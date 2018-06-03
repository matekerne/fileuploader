(function(root, factory) {

	var pluginName = 'FileUploader';

	if (typeof define === 'function' && define.amd) {
		define([], factory(pluginName));
	} else if (typeof exports === 'object') {
		module.exports = factory(pluginName);
	} else {
		root[pluginName] = factory(pluginName);
	}
}( this, function(pluginName) {

	'use strict';

	var defaults = {
		selector: '.fileuploader',
		name: 'file',
		multiple: null,
		maxSize: null,
		maxFiles: null
	};
	/**
	 * Merge defaults with user options
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 */
	var extend = function(target, options) {
		var prop, extended = {};
		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}
		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}
		return extended;
	};

	/**
	 * Helper Functions
	 @private
	 */
	var privateFunction = function() {
		// Helper function, not directly acessible by instance object
	};

	var readFile = function(input, filelist, callback) {
		if (input.files && input.files[0]) {
			for (let i = 0; i <  input.files.length; i++) {
				var reader = new FileReader();
				let name = input.files[i].name;
				reader.addEventListener("load", function(e) {
					callback(filelist, e.target.result, name);
				});
				reader.readAsDataURL(input.files[i]);
			}
		}
	}

	/**
	 * Plugin Object
	 * @param {Object} options User options
	 * @constructor
	 */
	function Plugin(options) {
		this.options = extend(defaults, options);
		this.inputFields = {};

		if (this.options.maxSize) {
			this.maxFileSize = this.options.maxSize * 1024 * 1024;
		}

		this.init(); // Initialization Code Here
	}

	/**
	 * Plugin prototype
	 * @public
	 * @constructor
	 */
	Plugin.prototype = {
		init: function() {
			window.addEventListener("dragover",function(e){
				e = e || event;
				e.preventDefault();
			},false);
			  window.addEventListener("drop",function(e){
				e = e || event;
				e.preventDefault();
			},false);
			// find all matching DOM elements.
			// makes `.selectors` object available to instance.
			this.selectors = document.querySelectorAll(this.options.selector);
			for (var i = 0; i < this.selectors.length; i++) {
				var selector = this.selectors[i];
				this.inputFields[i] = {};
				this.initInput(selector, this.inputFields[i]);
			}
		},
		destroy: function() {
			// Remove any event listeners and undo any "init" actions here...
		},
		initInput: function(field, fieldInput) {
			fieldInput.files = new DataTransfer();
			var files = fieldInput.files;
			var list = field.querySelector('.fileuploader__list');
			var input = document.createElement('input');
			input.classList.add('fileuploader__input');
			input.type = 'file';

			if (this.options.maxFiles === null || this.options.maxFiles > 1) {
				input.setAttribute("multiple", "multiple");
				input.name = this.options.name + '[]';
			} else {
				input.name = this.options.name;
			}

			if (this.options.acceptedFiles !== null) {
				input.setAttribute("accept", this.options.acceptedFiles);
			}

			input.onchange = (e) => {
				e.preventDefault();

				for (let file of input.files)
					if (file !== input.files[0]) 
					files.items.add(file)

				readFile(input, list, this.addFile);
			}

			input.oninput = (e) => {
				e.preventDefault();
				this.onInput(e, input, files);
			};

			var button = document.createElement('button');
			button.classList.add('fileuploader__button');
			button.innerHTML = this.options.multiple === true ? 'Загрузить файлы' : 'Загрузить файл';

			button.onclick = function() {
				input.click();
			}

			field.insertBefore(input, field.firstChild);
			field.appendChild(button);

			this.initDragDrop(field, input, list);
		},
		onInput: function(e, input, files) {
			e.preventDefault();
			
			if (this.maxFileSize) {
				
				for (let i = 0; i < input.files.length; i++) {
					if (input.files.item(i).size > this.maxFileSize) continue;
					else files.items.add(input.files.item(i));
				}
				input.files = files.files;

			} else {
				input.files = e.dataTransfer.files;
			}
		},
		addFile: function(list, img, name) {
			var fileItem = document.createElement('li');
			fileItem.classList.add('fileuploader__list-item');
			fileItem.setAttribute('name', name);
			var imgThumb = '<div class="fileuploader__thumb" style="background-image: url(' + img + ');"><div class="fileuploader__thumb-remove"></div></div>';
			fileItem.innerHTML = imgThumb;
			list.appendChild(fileItem);

			var removeButton = fileItem.querySelector('.fileuploader__thumb-remove');
			removeButton.onclick = function(e) {
				var fileItem = e.target.parentNode.parentNode;
				var id = fileItem.getAttribute('name');
				console.log(id);
				
			}
		},
		initDragDrop: function(field, input, list) {
			field.ondragend = function(e) {
				e.stopPropagation();
				e.preventDefault();
			}
			field.ondragover = function(e) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}
			field.ondrop = function(e) {
				if (typeof this.maxFileSize !== 'undefined') {
					var dataTransfer = new DataTransfer();
					for (var i = 0; i <  e.dataTransfer.files.length; i++) {
						if (e.dataTransfer.files.item(i).size > this.maxFileSize) continue;
						else dataTransfer.items.add(e.dataTransfer.files.item(i));
					}
					input.files = dataTransfer.files;
				} else {
					input.files = e.dataTransfer.files;
				}
			}
		}
	};
	return Plugin;
} ) );