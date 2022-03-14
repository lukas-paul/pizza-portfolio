
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/components/Message.svelte generated by Svelte v3.46.4 */

    const { console: console_1$4 } = globals;
    const file$6 = "src/components/Message.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let p;
    	let t1;
    	let textarea;
    	let t2;
    	let input;
    	let t3;
    	let button;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Write a review";
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Send";
    			add_location(p, file$6, 21, 4, 506);
    			attr_dev(textarea, "class", "comment-box svelte-1qxfb9n");
    			attr_dev(textarea, "maxlength", "200");
    			attr_dev(textarea, "placeholder", "your review");
    			attr_dev(textarea, "type", "text");
    			add_location(textarea, file$6, 22, 4, 532);
    			attr_dev(input, "maxlength", "200");
    			attr_dev(input, "placeholder", "your name");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1qxfb9n");
    			add_location(input, file$6, 23, 4, 674);
    			add_location(button, file$6, 24, 4, 793);
    			attr_dev(div, "class", "message svelte-1qxfb9n");
    			add_location(div, file$6, 20, 0, 463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			append_dev(div, t2);
    			append_dev(div, input);
    			append_dev(div, t3);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*input_handler*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*input_handler_1*/ ctx[3], false, false, false),
    					listen_dev(button, "click", /*sendReview*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Message', slots, []);
    	const dispatch = createEventDispatcher();
    	let newReview = {};

    	const sendReview = () => {
    		console.log("send review, ", newReview);

    		fetch("/send-review", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(newReview)
    		});

    		dispatch('close-message');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	const input_handler = e => $$invalidate(0, newReview.review = e.target.value, newReview);
    	const input_handler_1 = e => $$invalidate(0, newReview.username = e.target.value, newReview);

    	$$self.$capture_state = () => ({
    		slide,
    		createEventDispatcher,
    		dispatch,
    		newReview,
    		sendReview
    	});

    	$$self.$inject_state = $$props => {
    		if ('newReview' in $$props) $$invalidate(0, newReview = $$props.newReview);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newReview, sendReview, input_handler, input_handler_1];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Menu.svelte generated by Svelte v3.46.4 */

    const { console: console_1$3 } = globals;
    const file$5 = "src/components/Menu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (27:8) {#each selectedMenuItems as item}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t0_value = /*item*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*item*/ ctx[1].ingredients + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*item*/ ctx[1].price + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			set_style(p0, "font-weight", "bold");
    			attr_dev(p0, "class", "title-text");
    			add_location(p0, file$5, 29, 24, 729);
    			set_style(p1, "font-style", "italic");
    			add_location(p1, file$5, 30, 24, 818);
    			add_location(p2, file$5, 31, 24, 895);
    			attr_dev(div0, "class", "item-text");
    			add_location(div0, file$5, 28, 21, 681);
    			attr_dev(div1, "class", "item svelte-1rog6u7");
    			add_location(div1, file$5, 27, 17, 641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p2);
    			append_dev(p2, t4);
    			append_dev(div1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedMenuItems*/ 1 && t0_value !== (t0_value = /*item*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*selectedMenuItems*/ 1 && t2_value !== (t2_value = /*item*/ ctx[1].ingredients + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*selectedMenuItems*/ 1 && t4_value !== (t4_value = /*item*/ ctx[1].price + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:8) {#each selectedMenuItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value = /*selectedMenuItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Our famous Pizzas";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-1rog6u7");
    			add_location(h2, file$5, 24, 4, 527);
    			attr_dev(div0, "class", "menu-list svelte-1rog6u7");
    			add_location(div0, file$5, 25, 4, 558);
    			attr_dev(div1, "class", "menu svelte-1rog6u7");
    			add_location(div1, file$5, 23, 0, 504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedMenuItems*/ 1) {
    				each_value = /*selectedMenuItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let selectedMenuItems = [];

    	fetch("/menu-items").then(results => {
    		console.log(results);
    		return results.json();
    	}).then(results => {
    		console.log("result from reviews:", results);
    		let selectedArr = [];

    		results.forEach(item => {
    			if (item.selected === "true") {
    				selectedArr.push(item);
    				$$invalidate(0, selectedMenuItems = selectedArr);
    			} else {
    				return;
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ selectedMenuItems });

    	$$self.$inject_state = $$props => {
    		if ('selectedMenuItems' in $$props) $$invalidate(0, selectedMenuItems = $$props.selectedMenuItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedMenuItems];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Location.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/components/Location.svelte";

    function create_fragment$4(ctx) {
    	let div5;
    	let div3;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let div2;
    	let h21;
    	let t7;
    	let div1;
    	let img;
    	let img_src_value;
    	let t8;
    	let p2;
    	let t10;
    	let p3;
    	let t12;
    	let div4;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Find us!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Münchenstraße 13";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "11234 München";
    			t5 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Contact us!";
    			t7 = space();
    			div1 = element("div");
    			img = element("img");
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "+49 170 500500";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "@ lagrandepizza@gmail.com";
    			t12 = space();
    			div4 = element("div");
    			iframe = element("iframe");
    			attr_dev(h20, "class", "svelte-93ur83");
    			add_location(h20, file$4, 9, 12, 123);
    			attr_dev(p0, "class", "svelte-93ur83");
    			add_location(p0, file$4, 10, 12, 153);
    			attr_dev(p1, "class", "svelte-93ur83");
    			add_location(p1, file$4, 11, 12, 189);
    			attr_dev(div0, "class", "location-section svelte-93ur83");
    			add_location(div0, file$4, 8, 8, 80);
    			attr_dev(h21, "class", "svelte-93ur83");
    			add_location(h21, file$4, 14, 12, 275);
    			attr_dev(img, "class", "logo svelte-93ur83");
    			if (!src_url_equal(img.src, img_src_value = "phone.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "phone");
    			add_location(img, file$4, 16, 16, 351);
    			attr_dev(p2, "class", "svelte-93ur83");
    			add_location(p2, file$4, 17, 16, 414);
    			attr_dev(div1, "class", "contact-line svelte-93ur83");
    			add_location(div1, file$4, 15, 12, 308);
    			attr_dev(p3, "class", "svelte-93ur83");
    			add_location(p3, file$4, 19, 12, 467);
    			attr_dev(div2, "class", "contact-section svelte-93ur83");
    			add_location(div2, file$4, 13, 8, 233);
    			attr_dev(div3, "class", "location-text svelte-93ur83");
    			add_location(div3, file$4, 7, 4, 46);
    			attr_dev(iframe, "class", "map svelte-93ur83");
    			attr_dev(iframe, "title", "location-maps");
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.3360989642433!2d13.423634515850193!3d52.49115537980871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84fa01131b745%3A0x6074469a15bb99e4!2sGazzo!5e0!3m2!1sen!2sde!4v1646829968220!5m2!1sen!2sde")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "600");
    			attr_dev(iframe, "height", "450");
    			set_style(iframe, "border", "0");
    			iframe.allowFullscreen = "";
    			attr_dev(iframe, "loading", "lazy");
    			add_location(iframe, file$4, 23, 8, 566);
    			attr_dev(div4, "class", "map-container svelte-93ur83");
    			add_location(div4, file$4, 22, 4, 530);
    			attr_dev(div5, "class", "info svelte-93ur83");
    			add_location(div5, file$4, 6, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(div2, t10);
    			append_dev(div2, p3);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, iframe);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Location', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Location> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Location extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Location",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/AboutUs.svelte generated by Svelte v3.46.4 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/components/AboutUs.svelte";

    // (51:9) {#if reviewOnScreen}
    function create_if_block_1$2(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1_value = /*reviewOnScreen*/ ctx[0].review + "";
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*reviewOnScreen*/ ctx[0].username + "";
    	let t4;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text("\"");
    			t1 = text(t1_value);
    			t2 = text("\"");
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			attr_dev(h2, "class", "svelte-1swlfcc");
    			add_location(h2, file$3, 52, 12, 1311);
    			attr_dev(p, "class", "svelte-1swlfcc");
    			add_location(p, file$3, 53, 12, 1359);
    			attr_dev(div, "class", "review svelte-1swlfcc");
    			add_location(div, file$3, 51, 8, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(div, t3);
    			append_dev(div, p);
    			append_dev(p, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*reviewOnScreen*/ 1) && t1_value !== (t1_value = /*reviewOnScreen*/ ctx[0].review + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*reviewOnScreen*/ 1) && t4_value !== (t4_value = /*reviewOnScreen*/ ctx[0].username + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(51:9) {#if reviewOnScreen}",
    		ctx
    	});

    	return block;
    }

    // (61:5) {#if message}
    function create_if_block$3(ctx) {
    	let message_1;
    	let current;
    	message_1 = new Message({ $$inline: true });
    	message_1.$on("close-message", /*toggleMessage*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(message_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(message_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(message_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(message_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(message_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(61:5) {#if message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let t0;
    	let p;
    	let t2;
    	let t3;
    	let div1;
    	let menu;
    	let t4;
    	let div2;
    	let location;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*reviewOnScreen*/ ctx[0] && create_if_block_1$2(ctx);
    	let if_block1 = /*message*/ ctx[1] && create_if_block$3(ctx);
    	menu = new Menu({ $$inline: true });
    	location = new Location({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p = element("p");
    			p.textContent = "Leave a review";
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div1 = element("div");
    			create_component(menu.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(location.$$.fragment);
    			attr_dev(div0, "class", "review-section svelte-1swlfcc");
    			add_location(div0, file$3, 49, 4, 1195);
    			attr_dev(p, "class", "open-review svelte-1swlfcc");
    			add_location(p, file$3, 57, 4, 1439);
    			attr_dev(div1, "class", "menu-section svelte-1swlfcc");
    			add_location(div1, file$3, 63, 4, 1604);
    			attr_dev(div2, "class", "location-section svelte-1swlfcc");
    			add_location(div2, file$3, 67, 5, 1664);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(menu, div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(location, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(p, "click", /*toggleMessage*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*reviewOnScreen*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*reviewOnScreen*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*message*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*message*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(menu.$$.fragment, local);
    			transition_in(location.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(menu.$$.fragment, local);
    			transition_out(location.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(menu);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			destroy_component(location);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AboutUs', slots, []);
    	let selectedReviews = [];

    	fetch("/reviews").then(results => {
    		console.log("review results: ", results);
    		return results.json();
    	}).then(results => {
    		console.log("result from reviews:", results);
    		let selectedArr = [];

    		results.forEach(review => {
    			console.log("review: ", review.selected);

    			if (review.selected === "true") {
    				selectedArr.push(review);
    				selectedReviews = selectedArr;
    			} else {
    				return;
    			}
    		});
    	});

    	let i = 0;
    	let reviewOnScreen = false;

    	setInterval(
    		() => {
    			if (!reviewOnScreen) {
    				$$invalidate(0, reviewOnScreen = selectedReviews[i]);

    				if (i <= selectedReviews.length) {
    					i++;
    				} else {
    					i = 0;
    				}
    			} else {
    				$$invalidate(0, reviewOnScreen = !reviewOnScreen);
    			}
    		},
    		3000
    	);

    	//$: reviewOnScreen = reviewOnScreen
    	let message = false;

    	const toggleMessage = () => {
    		$$invalidate(1, message = !message);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<AboutUs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		Message,
    		Menu,
    		Location,
    		selectedReviews,
    		i,
    		reviewOnScreen,
    		message,
    		toggleMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedReviews' in $$props) selectedReviews = $$props.selectedReviews;
    		if ('i' in $$props) i = $$props.i;
    		if ('reviewOnScreen' in $$props) $$invalidate(0, reviewOnScreen = $$props.reviewOnScreen);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [reviewOnScreen, message, toggleMessage];
    }

    class AboutUs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutUs",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Login.svelte generated by Svelte v3.46.4 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/components/Login.svelte";

    // (37:8) {#if loginFail}
    function create_if_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Name and/or password incorrect";
    			add_location(p, file$2, 37, 12, 1062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:8) {#if loginFail}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*loginFail*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Login";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "submit";
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$2, 32, 8, 748);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "user");
    			attr_dev(input0, "class", "svelte-1cgth1b");
    			add_location(input0, file$2, 33, 8, 771);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "password");
    			attr_dev(input1, "class", "svelte-1cgth1b");
    			add_location(input1, file$2, 34, 8, 868);
    			add_location(button, file$2, 35, 8, 977);
    			attr_dev(div0, "class", "login-area svelte-1cgth1b");
    			add_location(div0, file$2, 31, 4, 715);
    			attr_dev(div1, "class", "login svelte-1cgth1b");
    			add_location(div1, file$2, 30, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div0, t2);
    			append_dev(div0, input1);
    			append_dev(div0, t3);
    			append_dev(div0, button);
    			append_dev(div0, t5);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input_handler*/ ctx[3], false, false, false),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*sendLoginData*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loginFail*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const dispatch = createEventDispatcher();
    	let loginData = {};
    	let loginFail = false;

    	const sendLoginData = () => {
    		fetch("/send-login-data", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(loginData)
    		}).then(result => {
    			return result.json();
    		}).then(result => {
    			console.log("login success? ", result);

    			if (result.success) {
    				dispatch('login-success');
    			} else {
    				$$invalidate(1, loginFail = true);
    			}
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	const input_handler = e => $$invalidate(0, loginData.user = e.target.value, loginData);
    	const input_handler_1 = e => $$invalidate(0, loginData.password = e.target.value, loginData);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		loginData,
    		loginFail,
    		sendLoginData
    	});

    	$$self.$inject_state = $$props => {
    		if ('loginData' in $$props) $$invalidate(0, loginData = $$props.loginData);
    		if ('loginFail' in $$props) $$invalidate(1, loginFail = $$props.loginFail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loginData, loginFail, sendLoginData, input_handler, input_handler_1];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Admin.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Admin.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (116:0) {#if !loggedIn}
    function create_if_block_1$1(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });
    	login.$on("login-success", /*setLogginIn*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(116:0) {#if !loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (119:1) {#if loggedIn}
    function create_if_block$1(ctx) {
    	let main;
    	let h20;
    	let t1;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let h21;
    	let t4;
    	let div0;
    	let t5;
    	let h22;
    	let t7;
    	let div1;
    	let t8;
    	let button0;
    	let t10;
    	let h23;
    	let t12;
    	let div7;
    	let div3;
    	let h30;
    	let t14;
    	let input0;
    	let t15;
    	let input1;
    	let t16;
    	let input2;
    	let t17;
    	let input3;
    	let t18;
    	let label;
    	let t20;
    	let button1;
    	let t22;
    	let div6;
    	let img1;
    	let img1_src_value;
    	let t23;
    	let div4;
    	let h31;
    	let t25;
    	let t26;
    	let div5;
    	let h32;
    	let t28;
    	let t29;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*notSelectedReviews*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*selectedReviews*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*selectedMenuItems*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*notSelectedMenuItems*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h20 = element("h2");
    			h20.textContent = "Reviews";
    			t1 = space();
    			div2 = element("div");
    			img0 = element("img");
    			t2 = space();
    			h21 = element("h2");
    			h21.textContent = "Unpublished Reviews";
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t5 = space();
    			h22 = element("h2");
    			h22.textContent = "Published Reviews";
    			t7 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "Select Reviews";
    			t10 = space();
    			h23 = element("h2");
    			h23.textContent = "Menu";
    			t12 = space();
    			div7 = element("div");
    			div3 = element("div");
    			h30 = element("h3");
    			h30.textContent = "New Item";
    			t14 = space();
    			input0 = element("input");
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			input2 = element("input");
    			t17 = space();
    			input3 = element("input");
    			t18 = space();
    			label = element("label");
    			label.textContent = "Publish?";
    			t20 = space();
    			button1 = element("button");
    			button1.textContent = "Add new menu item";
    			t22 = space();
    			div6 = element("div");
    			img1 = element("img");
    			t23 = space();
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Published Menu Items";
    			t25 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t26 = space();
    			div5 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Unpublished Menu Items";
    			t28 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t29 = space();
    			button2 = element("button");
    			button2.textContent = "Save Changes";
    			add_location(h20, file$1, 120, 4, 3698);
    			attr_dev(img0, "class", "reload-icon svelte-oq7i5");
    			if (!src_url_equal(img0.src, img0_src_value = "reload.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 122, 8, 3749);
    			add_location(h21, file$1, 123, 8, 3829);
    			attr_dev(div0, "class", "review-list svelte-oq7i5");
    			add_location(div0, file$1, 124, 8, 3866);
    			add_location(h22, file$1, 137, 8, 4391);
    			attr_dev(div1, "class", "review-list svelte-oq7i5");
    			add_location(div1, file$1, 138, 8, 4426);
    			attr_dev(button0, "class", "select-reviews");
    			add_location(button0, file$1, 151, 4, 4948);
    			attr_dev(div2, "class", "reviews svelte-oq7i5");
    			add_location(div2, file$1, 121, 4, 3719);
    			add_location(h23, file$1, 153, 5, 5044);
    			add_location(h30, file$1, 157, 8, 5120);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file$1, 158, 8, 5146);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Ingredients");
    			add_location(input1, file$1, 159, 8, 5241);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "Price");
    			add_location(input2, file$1, 160, 8, 5350);
    			attr_dev(input3, "class", "checkbox");
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "id", "checkbox-id");
    			add_location(input3, file$1, 161, 8, 5449);
    			attr_dev(label, "for", "checkbox-id");
    			add_location(label, file$1, 162, 8, 5515);
    			add_location(button1, file$1, 163, 8, 5566);
    			attr_dev(div3, "class", "new-item svelte-oq7i5");
    			add_location(div3, file$1, 156, 4, 5089);
    			attr_dev(img1, "class", "reload-icon svelte-oq7i5");
    			if (!src_url_equal(img1.src, img1_src_value = "reload.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 167, 8, 5679);
    			add_location(h31, file$1, 169, 16, 5807);
    			attr_dev(div4, "class", "review-list svelte-oq7i5");
    			add_location(div4, file$1, 168, 12, 5765);
    			add_location(h32, file$1, 184, 16, 6448);
    			attr_dev(div5, "class", "review-list svelte-oq7i5");
    			add_location(div5, file$1, 183, 12, 6406);
    			add_location(button2, file$1, 198, 8, 7036);
    			attr_dev(div6, "class", "menu-selection svelte-oq7i5");
    			add_location(div6, file$1, 166, 4, 5642);
    			attr_dev(div7, "class", "Menu");
    			add_location(div7, file$1, 154, 4, 5062);
    			attr_dev(main, "class", "svelte-oq7i5");
    			add_location(main, file$1, 119, 0, 3687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h20);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t2);
    			append_dev(div2, h21);
    			append_dev(div2, t4);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div2, t5);
    			append_dev(div2, h22);
    			append_dev(div2, t7);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(div2, t8);
    			append_dev(div2, button0);
    			append_dev(main, t10);
    			append_dev(main, h23);
    			append_dev(main, t12);
    			append_dev(main, div7);
    			append_dev(div7, div3);
    			append_dev(div3, h30);
    			append_dev(div3, t14);
    			append_dev(div3, input0);
    			append_dev(div3, t15);
    			append_dev(div3, input1);
    			append_dev(div3, t16);
    			append_dev(div3, input2);
    			append_dev(div3, t17);
    			append_dev(div3, input3);
    			append_dev(div3, t18);
    			append_dev(div3, label);
    			append_dev(div3, t20);
    			append_dev(div3, button1);
    			append_dev(div7, t22);
    			append_dev(div7, div6);
    			append_dev(div6, img1);
    			append_dev(div6, t23);
    			append_dev(div6, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t25);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div4, null);
    			}

    			append_dev(div6, t26);
    			append_dev(div6, div5);
    			append_dev(div5, h32);
    			append_dev(div5, t28);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			append_dev(div6, t29);
    			append_dev(div6, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*getReviews*/ ctx[6], false, false, false),
    					listen_dev(button0, "click", /*selectReviews*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input_handler*/ ctx[12], false, false, false),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[13], false, false, false),
    					listen_dev(input2, "input", /*input_handler_2*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", /*addItemToMenu*/ ctx[10], false, false, false),
    					listen_dev(img1, "click", /*getMenuItems*/ ctx[7], false, false, false),
    					listen_dev(button2, "click", /*selectMenuItems*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notSelectedReviews*/ 4) {
    				each_value_3 = /*notSelectedReviews*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*selectedReviews*/ 2) {
    				each_value_2 = /*selectedReviews*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*selectedMenuItems*/ 8) {
    				each_value_1 = /*selectedMenuItems*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*notSelectedMenuItems*/ 16) {
    				each_value = /*notSelectedMenuItems*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(119:1) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (126:12) {#each notSelectedReviews as review}
    function create_each_block_3(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t0_value = /*review*/ ctx[20].username + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*review*/ ctx[20].review + "";
    	let t2;
    	let t3;
    	let div1;
    	let input;
    	let input_value_value;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			input = element("input");
    			t4 = space();
    			attr_dev(p0, "class", "title-text svelte-oq7i5");
    			add_location(p0, file$1, 128, 24, 4050);
    			add_location(p1, file$1, 129, 24, 4118);
    			attr_dev(div0, "class", "review-text svelte-oq7i5");
    			add_location(div0, file$1, 127, 21, 4000);
    			attr_dev(input, "class", "checkbox svelte-oq7i5");
    			attr_dev(input, "type", "checkbox");
    			input.value = input_value_value = /*review*/ ctx[20].id;
    			add_location(input, file$1, 132, 24, 4241);
    			attr_dev(div1, "class", "review-select svelte-oq7i5");
    			add_location(div1, file$1, 131, 20, 4189);
    			attr_dev(div2, "class", "review svelte-oq7i5");
    			add_location(div2, file$1, 126, 17, 3958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notSelectedReviews*/ 4 && t0_value !== (t0_value = /*review*/ ctx[20].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*notSelectedReviews*/ 4 && t2_value !== (t2_value = /*review*/ ctx[20].review + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*notSelectedReviews*/ 4 && input_value_value !== (input_value_value = /*review*/ ctx[20].id)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(126:12) {#each notSelectedReviews as review}",
    		ctx
    	});

    	return block;
    }

    // (140:12) {#each selectedReviews as review}
    function create_each_block_2(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t0_value = /*review*/ ctx[20].username + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*review*/ ctx[20].review + "";
    	let t2;
    	let t3;
    	let div1;
    	let input;
    	let input_value_value;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			input = element("input");
    			t4 = space();
    			attr_dev(p0, "class", "title-text svelte-oq7i5");
    			add_location(p0, file$1, 142, 24, 4607);
    			add_location(p1, file$1, 143, 24, 4675);
    			attr_dev(div0, "class", "review-text svelte-oq7i5");
    			add_location(div0, file$1, 141, 21, 4557);
    			attr_dev(input, "class", "checkbox svelte-oq7i5");
    			attr_dev(input, "type", "checkbox");
    			input.value = input_value_value = /*review*/ ctx[20].id;
    			add_location(input, file$1, 146, 24, 4798);
    			attr_dev(div1, "class", "review-select svelte-oq7i5");
    			add_location(div1, file$1, 145, 20, 4746);
    			attr_dev(div2, "class", "review svelte-oq7i5");
    			add_location(div2, file$1, 140, 17, 4515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedReviews*/ 2 && t0_value !== (t0_value = /*review*/ ctx[20].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*selectedReviews*/ 2 && t2_value !== (t2_value = /*review*/ ctx[20].review + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*selectedReviews*/ 2 && input_value_value !== (input_value_value = /*review*/ ctx[20].id)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(140:12) {#each selectedReviews as review}",
    		ctx
    	});

    	return block;
    }

    // (171:16) {#each selectedMenuItems as item}
    function create_each_block_1(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t0_value = /*item*/ ctx[15].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*item*/ ctx[15].ingredients + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*item*/ ctx[15].price + "";
    	let t4;
    	let t5;
    	let div1;
    	let input;
    	let input_value_value;
    	let t6;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			input = element("input");
    			t6 = space();
    			attr_dev(p0, "class", "title-text svelte-oq7i5");
    			add_location(p0, file$1, 173, 24, 5992);
    			add_location(p1, file$1, 174, 24, 6054);
    			add_location(p2, file$1, 175, 24, 6104);
    			attr_dev(div0, "class", "item-text svelte-oq7i5");
    			add_location(div0, file$1, 172, 21, 5944);
    			attr_dev(input, "class", "checkbox_menu svelte-oq7i5");
    			attr_dev(input, "type", "checkbox");
    			input.value = input_value_value = /*item*/ ctx[15].id;
    			input.checked = "true";
    			add_location(input, file$1, 178, 24, 6224);
    			attr_dev(div1, "class", "review-select svelte-oq7i5");
    			add_location(div1, file$1, 177, 20, 6172);
    			attr_dev(div2, "class", "item svelte-oq7i5");
    			add_location(div2, file$1, 171, 17, 5904);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p2);
    			append_dev(p2, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedMenuItems*/ 8 && t0_value !== (t0_value = /*item*/ ctx[15].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*selectedMenuItems*/ 8 && t2_value !== (t2_value = /*item*/ ctx[15].ingredients + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*selectedMenuItems*/ 8 && t4_value !== (t4_value = /*item*/ ctx[15].price + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*selectedMenuItems*/ 8 && input_value_value !== (input_value_value = /*item*/ ctx[15].id)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(171:16) {#each selectedMenuItems as item}",
    		ctx
    	});

    	return block;
    }

    // (186:16) {#each notSelectedMenuItems as item}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t0_value = /*item*/ ctx[15].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*item*/ ctx[15].ingredients + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*item*/ ctx[15].price + "";
    	let t4;
    	let t5;
    	let div1;
    	let input;
    	let input_value_value;
    	let t6;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			input = element("input");
    			t6 = space();
    			attr_dev(p0, "class", "title-text svelte-oq7i5");
    			add_location(p0, file$1, 188, 24, 6638);
    			add_location(p1, file$1, 189, 24, 6700);
    			add_location(p2, file$1, 190, 24, 6750);
    			attr_dev(div0, "class", "item-text svelte-oq7i5");
    			add_location(div0, file$1, 187, 21, 6590);
    			attr_dev(input, "class", "checkbox_menu svelte-oq7i5");
    			attr_dev(input, "type", "checkbox");
    			input.value = input_value_value = /*item*/ ctx[15].id;
    			add_location(input, file$1, 193, 24, 6870);
    			attr_dev(div1, "class", "review-select svelte-oq7i5");
    			add_location(div1, file$1, 192, 20, 6818);
    			attr_dev(div2, "class", "item svelte-oq7i5");
    			add_location(div2, file$1, 186, 17, 6550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p2);
    			append_dev(p2, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notSelectedMenuItems*/ 16 && t0_value !== (t0_value = /*item*/ ctx[15].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*notSelectedMenuItems*/ 16 && t2_value !== (t2_value = /*item*/ ctx[15].ingredients + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*notSelectedMenuItems*/ 16 && t4_value !== (t4_value = /*item*/ ctx[15].price + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*notSelectedMenuItems*/ 16 && input_value_value !== (input_value_value = /*item*/ ctx[15].id)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(186:16) {#each notSelectedMenuItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*loggedIn*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block1 = /*loggedIn*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*loggedIn*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*loggedIn*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*loggedIn*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Admin', slots, []);
    	let loggedIn = false;
    	let selectedReviews = [];
    	let notSelectedReviews = [];

    	const getReviews = () => {
    		fetch("/reviews").then(results => {
    			console.log("review results: ", results);
    			return results.json();
    		}).then(results => {
    			console.log("result from reviews:", results);
    			let notSelectedArr = [];
    			let selectedArr = [];

    			results.forEach(review => {
    				console.log("review: ", review.selected);

    				if (review.selected === "true") {
    					selectedArr.push(review);
    					$$invalidate(1, selectedReviews = selectedArr);
    				} else {
    					notSelectedArr.push(review);
    					$$invalidate(2, notSelectedReviews = notSelectedArr);
    				}

    				console.log("not selected Reviews: ", notSelectedReviews);
    			});
    		});
    	};

    	getReviews();
    	let selectedMenuItems = [];
    	let notSelectedMenuItems = [];

    	const getMenuItems = () => {
    		fetch("/menu-items").then(results => {
    			console.log(results);
    			return results.json();
    		}).then(results => {
    			console.log("result from reviews:", results);
    			let notSelectedArr = [];
    			let selectedArr = [];

    			results.forEach(item => {
    				if (item.selected === "true") {
    					selectedArr.push(item);
    					$$invalidate(3, selectedMenuItems = selectedArr);
    				} else {
    					notSelectedArr.push(item);
    					$$invalidate(4, notSelectedMenuItems = notSelectedArr);
    				}

    				console.log("not selected Reviews: ", notSelectedReviews);
    			});
    		});
    	};

    	getMenuItems();

    	const selectReviews = () => {
    		let inputElements = document.getElementsByClassName('checkbox');

    		//console.log("checkedValue: ", checkedValue[3].value);
    		let checkedValue = [];

    		for (let i = 0; inputElements[i]; i++) {
    			if (inputElements[i].checked) {
    				checkedValue.push(inputElements[i].value);
    			}
    		}

    		console.log("selected ids: ", checkedValue);
    		let selectedReviews = { selected: checkedValue };

    		fetch("/update-selected", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(selectedReviews)
    		});
    	};

    	const selectMenuItems = () => {
    		let inputElements = document.getElementsByClassName('checkbox_menu');
    		console.log("inputElements: ", inputElements);
    		let checkedValue = [];

    		for (let i = 0; inputElements[i]; i++) {
    			if (inputElements[i].checked) {
    				checkedValue.push(inputElements[i].value);
    			}
    		}

    		console.log("selected ids: ", checkedValue);
    		let selectedMenuItems = { selected: checkedValue };

    		fetch("/update-selected-menu", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(selectedMenuItems)
    		});
    	};

    	let newItem = {};

    	const addItemToMenu = () => {
    		let publish = document.getElementById("checkbox-id").checked;

    		publish
    		? $$invalidate(5, newItem.selected = "true", newItem)
    		: $$invalidate(5, newItem.selected = "false", newItem);

    		fetch("/add-menu-item", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(newItem)
    		});
    	};

    	const setLogginIn = () => {
    		$$invalidate(0, loggedIn = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Admin> was created with unknown prop '${key}'`);
    	});

    	const input_handler = e => $$invalidate(5, newItem.name = e.target.value, newItem);
    	const input_handler_1 = e => $$invalidate(5, newItem.ingredients = e.target.value, newItem);
    	const input_handler_2 = e => $$invalidate(5, newItem.price = e.target.value, newItem);

    	$$self.$capture_state = () => ({
    		Login,
    		loggedIn,
    		selectedReviews,
    		notSelectedReviews,
    		getReviews,
    		selectedMenuItems,
    		notSelectedMenuItems,
    		getMenuItems,
    		selectReviews,
    		selectMenuItems,
    		newItem,
    		addItemToMenu,
    		setLogginIn
    	});

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('selectedReviews' in $$props) $$invalidate(1, selectedReviews = $$props.selectedReviews);
    		if ('notSelectedReviews' in $$props) $$invalidate(2, notSelectedReviews = $$props.notSelectedReviews);
    		if ('selectedMenuItems' in $$props) $$invalidate(3, selectedMenuItems = $$props.selectedMenuItems);
    		if ('notSelectedMenuItems' in $$props) $$invalidate(4, notSelectedMenuItems = $$props.notSelectedMenuItems);
    		if ('newItem' in $$props) $$invalidate(5, newItem = $$props.newItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loggedIn,
    		selectedReviews,
    		notSelectedReviews,
    		selectedMenuItems,
    		notSelectedMenuItems,
    		newItem,
    		getReviews,
    		getMenuItems,
    		selectReviews,
    		selectMenuItems,
    		addItemToMenu,
    		setLogginIn,
    		input_handler,
    		input_handler_1,
    		input_handler_2
    	];
    }

    class Admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Admin",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function createUrlStore(ssrUrl) {
        // Ideally a bundler constant so that it's tree-shakable
        if (typeof window === "undefined") {
            const { subscribe } = writable(ssrUrl);
            return { subscribe };
        }

        const href = writable(window.location.href);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        const updateHref = () => href.set(window.location.href);

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            updateHref();
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            updateHref();
        };

        window.addEventListener("popstate", updateHref);
        window.addEventListener("hashchange", updateHref);

        return {
            subscribe: derived(href, ($href) => new URL($href)).subscribe,
        };
    }

    // If you're using in a pure SPA, you can return a store directly and share it everywhere
    var url = createUrlStore();

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    // (13:0) {#if admin}
    function create_if_block_1(ctx) {
    	let admin_1;
    	let current;
    	admin_1 = new Admin({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(admin_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(admin_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(admin_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(admin_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(admin_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(13:0) {#if admin}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if !admin}
    function create_if_block(ctx) {
    	let main;
    	let div0;
    	let h2;
    	let t1;
    	let div2;
    	let div1;
    	let aboutus;
    	let div1_transition;
    	let t2;
    	let div5;
    	let div3;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div4;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let current;
    	aboutus = new AboutUs({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "La Pizzeria Grande";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(aboutus.$$.fragment);
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Opening Hours";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Monday — Sunday: 6pm — 11pm";
    			t6 = space();
    			div4 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t7 = space();
    			a1 = element("a");
    			img1 = element("img");
    			attr_dev(h2, "class", "svelte-5gp2dg");
    			add_location(h2, file, 19, 2, 337);
    			attr_dev(div0, "class", "headline svelte-5gp2dg");
    			add_location(div0, file, 18, 1, 312);
    			add_location(div1, file, 23, 2, 399);
    			attr_dev(div2, "class", "middle svelte-5gp2dg");
    			add_location(div2, file, 22, 1, 376);
    			set_style(p0, "font-weight", "bold");
    			add_location(p0, file, 30, 3, 532);
    			add_location(p1, file, 31, 3, 582);
    			attr_dev(div3, "class", "opening-hours svelte-5gp2dg");
    			add_location(div3, file, 29, 2, 501);
    			if (!src_url_equal(img0.src, img0_src_value = "facebook.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "facebook");
    			attr_dev(img0, "class", "svelte-5gp2dg");
    			add_location(img0, file, 34, 50, 700);
    			attr_dev(a0, "href", "https://www.facebook.com/gazzopizza/");
    			attr_dev(a0, "class", "svelte-5gp2dg");
    			add_location(a0, file, 34, 3, 653);
    			if (!src_url_equal(img1.src, img1_src_value = "instagram.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "instagram");
    			attr_dev(img1, "class", "svelte-5gp2dg");
    			add_location(img1, file, 35, 57, 801);
    			attr_dev(a1, "href", "https://www.instagram.com/gazzopizza/?hl=en");
    			attr_dev(a1, "class", "svelte-5gp2dg");
    			add_location(a1, file, 35, 3, 747);
    			attr_dev(div4, "class", "contact svelte-5gp2dg");
    			add_location(div4, file, 33, 2, 628);
    			attr_dev(div5, "class", "impressum svelte-5gp2dg");
    			add_location(div5, file, 28, 1, 475);
    			attr_dev(main, "class", "svelte-5gp2dg");
    			add_location(main, file, 16, 0, 302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h2);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			mount_component(aboutus, div1, null);
    			append_dev(main, t2);
    			append_dev(main, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t4);
    			append_dev(div3, p1);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, a0);
    			append_dev(a0, img0);
    			append_dev(div4, t7);
    			append_dev(div4, a1);
    			append_dev(a1, img1);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aboutus.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { duration: 1000 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aboutus.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, { duration: 1000 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(aboutus);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if !admin}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*admin*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = !/*admin*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*admin*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*admin*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*admin*/ ctx[0]) {
    				if (if_block1) {
    					if (dirty & /*admin*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, 'url');
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let admin = false;

    	if ($url.hash === "#/admin") {
    		admin = true;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ AboutUs, Admin, url, slide, admin, $url });

    	$$self.$inject_state = $$props => {
    		if ('admin' in $$props) $$invalidate(0, admin = $$props.admin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [admin];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
