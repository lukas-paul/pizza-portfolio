
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import { w as writeEffect } from './writeEffect-37fd49e0.js';
import './sleep-74e9aabb.js';
import './main-c1155dba.js';

/** @type {import(types').OnAnimationEnd} */
const onAnimationEnd = (element, callback) => {
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			const elementAttributeChanged = mutation.type === 'attributes';
			const elementFinishedTyping = mutation.target.classList.contains('typing');
			if (elementAttributeChanged && elementFinishedTyping) callback();
		});
	});

	observer.observe(element, {
		attributes: true,
		childList: true,
		subtree: true
	});
};

const cleanChildText = elements =>
	elements.forEach(element => (element.currentNode.textContent = ''));

/** @type {import('types').TypewriterOptions} */
const mode = async (elements, options) => {
	if (options.cascade) {
		cleanChildText(elements);
	} else {
		const { getLongestTextElement } = await import('./getLongestTextElement-c5a347d3.js');
		const lastElementToFinish = getLongestTextElement(elements);
		onAnimationEnd(lastElementToFinish, () => options.dispatch('done'));
	}
	for (const element of elements) {
		if (options.cascade) {
			await writeEffect(element, options);
			element.currentNode.classList.replace('typing', 'finished-typing');
		} else {
			writeEffect(element, options).then(() => {
				element.currentNode.classList.replace('typing', 'finished-typing');
			});
		}
	}

	options.cascade && options.dispatch('done');
};

export { mode };
//# sourceMappingURL=typewriter-a2c83c95.js.map
