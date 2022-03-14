
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import { sleep } from './sleep-74e9aabb.js';
import { r as runOnEveryParentUntil } from './main-0416f4b1.js';

/** @type {import(types').RandomNumberGenerator} */
const rng = (min, max) => Math.floor(Math.random() * (max - min) + min);

/** @type {import(types').TypingInterval} */
const typingInterval = async interval =>
	sleep(Array.isArray(interval) ? interval[rng(0, interval.length)] : interval);

/** @type {import(types').TypewriterEffectFn} */
const writeEffect = async ({ currentNode, text }, options) => {
	runOnEveryParentUntil(currentNode, options.parentElement, element => {
		const classToAdd = currentNode === element ? 'typing' : 'finished-typing';
		element.classList.add(classToAdd);
	});
	for (let index = 0; index <= text.length; index++) {
		const char = text[index];
		char === '<' && (index = text.indexOf('>', index));
		currentNode.innerHTML = text.slice(0, index);
		await typingInterval(options.interval);
	}
};

export { rng as r, typingInterval as t, writeEffect as w };
//# sourceMappingURL=writeEffect-3ef9bea6.js.map
