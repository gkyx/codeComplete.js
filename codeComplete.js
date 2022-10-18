(function ( $ ) {
	function GetSearchOptionsForCurrentSearchString(structuredSearchString, dataStructure) {
	  var searchStringParts = structuredSearchString.split('.');

	  var parentOfSearchString = dataStructure;
	  for (let index = 0; index < searchStringParts.length - 1; index++) {
		parentOfSearchString = parentOfSearchString[searchStringParts[index]];
		if(parentOfSearchString === undefined) return [];
	  }
	  return Array.isArray(parentOfSearchString) ? parentOfSearchString : Object.keys(parentOfSearchString);
	}
	
	function ExtractActualSearchString(composedString) {
		var parts = composedString.split('.');
		var searchString = parts[parts.length - 1];
		return searchString;
	}

	function ExtractStructuredSearchString(inputElement){
		var inputValue = inputElement.value.replaceAll('\n', ' ').replaceAll('\t', ' ');
		var stringBeforeCursor = inputValue.substr(0, inputElement.selectionStart);
		var stringsBeforeCursor = stringBeforeCursor.split(' ');
		var structuredSearchString = stringsBeforeCursor[stringsBeforeCursor.length - 1];

		return structuredSearchString;
	}

	// From https://gist.github.com/jh3y/6c066cea00216e3ac860d905733e65c7
	const getCursorXY = (input, selectionPoint) => {
		const {
			offsetLeft: inputX,
			offsetTop: inputY,
		} = input
		// create a dummy element that will be a clone of our input
		const div = document.createElement('div')
		// get the computed style of the input and clone it onto the dummy element
		const copyStyle = getComputedStyle(input)
		for (const prop of copyStyle) {
			div.style[prop] = copyStyle[prop]
		}
		// we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
		const swap = '.'
		const inputValue = input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value
		// set the div content to that of the textarea up until selection
		const textContent = inputValue.substr(0, selectionPoint)
		// set the text content of the dummy element div
		div.textContent = textContent
		if (input.tagName === 'TEXTAREA') div.style.height = 'auto'
		// if a single line input then the div needs to be single line and not break out like a text area
		if (input.tagName === 'INPUT') div.style.width = 'auto'
		// create a marker element to obtain caret position
		const span = document.createElement('span')
		// give the span the textContent of remaining content so that the recreated dummy element is as close as possible
		span.textContent = inputValue.substr(selectionPoint) || '.'
		// append the span marker to the div
		div.appendChild(span)
		// append the dummy element to the body
		document.body.appendChild(div)
		// get the marker position, this is the caret position top and left relative to the input
		const { offsetLeft: spanX, offsetTop: spanY } = span
		// lastly, remove that dummy element
		// NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
		document.body.removeChild(div)
		// return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
		return {
			x: inputX + spanX,
			y: inputY + spanY,
		}
	}

	$.fn.codeComplete = function(options) {
		var targetInput = this[0];
		var suggestionDropdownPosition;
		this.autocomplete({
			minLength: 0,
			delay: options.delay ?? 0,
			autoFocus: true,
			source: function( request, response ) {
				var structuredSearchString = ExtractStructuredSearchString(targetInput);
				var actualSearchString = ExtractActualSearchString(structuredSearchString);
				
				// Suggested values should not be shown until a character is entered.
				// minLength option of autocomplete does not work since it considers the whole input field value.
				if(structuredSearchString === "") {
					$(targetInput).autocomplete("close");
					return;
				}

				suggestionDropdownPosition = getCursorXY(targetInput, targetInput.selectionStart - actualSearchString.length);
				
				response( $.ui.autocomplete.filter(
					GetSearchOptionsForCurrentSearchString(structuredSearchString, options.context), actualSearchString ) );
			},
			focus: function() {
			  // prevent value inserted on focus
			  return false;
			},
			select: function( event, ui ) {
				var structuredSearchString = ExtractStructuredSearchString(targetInput);
				var actualSearchString = ExtractActualSearchString(structuredSearchString);
			  
				var restOfTheString = this.value.substr(targetInput.selectionStart);
				var firstPartOfTheString = this.value.substr(0, targetInput.selectionStart - actualSearchString.length);

				this.value = firstPartOfTheString + ui.item.value + restOfTheString;
				this.selectionEnd = firstPartOfTheString.length + ui.item.value.length;
				return false;
			},
			open: function(event, ui) {
				var autocomplete = $(".ui-autocomplete");
				
				autocomplete.css("top", `calc(${suggestionDropdownPosition.y}px + ${autocomplete.css('fontSize')})`);
				autocomplete.css("left", suggestionDropdownPosition.x);
				autocomplete.css("width", 'auto');
			}
		  });
	};
}( jQuery ));