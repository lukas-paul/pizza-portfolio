
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
/** @type {import(types').DescendingSortFunction} */
const descendingSortFunction = (firstElement, secondElement) =>
	secondElement.text.length - firstElement.text.length;

/** @type {import(types').GetLongestTextElement} */
const getLongestTextElement = elements => {
	const descendingTextLengthOrder = elements.sort(descendingSortFunction);
	const longestTextElement = descendingTextLengthOrder[0].currentNode;
	return longestTextElement
};

export { getLongestTextElement };
//# sourceMappingURL=getLongestTextElement-c5a347d3.js.map
