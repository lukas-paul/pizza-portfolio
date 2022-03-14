
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import { t as typingInterval, r as rng, w as writeEffect } from './writeEffect-3ef9bea6.js';
import { r as runOnEveryParentUntil } from './main-0416f4b1.js';
import './sleep-74e9aabb.js';

/** @type {import(types').UnwriteEffect} */
const unwriteEffect = async (currentNode, options) => {
	options.dispatch('done');
	await typingInterval(typeof options.loop === 'number' ? options.loop : 1500);
	const text = currentNode.innerHTML.replaceAll('&amp;', '&');
	for (let index = text.length - 1; index >= 0; index--) {
		const letter = text[index];
		letter === '>' && (index = text.lastIndexOf('<', index));
		currentNode.innerHTML = text.slice(0, index);
		await typingInterval(options.unwriteInterval ? options.unwriteInterval : options.interval);
	}
};

/** @type {any[]} */
let alreadyChoosenTexts = [];

/** @type {import(types').GetRandomText} */
const getRandomElement = elements => {
	while (true) {
		const randomIndex = rng(0, elements.length);
		// After each iteration, avoid repeating the last text from the last iteration
		const isTextDifferentFromPrevious =
			typeof alreadyChoosenTexts === 'number' && randomIndex !== alreadyChoosenTexts;
		const isTextFirstTime =
			Array.isArray(alreadyChoosenTexts) && !alreadyChoosenTexts.includes(randomIndex);
		const hasSingleChildElement = elements.length === 1;
		const shouldAnimate =
			hasSingleChildElement || isTextFirstTime || isTextDifferentFromPrevious;
		if (shouldAnimate) {
			isTextDifferentFromPrevious && (alreadyChoosenTexts = []);
			alreadyChoosenTexts.push(randomIndex);
			const randomText = elements[randomIndex];
			return randomText
		}
		const restartRandomizationCycle = alreadyChoosenTexts.length === elements.length;
		restartRandomizationCycle && (alreadyChoosenTexts = alreadyChoosenTexts.pop());
	}
};

/** @type {import('types').TypewriterEffectFn} */
const loopTypewriter = async ({ currentNode, text }, options) => {
	await writeEffect({ currentNode, text }, options);
	const textWithUnescapedAmpersands = text.replaceAll('&', '&amp;');
	const fullyWritten = currentNode.innerHTML === textWithUnescapedAmpersands;
	fullyWritten && (await unwriteEffect(currentNode, options));
	runOnEveryParentUntil(currentNode, options.parentElement, element => {
		currentNode === element
			? element.classList.remove('typing')
			: element.classList.remove('finished-typing');
	});
};

/** @type {import('types').TypewriterModeFn} */
const mode = async (elements, options) => {
	while (true) {
		if (options.loop) {
			for (const element of elements) await loopTypewriter(element, options);
		} else if (options.loopRandom) {
			const element = getRandomElement(elements);
			await loopTypewriter(element, options);
		}
	}
};

export { mode };
//# sourceMappingURL=loopTypewriter-9c2d11f4.js.map
