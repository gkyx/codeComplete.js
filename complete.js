(function ( $ ) {
    function GetSearchOptions(composedString, dataStructure) {
      var parts = composedString.split('.');

      var nextObj = dataStructure;
      for (let index = 0; index < parts.length - 1; index++) {
        nextObj = nextObj[parts[index]];
        if(nextObj === undefined) return [];
      }
      return Array.isArray(nextObj) ? nextObj : Object.keys(nextObj);
    }

    function ExtractStructureFromInput(inputElement){
        var inputValue = inputElement.value.replaceAll('\n', ' ').replaceAll('\t', ' ');
        var beforeDot = inputValue.substr(0, inputElement.selectionStart);
        var beforeDotArr = beforeDot.split(' ');
        var composedString = beforeDotArr[beforeDotArr.length - 1];

        var parts = composedString.split('.');
        var searchString = parts[parts.length - 1];
        return [composedString, searchString];
    }

    $.fn.completejs = function(options) {
        var targetInput = this[0];
        var cursorPosition;
        this.autocomplete({
            minLength: 0,
            source: function( request, response ) {
                var [composedString, searchString] = ExtractStructureFromInput(targetInput);

                console.log(composedString);
                console.log(searchString);

                if(searchString === ""){
                    cursorPosition = getCursorXY(targetInput, targetInput.selectionStart);
                }

              // delegate back to autocomplete, but extract the last term
              response( $.ui.autocomplete.filter(
                GetSearchOptions(composedString, options.structure), searchString ) );
            },
            focus: function() {
              // prevent value inserted on focus
              return false;
            },
            select: function( event, ui ) {
                var [_, searchString] = ExtractStructureFromInput(targetInput);
              
                var restOfTheString = this.value.substr(targetInput.selectionStart);
                var firstPartOfTheString = this.value.substr(0, targetInput.selectionStart - searchString.length);

                this.value = firstPartOfTheString + ui.item.value + restOfTheString;
                return false;
            },
            open: function(event, ui) {
                var autocomplete = $(".ui-autocomplete");
                
                autocomplete.css("top", `calc(${cursorPosition.y}px + ${autocomplete.css('fontSize')})`);
                autocomplete.css("left", cursorPosition.x);
                autocomplete.css("width", 'auto');
            }
          });
    };

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
}( jQuery ));