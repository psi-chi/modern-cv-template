
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
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

    /* src\components\Menu\Menu.svelte generated by Svelte v3.38.2 */

    const file$o = "src\\components\\Menu\\Menu.svelte";

    function create_fragment$o(ctx) {
    	let div18;
    	let div13;
    	let h20;
    	let t1;
    	let div0;
    	let span0;
    	let i0;
    	let t2;
    	let i1;
    	let t3;
    	let p0;
    	let t5;
    	let div1;
    	let span1;
    	let i2;
    	let t6;
    	let i3;
    	let t7;
    	let p1;
    	let t9;
    	let div2;
    	let span2;
    	let i4;
    	let t10;
    	let i5;
    	let t11;
    	let p2;
    	let t13;
    	let div3;
    	let span3;
    	let i6;
    	let t14;
    	let i7;
    	let t15;
    	let p3;
    	let t17;
    	let div4;
    	let span4;
    	let i8;
    	let t18;
    	let i9;
    	let t19;
    	let p4;
    	let t21;
    	let div5;
    	let span5;
    	let i10;
    	let t22;
    	let i11;
    	let t23;
    	let p5;
    	let t25;
    	let div6;
    	let span6;
    	let i12;
    	let t26;
    	let i13;
    	let t27;
    	let p6;
    	let t29;
    	let div7;
    	let span7;
    	let i14;
    	let t30;
    	let i15;
    	let t31;
    	let p7;
    	let t33;
    	let div8;
    	let span8;
    	let i16;
    	let t34;
    	let i17;
    	let t35;
    	let p8;
    	let t37;
    	let div9;
    	let span9;
    	let i18;
    	let t38;
    	let i19;
    	let t39;
    	let p9;
    	let t41;
    	let div10;
    	let span10;
    	let i20;
    	let t42;
    	let i21;
    	let t43;
    	let p10;
    	let t45;
    	let div11;
    	let span11;
    	let i22;
    	let t46;
    	let i23;
    	let t47;
    	let p11;
    	let t49;
    	let div12;
    	let span12;
    	let i24;
    	let t50;
    	let i25;
    	let t51;
    	let p12;
    	let t53;
    	let div17;
    	let h21;
    	let t55;
    	let div14;
    	let span13;
    	let i26;
    	let t56;
    	let i27;
    	let t57;
    	let p13;
    	let t59;
    	let div15;
    	let span14;
    	let i28;
    	let t60;
    	let i29;
    	let t61;
    	let p14;
    	let t63;
    	let div16;
    	let span15;
    	let i30;
    	let t64;
    	let i31;
    	let t65;
    	let p15;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div18 = element("div");
    			div13 = element("div");
    			h20 = element("h2");
    			h20.textContent = "TOGGLE";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "AVATAR";
    			t5 = space();
    			div1 = element("div");
    			span1 = element("span");
    			i2 = element("i");
    			t6 = space();
    			i3 = element("i");
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "ABOUT ME";
    			t9 = space();
    			div2 = element("div");
    			span2 = element("span");
    			i4 = element("i");
    			t10 = space();
    			i5 = element("i");
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "INTERESTS";
    			t13 = space();
    			div3 = element("div");
    			span3 = element("span");
    			i6 = element("i");
    			t14 = space();
    			i7 = element("i");
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "CONTACT";
    			t17 = space();
    			div4 = element("div");
    			span4 = element("span");
    			i8 = element("i");
    			t18 = space();
    			i9 = element("i");
    			t19 = space();
    			p4 = element("p");
    			p4.textContent = "SOCIAL MEDIA";
    			t21 = space();
    			div5 = element("div");
    			span5 = element("span");
    			i10 = element("i");
    			t22 = space();
    			i11 = element("i");
    			t23 = space();
    			p5 = element("p");
    			p5.textContent = "NAME";
    			t25 = space();
    			div6 = element("div");
    			span6 = element("span");
    			i12 = element("i");
    			t26 = space();
    			i13 = element("i");
    			t27 = space();
    			p6 = element("p");
    			p6.textContent = "SKILLS";
    			t29 = space();
    			div7 = element("div");
    			span7 = element("span");
    			i14 = element("i");
    			t30 = space();
    			i15 = element("i");
    			t31 = space();
    			p7 = element("p");
    			p7.textContent = "WORK EXPERIENCE";
    			t33 = space();
    			div8 = element("div");
    			span8 = element("span");
    			i16 = element("i");
    			t34 = space();
    			i17 = element("i");
    			t35 = space();
    			p8 = element("p");
    			p8.textContent = "EDUCATION";
    			t37 = space();
    			div9 = element("div");
    			span9 = element("span");
    			i18 = element("i");
    			t38 = space();
    			i19 = element("i");
    			t39 = space();
    			p9 = element("p");
    			p9.textContent = "CERTIFICATIONS";
    			t41 = space();
    			div10 = element("div");
    			span10 = element("span");
    			i20 = element("i");
    			t42 = space();
    			i21 = element("i");
    			t43 = space();
    			p10 = element("p");
    			p10.textContent = "PROJECTS";
    			t45 = space();
    			div11 = element("div");
    			span11 = element("span");
    			i22 = element("i");
    			t46 = space();
    			i23 = element("i");
    			t47 = space();
    			p11 = element("p");
    			p11.textContent = "ACHIEVEMENTS";
    			t49 = space();
    			div12 = element("div");
    			span12 = element("span");
    			i24 = element("i");
    			t50 = space();
    			i25 = element("i");
    			t51 = space();
    			p12 = element("p");
    			p12.textContent = "POSITIONS";
    			t53 = space();
    			div17 = element("div");
    			h21 = element("h2");
    			h21.textContent = "OTHERS";
    			t55 = space();
    			div14 = element("div");
    			span13 = element("span");
    			i26 = element("i");
    			t56 = space();
    			i27 = element("i");
    			t57 = space();
    			p13 = element("p");
    			p13.textContent = "SKILLS (LEFT)";
    			t59 = space();
    			div15 = element("div");
    			span14 = element("span");
    			i28 = element("i");
    			t60 = space();
    			i29 = element("i");
    			t61 = space();
    			p14 = element("p");
    			p14.textContent = "CUSTOM (LEFT)";
    			t63 = space();
    			div16 = element("div");
    			span15 = element("span");
    			i30 = element("i");
    			t64 = space();
    			i31 = element("i");
    			t65 = space();
    			p15 = element("p");
    			p15.textContent = "CUSTOM (RIGHT)";
    			attr_dev(h20, "class", "svelte-17u838d");
    			add_location(h20, file$o, 57, 4, 1515);
    			attr_dev(i0, "class", "far svelte-17u838d");
    			toggle_class(i0, "fa-star", !/*avatar*/ ctx[0]);
    			add_location(i0, file$o, 60, 8, 1632);
    			attr_dev(i1, "class", "fas svelte-17u838d");
    			toggle_class(i1, "fa-star", /*avatar*/ ctx[0]);
    			add_location(i1, file$o, 61, 8, 1683);
    			attr_dev(span0, "class", "avatar svelte-17u838d");
    			add_location(span0, file$o, 59, 6, 1565);
    			attr_dev(p0, "class", "svelte-17u838d");
    			add_location(p0, file$o, 63, 6, 1746);
    			attr_dev(div0, "class", "toggler svelte-17u838d");
    			add_location(div0, file$o, 58, 4, 1536);
    			attr_dev(i2, "class", "far svelte-17u838d");
    			toggle_class(i2, "fa-star", !/*aboutme*/ ctx[1]);
    			add_location(i2, file$o, 67, 8, 1875);
    			attr_dev(i3, "class", "fas svelte-17u838d");
    			toggle_class(i3, "fa-star", /*aboutme*/ ctx[1]);
    			add_location(i3, file$o, 68, 8, 1927);
    			attr_dev(span1, "class", "aboutme svelte-17u838d");
    			add_location(span1, file$o, 66, 6, 1806);
    			attr_dev(p1, "class", "svelte-17u838d");
    			add_location(p1, file$o, 70, 6, 1991);
    			attr_dev(div1, "class", "toggler svelte-17u838d");
    			add_location(div1, file$o, 65, 4, 1777);
    			attr_dev(i4, "class", "far svelte-17u838d");
    			toggle_class(i4, "fa-star", !/*interests*/ ctx[2]);
    			add_location(i4, file$o, 74, 8, 2126);
    			attr_dev(i5, "class", "fas svelte-17u838d");
    			toggle_class(i5, "fa-star", /*interests*/ ctx[2]);
    			add_location(i5, file$o, 75, 8, 2180);
    			attr_dev(span2, "class", "interests svelte-17u838d");
    			add_location(span2, file$o, 73, 6, 2053);
    			attr_dev(p2, "class", "svelte-17u838d");
    			add_location(p2, file$o, 77, 6, 2246);
    			attr_dev(div2, "class", "toggler svelte-17u838d");
    			add_location(div2, file$o, 72, 4, 2024);
    			attr_dev(i6, "class", "far svelte-17u838d");
    			toggle_class(i6, "fa-star", !/*contact*/ ctx[3]);
    			add_location(i6, file$o, 81, 8, 2378);
    			attr_dev(i7, "class", "fas svelte-17u838d");
    			toggle_class(i7, "fa-star", /*contact*/ ctx[3]);
    			add_location(i7, file$o, 82, 8, 2430);
    			attr_dev(span3, "class", "contact svelte-17u838d");
    			add_location(span3, file$o, 80, 6, 2309);
    			attr_dev(p3, "class", "svelte-17u838d");
    			add_location(p3, file$o, 84, 6, 2494);
    			attr_dev(div3, "class", "toggler svelte-17u838d");
    			add_location(div3, file$o, 79, 4, 2280);
    			attr_dev(i8, "class", "far svelte-17u838d");
    			toggle_class(i8, "fa-star", !/*social*/ ctx[4]);
    			add_location(i8, file$o, 88, 8, 2634);
    			attr_dev(i9, "class", "fas svelte-17u838d");
    			toggle_class(i9, "fa-star", /*social*/ ctx[4]);
    			add_location(i9, file$o, 89, 8, 2685);
    			attr_dev(span4, "class", "social-media svelte-17u838d");
    			add_location(span4, file$o, 87, 6, 2555);
    			attr_dev(p4, "class", "svelte-17u838d");
    			add_location(p4, file$o, 91, 6, 2748);
    			attr_dev(div4, "class", "toggler svelte-17u838d");
    			add_location(div4, file$o, 86, 4, 2526);
    			attr_dev(i10, "class", "far svelte-17u838d");
    			toggle_class(i10, "fa-star", !/*name*/ ctx[5]);
    			add_location(i10, file$o, 95, 8, 2877);
    			attr_dev(i11, "class", "fas svelte-17u838d");
    			toggle_class(i11, "fa-star", /*name*/ ctx[5]);
    			add_location(i11, file$o, 96, 8, 2926);
    			attr_dev(span5, "class", "name svelte-17u838d");
    			add_location(span5, file$o, 94, 6, 2814);
    			attr_dev(p5, "class", "svelte-17u838d");
    			add_location(p5, file$o, 98, 6, 2987);
    			attr_dev(div5, "class", "toggler svelte-17u838d");
    			add_location(div5, file$o, 93, 4, 2785);
    			attr_dev(i12, "class", "far svelte-17u838d");
    			toggle_class(i12, "fa-star", !/*skillsr*/ ctx[6]);
    			add_location(i12, file$o, 102, 8, 3114);
    			attr_dev(i13, "class", "fas svelte-17u838d");
    			toggle_class(i13, "fa-star", /*skillsr*/ ctx[6]);
    			add_location(i13, file$o, 103, 8, 3166);
    			attr_dev(span6, "class", "skillsr svelte-17u838d");
    			add_location(span6, file$o, 101, 6, 3045);
    			attr_dev(p6, "class", "svelte-17u838d");
    			add_location(p6, file$o, 105, 6, 3230);
    			attr_dev(div6, "class", "toggler svelte-17u838d");
    			add_location(div6, file$o, 100, 4, 3016);
    			attr_dev(i14, "class", "far svelte-17u838d");
    			toggle_class(i14, "fa-star", !/*work*/ ctx[7]);
    			add_location(i14, file$o, 112, 8, 3401);
    			attr_dev(i15, "class", "fas svelte-17u838d");
    			toggle_class(i15, "fa-star", /*work*/ ctx[7]);
    			add_location(i15, file$o, 113, 8, 3450);
    			attr_dev(span7, "class", "work-experience svelte-17u838d");
    			add_location(span7, file$o, 108, 6, 3290);
    			attr_dev(p7, "class", "svelte-17u838d");
    			add_location(p7, file$o, 115, 6, 3511);
    			attr_dev(div7, "class", "toggler svelte-17u838d");
    			add_location(div7, file$o, 107, 4, 3261);
    			attr_dev(i16, "class", "far svelte-17u838d");
    			toggle_class(i16, "fa-star", !/*education*/ ctx[8]);
    			add_location(i16, file$o, 119, 8, 3653);
    			attr_dev(i17, "class", "fas svelte-17u838d");
    			toggle_class(i17, "fa-star", /*education*/ ctx[8]);
    			add_location(i17, file$o, 120, 8, 3707);
    			attr_dev(span8, "class", "education svelte-17u838d");
    			add_location(span8, file$o, 118, 6, 3580);
    			attr_dev(p8, "class", "svelte-17u838d");
    			add_location(p8, file$o, 122, 6, 3773);
    			attr_dev(div8, "class", "toggler svelte-17u838d");
    			add_location(div8, file$o, 117, 4, 3551);
    			attr_dev(i18, "class", "far svelte-17u838d");
    			toggle_class(i18, "fa-star", !/*certifications*/ ctx[9]);
    			add_location(i18, file$o, 126, 8, 3919);
    			attr_dev(i19, "class", "fas svelte-17u838d");
    			toggle_class(i19, "fa-star", /*certifications*/ ctx[9]);
    			add_location(i19, file$o, 127, 8, 3978);
    			attr_dev(span9, "class", "certifications svelte-17u838d");
    			add_location(span9, file$o, 125, 6, 3836);
    			attr_dev(p9, "class", "svelte-17u838d");
    			add_location(p9, file$o, 129, 6, 4049);
    			attr_dev(div9, "class", "toggler svelte-17u838d");
    			add_location(div9, file$o, 124, 4, 3807);
    			attr_dev(i20, "class", "far svelte-17u838d");
    			toggle_class(i20, "fa-star", !/*projects*/ ctx[10]);
    			add_location(i20, file$o, 133, 8, 4188);
    			attr_dev(i21, "class", "fas svelte-17u838d");
    			toggle_class(i21, "fa-star", /*projects*/ ctx[10]);
    			add_location(i21, file$o, 134, 8, 4241);
    			attr_dev(span10, "class", "projects svelte-17u838d");
    			add_location(span10, file$o, 132, 6, 4117);
    			attr_dev(p10, "class", "svelte-17u838d");
    			add_location(p10, file$o, 136, 6, 4306);
    			attr_dev(div10, "class", "toggler svelte-17u838d");
    			add_location(div10, file$o, 131, 4, 4088);
    			attr_dev(i22, "class", "far svelte-17u838d");
    			toggle_class(i22, "fa-star", !/*achievements*/ ctx[11]);
    			add_location(i22, file$o, 140, 8, 4447);
    			attr_dev(i23, "class", "fas svelte-17u838d");
    			toggle_class(i23, "fa-star", /*achievements*/ ctx[11]);
    			add_location(i23, file$o, 141, 8, 4504);
    			attr_dev(span11, "class", "achievements svelte-17u838d");
    			add_location(span11, file$o, 139, 6, 4368);
    			attr_dev(p11, "class", "svelte-17u838d");
    			add_location(p11, file$o, 143, 6, 4573);
    			attr_dev(div11, "class", "toggler svelte-17u838d");
    			add_location(div11, file$o, 138, 4, 4339);
    			attr_dev(i24, "class", "far svelte-17u838d");
    			toggle_class(i24, "fa-star", !/*positions*/ ctx[12]);
    			add_location(i24, file$o, 147, 8, 4712);
    			attr_dev(i25, "class", "fas svelte-17u838d");
    			toggle_class(i25, "fa-star", /*positions*/ ctx[12]);
    			add_location(i25, file$o, 148, 8, 4766);
    			attr_dev(span12, "class", "positions svelte-17u838d");
    			add_location(span12, file$o, 146, 6, 4639);
    			attr_dev(p12, "class", "svelte-17u838d");
    			add_location(p12, file$o, 150, 6, 4832);
    			attr_dev(div12, "class", "toggler svelte-17u838d");
    			add_location(div12, file$o, 145, 4, 4610);
    			attr_dev(div13, "class", "heading svelte-17u838d");
    			add_location(div13, file$o, 56, 2, 1488);
    			attr_dev(h21, "class", "svelte-17u838d");
    			add_location(h21, file$o, 155, 4, 4903);
    			attr_dev(i26, "class", "far svelte-17u838d");
    			toggle_class(i26, "fa-star", !/*skillsl*/ ctx[13]);
    			add_location(i26, file$o, 158, 8, 5022);
    			attr_dev(i27, "class", "fas svelte-17u838d");
    			toggle_class(i27, "fa-star", /*skillsl*/ ctx[13]);
    			add_location(i27, file$o, 159, 8, 5074);
    			attr_dev(span13, "class", "skillsl svelte-17u838d");
    			add_location(span13, file$o, 157, 6, 4953);
    			attr_dev(p13, "class", "svelte-17u838d");
    			add_location(p13, file$o, 161, 6, 5138);
    			attr_dev(div14, "class", "toggler svelte-17u838d");
    			add_location(div14, file$o, 156, 4, 4924);
    			attr_dev(i28, "class", "far svelte-17u838d");
    			toggle_class(i28, "fa-star", !/*customl*/ ctx[14]);
    			add_location(i28, file$o, 165, 8, 5274);
    			attr_dev(i29, "class", "fas svelte-17u838d");
    			toggle_class(i29, "fa-star", /*customl*/ ctx[14]);
    			add_location(i29, file$o, 166, 8, 5326);
    			attr_dev(span14, "class", "customl svelte-17u838d");
    			add_location(span14, file$o, 164, 6, 5205);
    			attr_dev(p14, "class", "svelte-17u838d");
    			add_location(p14, file$o, 168, 6, 5390);
    			attr_dev(div15, "class", "toggler svelte-17u838d");
    			add_location(div15, file$o, 163, 4, 5176);
    			attr_dev(i30, "class", "far svelte-17u838d");
    			toggle_class(i30, "fa-star", !/*customr*/ ctx[15]);
    			add_location(i30, file$o, 172, 8, 5526);
    			attr_dev(i31, "class", "fas svelte-17u838d");
    			toggle_class(i31, "fa-star", /*customr*/ ctx[15]);
    			add_location(i31, file$o, 173, 8, 5578);
    			attr_dev(span15, "class", "customr svelte-17u838d");
    			add_location(span15, file$o, 171, 6, 5457);
    			attr_dev(p15, "class", "svelte-17u838d");
    			add_location(p15, file$o, 175, 6, 5642);
    			attr_dev(div16, "class", "toggler svelte-17u838d");
    			add_location(div16, file$o, 170, 4, 5428);
    			attr_dev(div17, "class", "heading svelte-17u838d");
    			add_location(div17, file$o, 154, 2, 4876);
    			attr_dev(div18, "class", "menu svelte-17u838d");
    			add_location(div18, file$o, 55, 0, 1466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div13);
    			append_dev(div13, h20);
    			append_dev(div13, t1);
    			append_dev(div13, div0);
    			append_dev(div0, span0);
    			append_dev(span0, i0);
    			append_dev(span0, t2);
    			append_dev(span0, i1);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div13, t5);
    			append_dev(div13, div1);
    			append_dev(div1, span1);
    			append_dev(span1, i2);
    			append_dev(span1, t6);
    			append_dev(span1, i3);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(div13, t9);
    			append_dev(div13, div2);
    			append_dev(div2, span2);
    			append_dev(span2, i4);
    			append_dev(span2, t10);
    			append_dev(span2, i5);
    			append_dev(div2, t11);
    			append_dev(div2, p2);
    			append_dev(div13, t13);
    			append_dev(div13, div3);
    			append_dev(div3, span3);
    			append_dev(span3, i6);
    			append_dev(span3, t14);
    			append_dev(span3, i7);
    			append_dev(div3, t15);
    			append_dev(div3, p3);
    			append_dev(div13, t17);
    			append_dev(div13, div4);
    			append_dev(div4, span4);
    			append_dev(span4, i8);
    			append_dev(span4, t18);
    			append_dev(span4, i9);
    			append_dev(div4, t19);
    			append_dev(div4, p4);
    			append_dev(div13, t21);
    			append_dev(div13, div5);
    			append_dev(div5, span5);
    			append_dev(span5, i10);
    			append_dev(span5, t22);
    			append_dev(span5, i11);
    			append_dev(div5, t23);
    			append_dev(div5, p5);
    			append_dev(div13, t25);
    			append_dev(div13, div6);
    			append_dev(div6, span6);
    			append_dev(span6, i12);
    			append_dev(span6, t26);
    			append_dev(span6, i13);
    			append_dev(div6, t27);
    			append_dev(div6, p6);
    			append_dev(div13, t29);
    			append_dev(div13, div7);
    			append_dev(div7, span7);
    			append_dev(span7, i14);
    			append_dev(span7, t30);
    			append_dev(span7, i15);
    			append_dev(div7, t31);
    			append_dev(div7, p7);
    			append_dev(div13, t33);
    			append_dev(div13, div8);
    			append_dev(div8, span8);
    			append_dev(span8, i16);
    			append_dev(span8, t34);
    			append_dev(span8, i17);
    			append_dev(div8, t35);
    			append_dev(div8, p8);
    			append_dev(div13, t37);
    			append_dev(div13, div9);
    			append_dev(div9, span9);
    			append_dev(span9, i18);
    			append_dev(span9, t38);
    			append_dev(span9, i19);
    			append_dev(div9, t39);
    			append_dev(div9, p9);
    			append_dev(div13, t41);
    			append_dev(div13, div10);
    			append_dev(div10, span10);
    			append_dev(span10, i20);
    			append_dev(span10, t42);
    			append_dev(span10, i21);
    			append_dev(div10, t43);
    			append_dev(div10, p10);
    			append_dev(div13, t45);
    			append_dev(div13, div11);
    			append_dev(div11, span11);
    			append_dev(span11, i22);
    			append_dev(span11, t46);
    			append_dev(span11, i23);
    			append_dev(div11, t47);
    			append_dev(div11, p11);
    			append_dev(div13, t49);
    			append_dev(div13, div12);
    			append_dev(div12, span12);
    			append_dev(span12, i24);
    			append_dev(span12, t50);
    			append_dev(span12, i25);
    			append_dev(div12, t51);
    			append_dev(div12, p12);
    			append_dev(div18, t53);
    			append_dev(div18, div17);
    			append_dev(div17, h21);
    			append_dev(div17, t55);
    			append_dev(div17, div14);
    			append_dev(div14, span13);
    			append_dev(span13, i26);
    			append_dev(span13, t56);
    			append_dev(span13, i27);
    			append_dev(div14, t57);
    			append_dev(div14, p13);
    			append_dev(div17, t59);
    			append_dev(div17, div15);
    			append_dev(div15, span14);
    			append_dev(span14, i28);
    			append_dev(span14, t60);
    			append_dev(span14, i29);
    			append_dev(div15, t61);
    			append_dev(div15, p14);
    			append_dev(div17, t63);
    			append_dev(div17, div16);
    			append_dev(div16, span15);
    			append_dev(span15, i30);
    			append_dev(span15, t64);
    			append_dev(span15, i31);
    			append_dev(div16, t65);
    			append_dev(div16, p15);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[17], false, false, false),
    					listen_dev(span1, "click", /*click_handler_1*/ ctx[18], false, false, false),
    					listen_dev(span2, "click", /*click_handler_2*/ ctx[19], false, false, false),
    					listen_dev(span3, "click", /*click_handler_3*/ ctx[20], false, false, false),
    					listen_dev(span4, "click", /*click_handler_4*/ ctx[21], false, false, false),
    					listen_dev(span5, "click", /*click_handler_5*/ ctx[22], false, false, false),
    					listen_dev(span6, "click", /*click_handler_6*/ ctx[23], false, false, false),
    					listen_dev(span7, "click", /*click_handler_7*/ ctx[24], false, false, false),
    					listen_dev(span8, "click", /*click_handler_8*/ ctx[25], false, false, false),
    					listen_dev(span9, "click", /*click_handler_9*/ ctx[26], false, false, false),
    					listen_dev(span10, "click", /*click_handler_10*/ ctx[27], false, false, false),
    					listen_dev(span11, "click", /*click_handler_11*/ ctx[28], false, false, false),
    					listen_dev(span12, "click", /*click_handler_12*/ ctx[29], false, false, false),
    					listen_dev(span13, "click", /*click_handler_13*/ ctx[30], false, false, false),
    					listen_dev(span14, "click", /*click_handler_14*/ ctx[31], false, false, false),
    					listen_dev(span15, "click", /*click_handler_15*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*avatar*/ 1) {
    				toggle_class(i0, "fa-star", !/*avatar*/ ctx[0]);
    			}

    			if (dirty[0] & /*avatar*/ 1) {
    				toggle_class(i1, "fa-star", /*avatar*/ ctx[0]);
    			}

    			if (dirty[0] & /*aboutme*/ 2) {
    				toggle_class(i2, "fa-star", !/*aboutme*/ ctx[1]);
    			}

    			if (dirty[0] & /*aboutme*/ 2) {
    				toggle_class(i3, "fa-star", /*aboutme*/ ctx[1]);
    			}

    			if (dirty[0] & /*interests*/ 4) {
    				toggle_class(i4, "fa-star", !/*interests*/ ctx[2]);
    			}

    			if (dirty[0] & /*interests*/ 4) {
    				toggle_class(i5, "fa-star", /*interests*/ ctx[2]);
    			}

    			if (dirty[0] & /*contact*/ 8) {
    				toggle_class(i6, "fa-star", !/*contact*/ ctx[3]);
    			}

    			if (dirty[0] & /*contact*/ 8) {
    				toggle_class(i7, "fa-star", /*contact*/ ctx[3]);
    			}

    			if (dirty[0] & /*social*/ 16) {
    				toggle_class(i8, "fa-star", !/*social*/ ctx[4]);
    			}

    			if (dirty[0] & /*social*/ 16) {
    				toggle_class(i9, "fa-star", /*social*/ ctx[4]);
    			}

    			if (dirty[0] & /*name*/ 32) {
    				toggle_class(i10, "fa-star", !/*name*/ ctx[5]);
    			}

    			if (dirty[0] & /*name*/ 32) {
    				toggle_class(i11, "fa-star", /*name*/ ctx[5]);
    			}

    			if (dirty[0] & /*skillsr*/ 64) {
    				toggle_class(i12, "fa-star", !/*skillsr*/ ctx[6]);
    			}

    			if (dirty[0] & /*skillsr*/ 64) {
    				toggle_class(i13, "fa-star", /*skillsr*/ ctx[6]);
    			}

    			if (dirty[0] & /*work*/ 128) {
    				toggle_class(i14, "fa-star", !/*work*/ ctx[7]);
    			}

    			if (dirty[0] & /*work*/ 128) {
    				toggle_class(i15, "fa-star", /*work*/ ctx[7]);
    			}

    			if (dirty[0] & /*education*/ 256) {
    				toggle_class(i16, "fa-star", !/*education*/ ctx[8]);
    			}

    			if (dirty[0] & /*education*/ 256) {
    				toggle_class(i17, "fa-star", /*education*/ ctx[8]);
    			}

    			if (dirty[0] & /*certifications*/ 512) {
    				toggle_class(i18, "fa-star", !/*certifications*/ ctx[9]);
    			}

    			if (dirty[0] & /*certifications*/ 512) {
    				toggle_class(i19, "fa-star", /*certifications*/ ctx[9]);
    			}

    			if (dirty[0] & /*projects*/ 1024) {
    				toggle_class(i20, "fa-star", !/*projects*/ ctx[10]);
    			}

    			if (dirty[0] & /*projects*/ 1024) {
    				toggle_class(i21, "fa-star", /*projects*/ ctx[10]);
    			}

    			if (dirty[0] & /*achievements*/ 2048) {
    				toggle_class(i22, "fa-star", !/*achievements*/ ctx[11]);
    			}

    			if (dirty[0] & /*achievements*/ 2048) {
    				toggle_class(i23, "fa-star", /*achievements*/ ctx[11]);
    			}

    			if (dirty[0] & /*positions*/ 4096) {
    				toggle_class(i24, "fa-star", !/*positions*/ ctx[12]);
    			}

    			if (dirty[0] & /*positions*/ 4096) {
    				toggle_class(i25, "fa-star", /*positions*/ ctx[12]);
    			}

    			if (dirty[0] & /*skillsl*/ 8192) {
    				toggle_class(i26, "fa-star", !/*skillsl*/ ctx[13]);
    			}

    			if (dirty[0] & /*skillsl*/ 8192) {
    				toggle_class(i27, "fa-star", /*skillsl*/ ctx[13]);
    			}

    			if (dirty[0] & /*customl*/ 16384) {
    				toggle_class(i28, "fa-star", !/*customl*/ ctx[14]);
    			}

    			if (dirty[0] & /*customl*/ 16384) {
    				toggle_class(i29, "fa-star", /*customl*/ ctx[14]);
    			}

    			if (dirty[0] & /*customr*/ 32768) {
    				toggle_class(i30, "fa-star", !/*customr*/ ctx[15]);
    			}

    			if (dirty[0] & /*customr*/ 32768) {
    				toggle_class(i31, "fa-star", /*customr*/ ctx[15]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div18);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);

    	let { avatar } = $$props,
    		{ aboutme } = $$props,
    		{ interests } = $$props,
    		{ contact } = $$props,
    		{ social } = $$props,
    		{ name } = $$props,
    		{ skillsr } = $$props,
    		{ work } = $$props,
    		{ education } = $$props,
    		{ certifications } = $$props,
    		{ projects } = $$props,
    		{ achievements } = $$props,
    		{ positions } = $$props,
    		{ skillsl } = $$props,
    		{ customl } = $$props,
    		{ customr } = $$props;

    	const setState = classname => {
    		if (classname == "avatar") {
    			$$invalidate(0, avatar = !avatar);
    		} else if (classname == "aboutme") {
    			$$invalidate(1, aboutme = !aboutme);
    		} else if (classname == "interests") {
    			$$invalidate(2, interests = !interests);
    		} else if (classname == "contact") {
    			$$invalidate(3, contact = !contact);
    		} else if (classname == "social-media") {
    			$$invalidate(4, social = !social);
    		} else if (classname == "name") {
    			$$invalidate(5, name = !name);
    		} else if (classname == "skillsr") {
    			$$invalidate(6, skillsr = !skillsr);
    		} else if (classname == "work-experience") {
    			$$invalidate(7, work = !work);
    		} else if (classname == "education") {
    			$$invalidate(8, education = !education);
    		} else if (classname == "certifications") {
    			$$invalidate(9, certifications = !certifications);
    		} else if (classname == "projects") {
    			$$invalidate(10, projects = !projects);
    		} else if (classname == "achievements") {
    			$$invalidate(11, achievements = !achievements);
    		} else if (classname == "positions") {
    			$$invalidate(12, positions = !positions);
    		} else if (classname == "skillsl") {
    			$$invalidate(13, skillsl = !skillsl);
    		} else if (classname == "customl") {
    			$$invalidate(14, customl = !customl);
    		} else if (classname == "customr") {
    			$$invalidate(15, customr = !customr);
    		}
    	};

    	const writable_props = [
    		"avatar",
    		"aboutme",
    		"interests",
    		"contact",
    		"social",
    		"name",
    		"skillsr",
    		"work",
    		"education",
    		"certifications",
    		"projects",
    		"achievements",
    		"positions",
    		"skillsl",
    		"customl",
    		"customr"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setState("avatar");
    	const click_handler_1 = () => setState("aboutme");
    	const click_handler_2 = () => setState("interests");
    	const click_handler_3 = () => setState("contact");
    	const click_handler_4 = () => setState("social-media");
    	const click_handler_5 = () => setState("name");
    	const click_handler_6 = () => setState("skillsr");
    	const click_handler_7 = () => setState("work-experience");
    	const click_handler_8 = () => setState("education");
    	const click_handler_9 = () => setState("certifications");
    	const click_handler_10 = () => setState("projects");
    	const click_handler_11 = () => setState("achievements");
    	const click_handler_12 = () => setState("positions");
    	const click_handler_13 = () => setState("skillsl");
    	const click_handler_14 = () => setState("customl");
    	const click_handler_15 = () => setState("customr");

    	$$self.$$set = $$props => {
    		if ("avatar" in $$props) $$invalidate(0, avatar = $$props.avatar);
    		if ("aboutme" in $$props) $$invalidate(1, aboutme = $$props.aboutme);
    		if ("interests" in $$props) $$invalidate(2, interests = $$props.interests);
    		if ("contact" in $$props) $$invalidate(3, contact = $$props.contact);
    		if ("social" in $$props) $$invalidate(4, social = $$props.social);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("skillsr" in $$props) $$invalidate(6, skillsr = $$props.skillsr);
    		if ("work" in $$props) $$invalidate(7, work = $$props.work);
    		if ("education" in $$props) $$invalidate(8, education = $$props.education);
    		if ("certifications" in $$props) $$invalidate(9, certifications = $$props.certifications);
    		if ("projects" in $$props) $$invalidate(10, projects = $$props.projects);
    		if ("achievements" in $$props) $$invalidate(11, achievements = $$props.achievements);
    		if ("positions" in $$props) $$invalidate(12, positions = $$props.positions);
    		if ("skillsl" in $$props) $$invalidate(13, skillsl = $$props.skillsl);
    		if ("customl" in $$props) $$invalidate(14, customl = $$props.customl);
    		if ("customr" in $$props) $$invalidate(15, customr = $$props.customr);
    	};

    	$$self.$capture_state = () => ({
    		avatar,
    		aboutme,
    		interests,
    		contact,
    		social,
    		name,
    		skillsr,
    		work,
    		education,
    		certifications,
    		projects,
    		achievements,
    		positions,
    		skillsl,
    		customl,
    		customr,
    		setState
    	});

    	$$self.$inject_state = $$props => {
    		if ("avatar" in $$props) $$invalidate(0, avatar = $$props.avatar);
    		if ("aboutme" in $$props) $$invalidate(1, aboutme = $$props.aboutme);
    		if ("interests" in $$props) $$invalidate(2, interests = $$props.interests);
    		if ("contact" in $$props) $$invalidate(3, contact = $$props.contact);
    		if ("social" in $$props) $$invalidate(4, social = $$props.social);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("skillsr" in $$props) $$invalidate(6, skillsr = $$props.skillsr);
    		if ("work" in $$props) $$invalidate(7, work = $$props.work);
    		if ("education" in $$props) $$invalidate(8, education = $$props.education);
    		if ("certifications" in $$props) $$invalidate(9, certifications = $$props.certifications);
    		if ("projects" in $$props) $$invalidate(10, projects = $$props.projects);
    		if ("achievements" in $$props) $$invalidate(11, achievements = $$props.achievements);
    		if ("positions" in $$props) $$invalidate(12, positions = $$props.positions);
    		if ("skillsl" in $$props) $$invalidate(13, skillsl = $$props.skillsl);
    		if ("customl" in $$props) $$invalidate(14, customl = $$props.customl);
    		if ("customr" in $$props) $$invalidate(15, customr = $$props.customr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		avatar,
    		aboutme,
    		interests,
    		contact,
    		social,
    		name,
    		skillsr,
    		work,
    		education,
    		certifications,
    		projects,
    		achievements,
    		positions,
    		skillsl,
    		customl,
    		customr,
    		setState,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$o,
    			create_fragment$o,
    			safe_not_equal,
    			{
    				avatar: 0,
    				aboutme: 1,
    				interests: 2,
    				contact: 3,
    				social: 4,
    				name: 5,
    				skillsr: 6,
    				work: 7,
    				education: 8,
    				certifications: 9,
    				projects: 10,
    				achievements: 11,
    				positions: 12,
    				skillsl: 13,
    				customl: 14,
    				customr: 15
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*avatar*/ ctx[0] === undefined && !("avatar" in props)) {
    			console.warn("<Menu> was created without expected prop 'avatar'");
    		}

    		if (/*aboutme*/ ctx[1] === undefined && !("aboutme" in props)) {
    			console.warn("<Menu> was created without expected prop 'aboutme'");
    		}

    		if (/*interests*/ ctx[2] === undefined && !("interests" in props)) {
    			console.warn("<Menu> was created without expected prop 'interests'");
    		}

    		if (/*contact*/ ctx[3] === undefined && !("contact" in props)) {
    			console.warn("<Menu> was created without expected prop 'contact'");
    		}

    		if (/*social*/ ctx[4] === undefined && !("social" in props)) {
    			console.warn("<Menu> was created without expected prop 'social'");
    		}

    		if (/*name*/ ctx[5] === undefined && !("name" in props)) {
    			console.warn("<Menu> was created without expected prop 'name'");
    		}

    		if (/*skillsr*/ ctx[6] === undefined && !("skillsr" in props)) {
    			console.warn("<Menu> was created without expected prop 'skillsr'");
    		}

    		if (/*work*/ ctx[7] === undefined && !("work" in props)) {
    			console.warn("<Menu> was created without expected prop 'work'");
    		}

    		if (/*education*/ ctx[8] === undefined && !("education" in props)) {
    			console.warn("<Menu> was created without expected prop 'education'");
    		}

    		if (/*certifications*/ ctx[9] === undefined && !("certifications" in props)) {
    			console.warn("<Menu> was created without expected prop 'certifications'");
    		}

    		if (/*projects*/ ctx[10] === undefined && !("projects" in props)) {
    			console.warn("<Menu> was created without expected prop 'projects'");
    		}

    		if (/*achievements*/ ctx[11] === undefined && !("achievements" in props)) {
    			console.warn("<Menu> was created without expected prop 'achievements'");
    		}

    		if (/*positions*/ ctx[12] === undefined && !("positions" in props)) {
    			console.warn("<Menu> was created without expected prop 'positions'");
    		}

    		if (/*skillsl*/ ctx[13] === undefined && !("skillsl" in props)) {
    			console.warn("<Menu> was created without expected prop 'skillsl'");
    		}

    		if (/*customl*/ ctx[14] === undefined && !("customl" in props)) {
    			console.warn("<Menu> was created without expected prop 'customl'");
    		}

    		if (/*customr*/ ctx[15] === undefined && !("customr" in props)) {
    			console.warn("<Menu> was created without expected prop 'customr'");
    		}
    	}

    	get avatar() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatar(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aboutme() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aboutme(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get interests() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set interests(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contact() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contact(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get social() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set social(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skillsr() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skillsr(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get work() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set work(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get education() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set education(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get certifications() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set certifications(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projects() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get achievements() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set achievements(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get positions() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set positions(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skillsl() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skillsl(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customl() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customl(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customr() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customr(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Avatar\Avatar.svelte generated by Svelte v3.38.2 */

    const file$n = "src\\components\\Avatar\\Avatar.svelte";

    // (25:2) {:else}
    function create_else_block$5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "avatar svelte-mlewxt");
    			if (img.src !== (img_src_value = "../images/avatar.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$n, 25, 4, 546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(25:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if avatar}
    function create_if_block$6(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "avatar svelte-mlewxt");
    			if (img.src !== (img_src_value = /*avatar*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$n, 23, 4, 487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*avatar*/ 1 && img.src !== (img_src_value = /*avatar*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(23:2) {#if avatar}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*avatar*/ ctx[0]) return create_if_block$6;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			input = element("input");
    			attr_dev(div0, "class", "image-border svelte-mlewxt");
    			set_style(div0, "margin-left", "-25px");
    			add_location(div0, file$n, 19, 2, 350);
    			attr_dev(div1, "class", "image-border svelte-mlewxt");
    			set_style(div1, "margin-left", "25px");
    			add_location(div1, file$n, 20, 2, 409);
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".jpg, .jpeg, .png");
    			add_location(input, file$n, 27, 2, 615);
    			attr_dev(div2, "class", "profile svelte-mlewxt");
    			add_location(div2, file$n, 13, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t1);
    			if_block.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[4](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[3], false, false, false),
    					listen_dev(div2, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, t2);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    			/*input_binding*/ ctx[4](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Avatar", slots, []);
    	let avatar, fileinput;

    	const onFileSelected = e => {
    		let image = e.target.files[0];
    		let reader = new FileReader();
    		reader.readAsDataURL(image);

    		reader.onload = e => {
    			$$invalidate(0, avatar = e.target.result);
    		};
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Avatar> was created with unknown prop '${key}'`);
    	});

    	const change_handler = e => onFileSelected(e);

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			fileinput = $$value;
    			$$invalidate(1, fileinput);
    		});
    	}

    	const click_handler = () => {
    		fileinput.click();
    	};

    	$$self.$capture_state = () => ({ avatar, fileinput, onFileSelected });

    	$$self.$inject_state = $$props => {
    		if ("avatar" in $$props) $$invalidate(0, avatar = $$props.avatar);
    		if ("fileinput" in $$props) $$invalidate(1, fileinput = $$props.fileinput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		avatar,
    		fileinput,
    		onFileSelected,
    		change_handler,
    		input_binding,
    		click_handler
    	];
    }

    class Avatar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Avatar",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\components\Lines\LineX\LineXL.svelte generated by Svelte v3.38.2 */

    const file$m = "src\\components\\Lines\\LineX\\LineXL.svelte";

    function create_fragment$m(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line svelte-gg19f");
    			add_location(div0, file$m, 4, 2, 47);
    			attr_dev(div1, "class", "progress-line svelte-gg19f");
    			add_location(div1, file$m, 5, 2, 71);
    			attr_dev(div2, "class", "line-x svelte-gg19f");
    			add_location(div2, file$m, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineXL", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LineXL> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LineXL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineXL",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\components\About\About.svelte generated by Svelte v3.38.2 */
    const file$l = "src\\components\\About\\About.svelte";

    function create_fragment$l(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let linex;
    	let t2;
    	let p;
    	let current;
    	linex = new LineXL({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "ABOUT ME";
    			t1 = space();
    			create_component(linex.$$.fragment);
    			t2 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus porro in\r\n    recusandae blanditiis nobis cum iste totam explicabo repudiandae, eum est,\r\n    fugiat deserunt odit dolorem ea harum eius exercitationem. Quam. Lorem ipsum\r\n    dolor sit amet consectetur adipisicing elit.";
    			attr_dev(h2, "class", "svelte-1ecrfbw");
    			add_location(h2, file$l, 5, 2, 125);
    			add_location(p, file$l, 7, 2, 159);
    			attr_dev(div, "contenteditable", "true");
    			attr_dev(div, "class", "about-me svelte-1ecrfbw");
    			add_location(div, file$l, 4, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			mount_component(linex, div, null);
    			append_dev(div, t2);
    			append_dev(div, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(linex);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LineX: LineXL });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\components\Others\Component4.svelte generated by Svelte v3.38.2 */

    const file$k = "src\\components\\Others\\Component4.svelte";

    // (41:0) {:else}
    function create_else_block_1(ctx) {
    	let div1;
    	let i;
    	let i_class_value;
    	let t0;
    	let div0;
    	let p;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			i = element("i");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "LOREM";
    			t2 = space();
    			input = element("input");
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*display*/ ctx[0]) + " svelte-ofuyll"));
    			add_location(i, file$k, 42, 4, 1198);
    			set_style(p, "color", "#fff");
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 44, 6, 1276);
    			attr_dev(input, "class", "url svelte-ofuyll");
    			set_style(input, "display", /*state*/ ctx[3]);
    			add_location(input, file$k, 45, 6, 1316);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$k, 43, 4, 1245);
    			attr_dev(div1, "class", "details svelte-ofuyll");
    			add_location(div1, file$k, 41, 2, 1171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t2);
    			append_dev(div0, input);
    			set_input_value(input, /*display*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i, "click", /*setState*/ ctx[6], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*display*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*display*/ ctx[0]) + " svelte-ofuyll"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*state*/ 8) {
    				set_style(input, "display", /*state*/ ctx[3]);
    			}

    			if (dirty & /*display*/ 1 && input.value !== /*display*/ ctx[0]) {
    				set_input_value(input, /*display*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(41:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:28) 
    function create_if_block_1$3(ctx) {
    	let div1;
    	let i;
    	let i_class_value;
    	let t0;
    	let div0;
    	let p;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*title*/ ctx[2] == "Location") return create_if_block_2$1;
    		if (/*title*/ ctx[2] == "Phone") return create_if_block_3$1;
    		if (/*title*/ ctx[2] == "Email") return create_if_block_4$1;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			i = element("i");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text(/*title*/ ctx[2]);
    			t2 = space();
    			if_block.c();
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*display*/ ctx[0]) + " svelte-ofuyll"));
    			add_location(i, file$k, 25, 4, 700);
    			set_style(p, "color", "#fff");
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 27, 6, 778);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$k, 26, 4, 747);
    			attr_dev(div1, "class", "details svelte-ofuyll");
    			add_location(div1, file$k, 24, 2, 673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(div0, t2);
    			if_block.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*setState*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*display*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*display*/ ctx[0]) + " svelte-ofuyll"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*title*/ 4) set_data_dev(t1, /*title*/ ctx[2]);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(24:28) ",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if type == "social"}
    function create_if_block$5(ctx) {
    	let div1;
    	let i;
    	let i_class_value;
    	let t0;
    	let div0;
    	let input0;
    	let t1;
    	let a;
    	let t2;
    	let t3;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			i = element("i");
    			t0 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t1 = space();
    			a = element("a");
    			t2 = text("lorem");
    			t3 = space();
    			input1 = element("input");
    			attr_dev(i, "class", i_class_value = "fab fa-" + /*icon*/ ctx[4] + " svelte-ofuyll");
    			add_location(i, file$k, 16, 4, 365);
    			attr_dev(input0, "class", "svelte-ofuyll");
    			add_location(input0, file$k, 18, 6, 449);
    			attr_dev(a, "href", /*url*/ ctx[5]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-ofuyll");
    			add_location(a, file$k, 19, 6, 487);
    			attr_dev(input1, "class", "url svelte-ofuyll");
    			set_style(input1, "display", /*state*/ ctx[3]);
    			add_location(input1, file$k, 20, 6, 554);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$k, 17, 4, 418);
    			attr_dev(div1, "class", "details svelte-ofuyll");
    			add_location(div1, file$k, 15, 2, 338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*display*/ ctx[0]);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, t2);
    			append_dev(div0, t3);
    			append_dev(div0, input1);
    			set_input_value(input1, /*url*/ ctx[5]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i, "click", /*setState*/ ctx[6], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(a, "click", /*setState*/ ctx[6], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 16 && i_class_value !== (i_class_value = "fab fa-" + /*icon*/ ctx[4] + " svelte-ofuyll")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*display*/ 1 && input0.value !== /*display*/ ctx[0]) {
    				set_input_value(input0, /*display*/ ctx[0]);
    			}

    			if (dirty & /*url*/ 32) {
    				attr_dev(a, "href", /*url*/ ctx[5]);
    			}

    			if (dirty & /*state*/ 8) {
    				set_style(input1, "display", /*state*/ ctx[3]);
    			}

    			if (dirty & /*url*/ 32 && input1.value !== /*url*/ ctx[5]) {
    				set_input_value(input1, /*url*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(15:0) {#if type == \\\"social\\\"}",
    		ctx
    	});

    	return block;
    }

    // (35:6) {:else}
    function create_else_block$4(ctx) {
    	let p;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Ipsum";
    			t1 = space();
    			input = element("input");
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 35, 8, 1034);
    			attr_dev(input, "class", "url svelte-ofuyll");
    			set_style(input, "display", /*state*/ ctx[3]);
    			add_location(input, file$k, 36, 8, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*display*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*state*/ 8) {
    				set_style(input, "display", /*state*/ ctx[3]);
    			}

    			if (dirty & /*display*/ 1 && input.value !== /*display*/ ctx[0]) {
    				set_input_value(input, /*display*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(35:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:33) 
    function create_if_block_4$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "lorem@ipsum.com";
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 33, 8, 987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(33:33) ",
    		ctx
    	});

    	return block;
    }

    // (31:33) 
    function create_if_block_3$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "+XX XXX-XXXX-XXX";
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 31, 8, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(31:33) ",
    		ctx
    	});

    	return block;
    }

    // (29:6) {#if title == "Location"}
    function create_if_block_2$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem, Ipsum";
    			attr_dev(p, "class", "svelte-ofuyll");
    			add_location(p, file$k, 29, 8, 855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(29:6) {#if title == \\\"Location\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] == "social") return create_if_block$5;
    		if (/*type*/ ctx[1] == "contact") return create_if_block_1$3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component4", slots, []);
    	let { display } = $$props, { type } = $$props, { title } = $$props;
    	let state = "none", icon = "fas fa-question", url = "url including http/https";

    	const setState = () => {
    		state == "none"
    		? $$invalidate(3, state = "inherit")
    		: $$invalidate(3, state = "none");
    	};

    	const writable_props = ["display", "type", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Component4> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		display = this.value;
    		$$invalidate(0, display);
    	}

    	function input1_input_handler() {
    		url = this.value;
    		$$invalidate(5, url);
    	}

    	function input_input_handler() {
    		display = this.value;
    		$$invalidate(0, display);
    	}

    	function input_input_handler_1() {
    		display = this.value;
    		$$invalidate(0, display);
    	}

    	$$self.$$set = $$props => {
    		if ("display" in $$props) $$invalidate(0, display = $$props.display);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		display,
    		type,
    		title,
    		state,
    		icon,
    		url,
    		setState
    	});

    	$$self.$inject_state = $$props => {
    		if ("display" in $$props) $$invalidate(0, display = $$props.display);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("state" in $$props) $$invalidate(3, state = $$props.state);
    		if ("icon" in $$props) $$invalidate(4, icon = $$props.icon);
    		if ("url" in $$props) $$invalidate(5, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*display*/ 1) {
    			$$invalidate(4, icon = display.toLowerCase().replaceAll(" ", "-"));
    		}
    	};

    	return [
    		display,
    		type,
    		title,
    		state,
    		icon,
    		url,
    		setState,
    		input0_input_handler,
    		input1_input_handler,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Component4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { display: 0, type: 1, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component4",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*display*/ ctx[0] === undefined && !("display" in props)) {
    			console.warn("<Component4> was created without expected prop 'display'");
    		}

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<Component4> was created without expected prop 'type'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console.warn("<Component4> was created without expected prop 'title'");
    		}
    	}

    	get display() {
    		throw new Error("<Component4>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set display(value) {
    		throw new Error("<Component4>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Component4>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Component4>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Component4>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Component4>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Interests\Interests.svelte generated by Svelte v3.38.2 */
    const file$j = "src\\components\\Interests\\Interests.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (54:4) {#each array as item}
    function create_each_block$c(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return {
    			props: {
    				display: "fas fa-question",
    				type: "",
    				title: ""
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(54:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXL({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("INTERESTS ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-ai4zyr");
    			add_location(i0, file$j, 38, 14, 812);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-ai4zyr");
    			add_location(i1, file$j, 44, 4, 993);
    			attr_dev(h2, "class", "svelte-ai4zyr");
    			add_location(h2, file$j, 37, 2, 792);
    			attr_dev(div0, "class", "interest");
    			add_location(div0, file$j, 52, 2, 1198);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "interests svelte-ai4zyr");
    			add_location(div1, file$j, 36, 0, 742);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-ai4zyr")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-ai4zyr")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Interests", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [Component4, Component4, Component4];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component4]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Interests> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXL,
    		Component: Component4,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Interests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Interests",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\components\Contact\Contact.svelte generated by Svelte v3.38.2 */
    const file$i = "src\\components\\Contact\\Contact.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (65:4) {#each array as item}
    function create_each_block$b(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				title: /*item*/ ctx[11].title,
    				display: /*item*/ ctx[11].display,
    				type: "contact"
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*array*/ 4) switch_instance_changes.title = /*item*/ ctx[11].title;
    			if (dirty & /*array*/ 4) switch_instance_changes.display = /*item*/ ctx[11].display;

    			if (switch_value !== (switch_value = /*item*/ ctx[11].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(65:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXL({ $$inline: true });
    	let each_value = /*array*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("CONTACT ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[0] + " svelte-swtyi9");
    			add_location(i0, file$i, 49, 12, 1136);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[1] + " svelte-swtyi9");
    			add_location(i1, file$i, 55, 4, 1317);
    			attr_dev(h2, "class", "svelte-swtyi9");
    			add_location(h2, file$i, 48, 2, 1118);
    			attr_dev(div0, "class", "contact-details");
    			add_location(div0, file$i, 63, 2, 1522);
    			attr_dev(div1, "contenteditable", "true");
    			attr_dev(div1, "class", "contact svelte-swtyi9");
    			add_location(div1, file$i, 47, 0, 1070);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[6], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[4], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[8], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 1 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[0] + " svelte-swtyi9")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 2 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[1] + " svelte-swtyi9")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 4) {
    				each_value = /*array*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [
    			{
    				component: Component4,
    				display: "fas fa-map-marker-alt",
    				title: "Location"
    			},
    			{
    				component: Component4,
    				display: "fas fa-phone",
    				title: "Phone"
    			},
    			{
    				component: Component4,
    				display: "fas fa-envelope",
    				title: "Email"
    			}
    		];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			bool = !bool;

    			if (num == 1) {
    				$$invalidate(0, statei1 = "");
    			} else {
    				$$invalidate(1, statei2 = "");
    			}
    		} else {
    			bool = !bool;

    			if (num == 1) {
    				$$invalidate(0, statei1 = "-square");
    			} else {
    				$$invalidate(1, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(2, array = [
    			...array,
    			{
    				component: Component4,
    				display: "fas fa-question",
    				title: "Lorem"
    			}
    		]);
    	};

    	const removeElement = () => {
    		$$invalidate(2, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXL,
    		Component: Component4,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) bool = $$props.bool;
    		if ("statei1" in $$props) $$invalidate(0, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(1, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(2, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\components\Social\Social.svelte generated by Svelte v3.38.2 */
    const file$h = "src\\components\\Social\\Social.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (57:4) {#each array as item}
    function create_each_block$a(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				display: /*item*/ ctx[11].display,
    				type: "social",
    				title: ""
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*array*/ 8) switch_instance_changes.display = /*item*/ ctx[11].display;

    			if (switch_value !== (switch_value = /*item*/ ctx[11].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(57:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXL({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("SOCIAL ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-15wik7w");
    			add_location(i0, file$h, 41, 11, 929);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-15wik7w");
    			add_location(i1, file$h, 47, 4, 1110);
    			attr_dev(h2, "class", "svelte-15wik7w");
    			add_location(h2, file$h, 40, 2, 912);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$h, 55, 2, 1315);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "social svelte-15wik7w");
    			add_location(div1, file$h, 39, 0, 865);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-15wik7w")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-15wik7w")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Social", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [
    			{
    				component: Component4,
    				display: "LinkedIn"
    			},
    			{ component: Component4, display: "GitHub" }
    		];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [
    			...array,
    			{
    				component: Component4,
    				display: "Stack Overflow"
    			}
    		]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Social> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXL,
    		Component: Component4,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Social extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Social",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\Name\Name.svelte generated by Svelte v3.38.2 */

    const file$g = "src\\components\\Name\\Name.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "LOREM IPSUM";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "DESIGNATION";
    			attr_dev(p0, "class", "svelte-1l5krlc");
    			add_location(p0, file$g, 4, 2, 68);
    			attr_dev(p1, "class", "designation svelte-1l5krlc");
    			add_location(p1, file$g, 5, 2, 90);
    			attr_dev(div, "contenteditable", "true");
    			attr_dev(div, "class", "name svelte-1l5krlc");
    			add_location(div, file$g, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Name", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Name> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Name extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Name",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\Lines\LineX\LineXR.svelte generated by Svelte v3.38.2 */

    const file$f = "src\\components\\Lines\\LineX\\LineXR.svelte";

    function create_fragment$f(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line svelte-1qxx3bd");
    			add_location(div0, file$f, 4, 2, 47);
    			attr_dev(div1, "class", "progress-line svelte-1qxx3bd");
    			add_location(div1, file$f, 5, 2, 71);
    			attr_dev(div2, "class", "line-x svelte-1qxx3bd");
    			add_location(div2, file$f, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineXR", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LineXR> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LineXR extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineXR",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\Skills\SkillsR.svelte generated by Svelte v3.38.2 */
    const file$e = "src\\components\\Skills\\SkillsR.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (65:4) {#each array as item}
    function create_each_block$9(ctx) {
    	let p;
    	let t_value = /*item*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1x7oyq");
    			add_location(p, file$e, 65, 6, 1328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*array*/ 8 && t_value !== (t_value = /*item*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(65:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("SKILLS\r\n    ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1x7oyq");
    			add_location(i0, file$e, 49, 4, 888);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1x7oyq");
    			add_location(i1, file$e, 55, 4, 1069);
    			attr_dev(h2, "class", "svelte-1x7oyq");
    			add_location(h2, file$e, 47, 2, 866);
    			attr_dev(div0, "class", "skill svelte-1x7oyq");
    			add_location(div0, file$e, 63, 2, 1274);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "skills");
    			add_location(div1, file$e, 46, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1x7oyq")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1x7oyq")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SkillsR", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum"
    		];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, "Lorem"]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SkillsR> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class SkillsR extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillsR",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\Lines\LineY\LineY.svelte generated by Svelte v3.38.2 */

    const file$d = "src\\components\\Lines\\LineY\\LineY.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "circle svelte-4ak3c0");
    			add_location(div0, file$d, 4, 2, 47);
    			attr_dev(div1, "class", "line svelte-4ak3c0");
    			add_location(div1, file$d, 5, 2, 73);
    			attr_dev(div2, "class", "line-y svelte-4ak3c0");
    			add_location(div2, file$d, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineY", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LineY> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LineY extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineY",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\Others\Component2.svelte generated by Svelte v3.38.2 */
    const file$c = "src\\components\\Others\\Component2.svelte";

    // (12:2) {:else}
    function create_else_block$3(ctx) {
    	let br;
    	let em;

    	const block = {
    		c: function create() {
    			br = element("br");
    			em = element("em");
    			em.textContent = "20XX - 20XX";
    			add_location(br, file$c, 12, 4, 221);
    			add_location(em, file$c, 12, 10, 227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, em, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(em);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(12:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if month == true}
    function create_if_block_1$2(ctx) {
    	let br;
    	let em;

    	const block = {
    		c: function create() {
    			br = element("br");
    			em = element("em");
    			em.textContent = "Jan 20XX - Dec 20XX";
    			add_location(br, file$c, 10, 4, 170);
    			add_location(em, file$c, 10, 10, 176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, em, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(em);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(10:2) {#if month == true}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if line == true}
    function create_if_block$4(ctx) {
    	let br;
    	let t;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = text(" ");
    			add_location(br, file$c, 25, 6, 566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(25:4) {#if line == true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let liney;
    	let t2;
    	let div;
    	let p1;
    	let t3;
    	let br;
    	let em;
    	let t5;
    	let p2;
    	let t6;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*month*/ ctx[1] == true) return create_if_block_1$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	liney = new LineY({ $$inline: true });
    	let if_block1 = /*line*/ ctx[0] == true && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Lorem Ipsum\r\n  ");
    			if_block0.c();
    			t1 = space();
    			create_component(liney.$$.fragment);
    			t2 = space();
    			div = element("div");
    			p1 = element("p");
    			t3 = text("Lorem Ipsum\r\n    ");
    			br = element("br");
    			em = element("em");
    			em.textContent = "Lorem Ipsum";
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere iste dicta\r\n    mollitia vel ea, laboriosam quia accusantium recusandae!\r\n    ");
    			if (if_block1) if_block1.c();
    			attr_dev(p0, "class", "svelte-10zy88m");
    			add_location(p0, file$c, 7, 0, 123);
    			add_location(br, file$c, 19, 4, 326);
    			add_location(em, file$c, 19, 10, 332);
    			attr_dev(p1, "class", "svelte-10zy88m");
    			add_location(p1, file$c, 17, 2, 300);
    			set_style(p2, "font-size", "12px");
    			attr_dev(p2, "class", "svelte-10zy88m");
    			add_location(p2, file$c, 21, 2, 365);
    			attr_dev(div, "class", "details");
    			add_location(div, file$c, 16, 0, 275);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			if_block0.m(p0, null);
    			insert_dev(target, t1, anchor);
    			mount_component(liney, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, br);
    			append_dev(p1, em);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, t6);
    			if (if_block1) if_block1.m(p2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(p0, null);
    				}
    			}

    			if (/*line*/ ctx[0] == true) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(p2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(liney.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(liney.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if_block0.d();
    			if (detaching) detach_dev(t1);
    			destroy_component(liney, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component2", slots, []);
    	let { line = true } = $$props, { month = true } = $$props;
    	const writable_props = ["line", "month"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Component2> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("line" in $$props) $$invalidate(0, line = $$props.line);
    		if ("month" in $$props) $$invalidate(1, month = $$props.month);
    	};

    	$$self.$capture_state = () => ({ LineY, line, month });

    	$$self.$inject_state = $$props => {
    		if ("line" in $$props) $$invalidate(0, line = $$props.line);
    		if ("month" in $$props) $$invalidate(1, month = $$props.month);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [line, month];
    }

    class Component2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { line: 0, month: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component2",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get line() {
    		throw new Error("<Component2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<Component2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<Component2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Component2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Work\Work.svelte generated by Svelte v3.38.2 */
    const file$b = "src\\components\\Work\\Work.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (61:8) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[12];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(61:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:8) {#if length == index}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[12];

    	function switch_props(ctx) {
    		return { props: { line: "false" }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(59:8) {#if length == index}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#each array as item, index}
    function create_each_block$8(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*length*/ ctx[1] == /*index*/ ctx[14]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "work-details svelte-13bij2f");
    			add_location(div, file$b, 57, 6, 1311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(57:4) {#each array as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("WORK EXPERIENCE ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[2] + " svelte-13bij2f");
    			add_location(i0, file$b, 41, 20, 860);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[3] + " svelte-13bij2f");
    			add_location(i1, file$b, 47, 4, 1041);
    			attr_dev(h2, "class", "svelte-13bij2f");
    			add_location(h2, file$b, 40, 2, 834);
    			attr_dev(div0, "class", "container svelte-13bij2f");
    			add_location(div0, file$b, 55, 2, 1246);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "work-experience");
    			add_location(div1, file$b, 39, 0, 778);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[6], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 4 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[2] + " svelte-13bij2f")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 8 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[3] + " svelte-13bij2f")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array, length*/ 18) {
    				each_value = /*array*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Work", slots, []);

    	let bool = true,
    		length = 1,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [Component2, Component2];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(2, statei1 = "");
    			} else {
    				$$invalidate(3, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(2, statei1 = "-square");
    			} else {
    				$$invalidate(3, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(4, array = [...array, Component2]);
    		$$invalidate(1, length++, length);
    	};

    	const removeElement = () => {
    		$$invalidate(4, array = array.slice(0, -1));
    		$$invalidate(1, length--, length);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component2,
    		bool,
    		length,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("length" in $$props) $$invalidate(1, length = $$props.length);
    		if ("statei1" in $$props) $$invalidate(2, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(3, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(4, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		length,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Education\Education.svelte generated by Svelte v3.38.2 */
    const file$a = "src\\components\\Education\\Education.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (61:8) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[12];

    	function switch_props(ctx) {
    		return {
    			props: { month: "false" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(61:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:8) {#if length == index}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[12];

    	function switch_props(ctx) {
    		return {
    			props: { line: "false", month: "false" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(59:8) {#if length == index}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#each array as item, index}
    function create_each_block$7(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*length*/ ctx[1] == /*index*/ ctx[14]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "education-details svelte-z6ratu");
    			add_location(div, file$a, 57, 6, 1288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(57:4) {#each array as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("EDUCATION ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[2] + " svelte-z6ratu");
    			add_location(i0, file$a, 41, 14, 837);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[3] + " svelte-z6ratu");
    			add_location(i1, file$a, 47, 4, 1018);
    			attr_dev(h2, "class", "svelte-z6ratu");
    			add_location(h2, file$a, 40, 2, 817);
    			attr_dev(div0, "class", "container svelte-z6ratu");
    			add_location(div0, file$a, 55, 2, 1223);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "education");
    			add_location(div1, file$a, 39, 0, 767);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[6], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 4 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[2] + " svelte-z6ratu")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 8 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[3] + " svelte-z6ratu")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array, length*/ 18) {
    				each_value = /*array*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Education", slots, []);

    	let bool = true,
    		length = 0,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [Component2];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(2, statei1 = "");
    			} else {
    				$$invalidate(3, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(2, statei1 = "-square");
    			} else {
    				$$invalidate(3, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(4, array = [...array, Component2]);
    		$$invalidate(1, length++, length);
    	};

    	const removeElement = () => {
    		$$invalidate(4, array = array.slice(0, -1));
    		$$invalidate(1, length--, length);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Education> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component2,
    		bool,
    		length,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("length" in $$props) $$invalidate(1, length = $$props.length);
    		if ("statei1" in $$props) $$invalidate(2, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(3, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(4, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		length,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Education extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Education",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Others\Component3.svelte generated by Svelte v3.38.2 */

    const file$9 = "src\\components\\Others\\Component3.svelte";

    // (26:2) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", "");
    			if (img.src !== (img_src_value = "../images/university.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1gbz37u");
    			add_location(img, file$9, 26, 4, 542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(26:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#if image}
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1gbz37u");
    			add_location(img, file$9, 24, 4, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 2 && img.src !== (img_src_value = /*image*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(24:2) {#if image}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if credential}
    function create_if_block$1(ctx) {
    	let br;
    	let a;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			br = element("br");
    			a = element("a");
    			t0 = text("loremipsumdolor");
    			t1 = space();
    			input = element("input");
    			add_location(br, file$9, 38, 6, 785);
    			attr_dev(a, "href", /*url*/ ctx[3]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 38, 12, 791);
    			attr_dev(input, "class", "url svelte-1gbz37u");
    			set_style(input, "display", /*state*/ ctx[4]);
    			add_location(input, file$9, 40, 6, 876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*url*/ ctx[3]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*setState*/ ctx[6], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*url*/ 8) {
    				attr_dev(a, "href", /*url*/ ctx[3]);
    			}

    			if (dirty & /*state*/ 16) {
    				set_style(input, "display", /*state*/ ctx[4]);
    			}

    			if (dirty & /*url*/ 8 && input.value !== /*url*/ ctx[3]) {
    				set_input_value(input, /*url*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(38:4) {#if credential}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let p;
    	let t1;
    	let br;
    	let em;
    	let t3;
    	let t4;
    	let input;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*image*/ ctx[1]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*credential*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			p = element("p");
    			t1 = text("Lorem Ipsum\r\n    ");
    			br = element("br");
    			em = element("em");
    			em.textContent = "Lorem Ipsum | Jan 20XX - Present";
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			input = element("input");
    			add_location(br, file$9, 36, 4, 708);
    			add_location(em, file$9, 36, 10, 714);
    			attr_dev(p, "class", "svelte-1gbz37u");
    			add_location(p, file$9, 34, 2, 682);
    			attr_dev(div, "class", "container svelte-1gbz37u");
    			add_location(div, file$9, 22, 0, 455);
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".jpg, .jpeg, .png");
    			attr_dev(input, "class", "svelte-1gbz37u");
    			add_location(input, file$9, 45, 0, 970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(p, br);
    			append_dev(p, em);
    			append_dev(p, t3);
    			if (if_block1) if_block1.m(p, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[10](input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*change_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			if (/*credential*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(p, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[10](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component3", slots, []);
    	let { credential } = $$props;
    	let image, fileinput, url = "url including http/https", state = "none";

    	const onFileSelected = e => {
    		let img = e.target.files[0];
    		let reader = new FileReader();
    		reader.readAsDataURL(img);

    		reader.onload = e => {
    			$$invalidate(1, image = e.target.result);
    		};
    	};

    	const setState = () => {
    		state == "none"
    		? $$invalidate(4, state = "inherit")
    		: $$invalidate(4, state = "none");
    	};

    	const writable_props = ["credential"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Component3> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		fileinput.click();
    	};

    	function input_input_handler() {
    		url = this.value;
    		$$invalidate(3, url);
    	}

    	const change_handler = e => onFileSelected(e);

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			fileinput = $$value;
    			$$invalidate(2, fileinput);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("credential" in $$props) $$invalidate(0, credential = $$props.credential);
    	};

    	$$self.$capture_state = () => ({
    		credential,
    		image,
    		fileinput,
    		url,
    		state,
    		onFileSelected,
    		setState
    	});

    	$$self.$inject_state = $$props => {
    		if ("credential" in $$props) $$invalidate(0, credential = $$props.credential);
    		if ("image" in $$props) $$invalidate(1, image = $$props.image);
    		if ("fileinput" in $$props) $$invalidate(2, fileinput = $$props.fileinput);
    		if ("url" in $$props) $$invalidate(3, url = $$props.url);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		credential,
    		image,
    		fileinput,
    		url,
    		state,
    		onFileSelected,
    		setState,
    		click_handler,
    		input_input_handler,
    		change_handler,
    		input_binding
    	];
    }

    class Component3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { credential: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component3",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*credential*/ ctx[0] === undefined && !("credential" in props)) {
    			console.warn("<Component3> was created without expected prop 'credential'");
    		}
    	}

    	get credential() {
    		throw new Error("<Component3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set credential(value) {
    		throw new Error("<Component3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Certifications\Certifications.svelte generated by Svelte v3.38.2 */
    const file$8 = "src\\components\\Certifications\\Certifications.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (56:4) {#each array as item, index}
    function create_each_block$6(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return {
    			props: { credential: true },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "position");
    			add_location(div, file$8, 56, 6, 1292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(56:4) {#each array as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("CERTIFICATIONS ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-19kiyh5");
    			add_location(i0, file$8, 40, 19, 841);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-19kiyh5");
    			add_location(i1, file$8, 46, 4, 1022);
    			attr_dev(h2, "class", "svelte-19kiyh5");
    			add_location(h2, file$8, 39, 2, 816);
    			attr_dev(div0, "class", "container svelte-19kiyh5");
    			add_location(div0, file$8, 54, 2, 1227);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "certifications");
    			add_location(div1, file$8, 38, 0, 761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-19kiyh5")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-19kiyh5")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Certifications", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [Component3, Component3];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component3]);
    		length++;
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    		length--;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Certifications> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component3,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Certifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Certifications",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Others\Component1.svelte generated by Svelte v3.38.2 */

    const file$7 = "src\\components\\Others\\Component1.svelte";

    function create_fragment$7(ctx) {
    	let p0;
    	let t0;
    	let br;
    	let em;
    	let t2;
    	let p1;
    	let t3;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Lorem Ipsum\r\n  ");
    			br = element("br");
    			em = element("em");
    			em.textContent = "Jan 20XX - Dec 20XX";
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere iste dicta\r\n  mollitia vel ea, laboriosam quia accusantium recusandae!");
    			add_location(br, file$7, 7, 2, 124);
    			add_location(em, file$7, 7, 8, 130);
    			set_style(p0, "color", /*color*/ ctx[0]);
    			add_location(p0, file$7, 5, 0, 79);
    			attr_dev(p1, "class", "description svelte-1257rwq");
    			set_style(p1, "font-size", /*size*/ ctx[1]);
    			add_location(p1, file$7, 9, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, br);
    			append_dev(p0, em);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				set_style(p0, "color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 2) {
    				set_style(p1, "font-size", /*size*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component1", slots, []);
    	let { color = "inherit" } = $$props, { size = "inherit" } = $$props;
    	const writable_props = ["color", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Component1> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ color, size });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, size];
    }

    class Component1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { color: 0, size: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component1",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get color() {
    		throw new Error("<Component1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Component1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Component1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Component1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Projects\Projects.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\components\\Projects\\Projects.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (54:4) {#each array as item}
    function create_each_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return { props: { size: "12px" }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(54:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("PROJECTS ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm");
    			add_location(i0, file$6, 38, 13, 799);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm");
    			add_location(i1, file$6, 44, 4, 980);
    			attr_dev(h2, "class", "svelte-1ki46hm");
    			add_location(h2, file$6, 37, 2, 780);
    			attr_dev(div0, "class", "project");
    			add_location(div0, file$6, 52, 2, 1185);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "projects");
    			add_location(div1, file$6, 36, 0, 731);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("Projects", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [Component1, Component1];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component1]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component1,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Achievements\Achievements.svelte generated by Svelte v3.38.2 */
    const file$5 = "src\\components\\Achievements\\Achievements.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (54:4) {#each array as item}
    function create_each_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return { props: { size: "12px" }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(54:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("ACHIEVEMENTS ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm");
    			add_location(i0, file$5, 38, 17, 796);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm");
    			add_location(i1, file$5, 44, 4, 977);
    			attr_dev(h2, "class", "svelte-1ki46hm");
    			add_location(h2, file$5, 37, 2, 773);
    			attr_dev(div0, "class", "achievement");
    			add_location(div0, file$5, 52, 2, 1182);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "achievements");
    			add_location(div1, file$5, 36, 0, 720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Achievements", slots, []);
    	let bool = true, statei1 = "-square", statei2 = "-square", array = [Component1];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component1]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Achievements> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component1,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Achievements extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Achievements",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Positions\Positions.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\components\\Positions\\Positions.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (56:4) {#each array as item, index}
    function create_each_block$3(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "position");
    			add_location(div, file$4, 56, 6, 1289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(56:4) {#each array as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("POSITIONS OF RESPONSIBILITY ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-19kiyh5");
    			add_location(i0, file$4, 40, 32, 838);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-19kiyh5");
    			add_location(i1, file$4, 46, 4, 1019);
    			attr_dev(h2, "class", "svelte-19kiyh5");
    			add_location(h2, file$4, 39, 2, 800);
    			attr_dev(div0, "class", "container svelte-19kiyh5");
    			add_location(div0, file$4, 54, 2, 1224);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "positions");
    			add_location(div1, file$4, 38, 0, 750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-19kiyh5")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-19kiyh5")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Positions", slots, []);
    	let bool = true, statei1 = "-square", statei2 = "-square", array = [Component3];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component3]);
    		length++;
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    		length--;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Positions> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component3,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class Positions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Positions",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Skills\SkillsL.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\components\\Skills\\SkillsL.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (65:4) {#each array as item}
    function create_each_block$2(ctx) {
    	let p;
    	let t_value = /*item*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1bivrfp");
    			add_location(p, file$3, 65, 6, 1328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*array*/ 8 && t_value !== (t_value = /*item*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(65:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXL({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("SKILLS\r\n    ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1bivrfp");
    			add_location(i0, file$3, 49, 4, 888);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1bivrfp");
    			add_location(i1, file$3, 55, 4, 1069);
    			attr_dev(h2, "class", "svelte-1bivrfp");
    			add_location(h2, file$3, 47, 2, 866);
    			attr_dev(div0, "class", "skill svelte-1bivrfp");
    			add_location(div0, file$3, 63, 2, 1274);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "skills");
    			add_location(div1, file$3, 46, 0, 819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1bivrfp")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1bivrfp")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("SkillsL", slots, []);

    	let bool = true,
    		statei1 = "-square",
    		statei2 = "-square",
    		array = [
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum",
    			"Lorem",
    			"Ipsum"
    		];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, "Lorem"]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SkillsL> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXL,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class SkillsL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillsL",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Custom\CustomL.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\Custom\\CustomL.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (54:4) {#each array as item}
    function create_each_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return {
    			props: { color: "#fff", className: "left" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(54:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXL({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("CUSTOM ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-fcqoos");
    			add_location(i0, file$2, 38, 11, 784);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-fcqoos");
    			add_location(i1, file$2, 44, 4, 965);
    			attr_dev(h2, "class", "svelte-fcqoos");
    			add_location(h2, file$2, 37, 2, 767);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$2, 52, 2, 1170);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "custom");
    			add_location(div1, file$2, 36, 0, 720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-fcqoos")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-fcqoos")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("CustomL", slots, []);
    	let bool = true, statei1 = "-square", statei2 = "-square", array = [Component1];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component1]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CustomL> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXL,
    		Component: Component1,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class CustomL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomL",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Custom\CustomR.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\Custom\\CustomR.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (54:4) {#each array as item}
    function create_each_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[11];

    	function switch_props(ctx) {
    		return { props: { size: "12px" }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*item*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:4) {#each array as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let i0;
    	let i0_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let t2;
    	let linex;
    	let t3;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	linex = new LineXR({ $$inline: true });
    	let each_value = /*array*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("CUSTOM ");
    			i0 = element("i");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			create_component(linex.$$.fragment);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm");
    			add_location(i0, file$1, 38, 11, 784);
    			attr_dev(i1, "class", i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm");
    			add_location(i1, file$1, 44, 4, 965);
    			attr_dev(h2, "class", "svelte-1ki46hm");
    			add_location(h2, file$1, 37, 2, 767);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$1, 52, 2, 1170);
    			attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			attr_dev(div1, "class", "custom");
    			add_location(div1, file$1, 36, 0, 720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, i0);
    			append_dev(h2, t1);
    			append_dev(h2, i1);
    			append_dev(div1, t2);
    			mount_component(linex, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(i0, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false),
    					listen_dev(i0, "click", /*addElement*/ ctx[5], false, false, false),
    					listen_dev(i1, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(i1, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*removeElement*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*statei1*/ 2 && i0_class_value !== (i0_class_value = "fas fa-plus" + /*statei1*/ ctx[1] + " svelte-1ki46hm")) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (!current || dirty & /*statei2*/ 4 && i1_class_value !== (i1_class_value = "fas fa-minus" + /*statei2*/ ctx[2] + " svelte-1ki46hm")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*array*/ 8) {
    				each_value = /*array*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bool*/ 1) {
    				attr_dev(div1, "contenteditable", /*bool*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linex.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linex.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(linex);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("CustomR", slots, []);
    	let bool = true, statei1 = "-square", statei2 = "-square", array = [Component1];

    	const setState = (num, state) => {
    		if (state == "enter") {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "");
    			} else {
    				$$invalidate(2, statei2 = "");
    			}
    		} else {
    			$$invalidate(0, bool = !bool);

    			if (num == 1) {
    				$$invalidate(1, statei1 = "-square");
    			} else {
    				$$invalidate(2, statei2 = "-square");
    			}
    		}
    	};

    	const addElement = () => {
    		$$invalidate(3, array = [...array, Component1]);
    	};

    	const removeElement = () => {
    		$$invalidate(3, array = array.slice(0, -1));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CustomR> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => setState(1, "enter");
    	const mouseleave_handler = () => setState(1, "leave");
    	const mouseenter_handler_1 = () => setState(2, "enter");
    	const mouseleave_handler_1 = () => setState(2, "leave");

    	$$self.$capture_state = () => ({
    		LineX: LineXR,
    		Component: Component1,
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("bool" in $$props) $$invalidate(0, bool = $$props.bool);
    		if ("statei1" in $$props) $$invalidate(1, statei1 = $$props.statei1);
    		if ("statei2" in $$props) $$invalidate(2, statei2 = $$props.statei2);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bool,
    		statei1,
    		statei2,
    		array,
    		setState,
    		addElement,
    		removeElement,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class CustomR extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomR",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (61:6) {#if avatar}
    function create_if_block_15(ctx) {
    	let avatar_1;
    	let current;
    	avatar_1 = new Avatar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(avatar_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(avatar_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(avatar_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(avatar_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(avatar_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(61:6) {#if avatar}",
    		ctx
    	});

    	return block;
    }

    // (64:6) {#if aboutme}
    function create_if_block_14(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(64:6) {#if aboutme}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if customl}
    function create_if_block_13(ctx) {
    	let customl_1;
    	let current;
    	customl_1 = new CustomL({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(customl_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(customl_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customl_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customl_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customl_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(67:6) {#if customl}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#if skillsl}
    function create_if_block_12(ctx) {
    	let skillsl_1;
    	let current;
    	skillsl_1 = new SkillsL({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skillsl_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skillsl_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skillsl_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skillsl_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skillsl_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(70:6) {#if skillsl}",
    		ctx
    	});

    	return block;
    }

    // (73:6) {#if interests}
    function create_if_block_11(ctx) {
    	let interests_1;
    	let current;
    	interests_1 = new Interests({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(interests_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(interests_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(interests_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(interests_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(interests_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(73:6) {#if interests}",
    		ctx
    	});

    	return block;
    }

    // (76:6) {#if contact}
    function create_if_block_10(ctx) {
    	let contact_1;
    	let current;
    	contact_1 = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contact_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contact_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contact_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(76:6) {#if contact}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#if social}
    function create_if_block_9(ctx) {
    	let social_1;
    	let current;
    	social_1 = new Social({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(social_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(social_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(social_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(social_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(social_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(79:6) {#if social}",
    		ctx
    	});

    	return block;
    }

    // (84:6) {#if name}
    function create_if_block_8(ctx) {
    	let name_1;
    	let current;
    	name_1 = new Name({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(name_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(name_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(name_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(name_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(name_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(84:6) {#if name}",
    		ctx
    	});

    	return block;
    }

    // (87:6) {#if skillsr}
    function create_if_block_7(ctx) {
    	let skillsr_1;
    	let current;
    	skillsr_1 = new SkillsR({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skillsr_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skillsr_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skillsr_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skillsr_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skillsr_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(87:6) {#if skillsr}",
    		ctx
    	});

    	return block;
    }

    // (90:6) {#if work}
    function create_if_block_6(ctx) {
    	let work_1;
    	let current;
    	work_1 = new Work({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(work_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(work_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(work_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(work_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(work_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(90:6) {#if work}",
    		ctx
    	});

    	return block;
    }

    // (93:6) {#if education}
    function create_if_block_5(ctx) {
    	let education_1;
    	let current;
    	education_1 = new Education({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(education_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(education_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(education_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(education_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(education_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(93:6) {#if education}",
    		ctx
    	});

    	return block;
    }

    // (96:6) {#if certifications}
    function create_if_block_4(ctx) {
    	let certifications_1;
    	let current;
    	certifications_1 = new Certifications({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(certifications_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(certifications_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(certifications_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(certifications_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(certifications_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(96:6) {#if certifications}",
    		ctx
    	});

    	return block;
    }

    // (99:6) {#if projects}
    function create_if_block_3(ctx) {
    	let projects_1;
    	let current;
    	projects_1 = new Projects({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projects_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(99:6) {#if projects}",
    		ctx
    	});

    	return block;
    }

    // (102:6) {#if achievements}
    function create_if_block_2(ctx) {
    	let achievements_1;
    	let current;
    	achievements_1 = new Achievements({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(achievements_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(achievements_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(achievements_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(achievements_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(achievements_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(102:6) {#if achievements}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {#if positions}
    function create_if_block_1(ctx) {
    	let positions_1;
    	let current;
    	positions_1 = new Positions({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(positions_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(positions_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(positions_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(positions_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(positions_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(105:6) {#if positions}",
    		ctx
    	});

    	return block;
    }

    // (108:6) {#if customr}
    function create_if_block(ctx) {
    	let customr_1;
    	let current;
    	customr_1 = new CustomR({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(customr_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(customr_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customr_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customr_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customr_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:6) {#if customr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let menu;
    	let updating_avatar;
    	let updating_aboutme;
    	let updating_interests;
    	let updating_contact;
    	let updating_social;
    	let updating_name;
    	let updating_skillsr;
    	let updating_work;
    	let updating_education;
    	let updating_certifications;
    	let updating_projects;
    	let updating_achievements;
    	let updating_positions;
    	let updating_skillsl;
    	let updating_customl;
    	let updating_customr;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div2;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let current;

    	function menu_avatar_binding(value) {
    		/*menu_avatar_binding*/ ctx[16](value);
    	}

    	function menu_aboutme_binding(value) {
    		/*menu_aboutme_binding*/ ctx[17](value);
    	}

    	function menu_interests_binding(value) {
    		/*menu_interests_binding*/ ctx[18](value);
    	}

    	function menu_contact_binding(value) {
    		/*menu_contact_binding*/ ctx[19](value);
    	}

    	function menu_social_binding(value) {
    		/*menu_social_binding*/ ctx[20](value);
    	}

    	function menu_name_binding(value) {
    		/*menu_name_binding*/ ctx[21](value);
    	}

    	function menu_skillsr_binding(value) {
    		/*menu_skillsr_binding*/ ctx[22](value);
    	}

    	function menu_work_binding(value) {
    		/*menu_work_binding*/ ctx[23](value);
    	}

    	function menu_education_binding(value) {
    		/*menu_education_binding*/ ctx[24](value);
    	}

    	function menu_certifications_binding(value) {
    		/*menu_certifications_binding*/ ctx[25](value);
    	}

    	function menu_projects_binding(value) {
    		/*menu_projects_binding*/ ctx[26](value);
    	}

    	function menu_achievements_binding(value) {
    		/*menu_achievements_binding*/ ctx[27](value);
    	}

    	function menu_positions_binding(value) {
    		/*menu_positions_binding*/ ctx[28](value);
    	}

    	function menu_skillsl_binding(value) {
    		/*menu_skillsl_binding*/ ctx[29](value);
    	}

    	function menu_customl_binding(value) {
    		/*menu_customl_binding*/ ctx[30](value);
    	}

    	function menu_customr_binding(value) {
    		/*menu_customr_binding*/ ctx[31](value);
    	}

    	let menu_props = {};

    	if (/*avatar*/ ctx[0] !== void 0) {
    		menu_props.avatar = /*avatar*/ ctx[0];
    	}

    	if (/*aboutme*/ ctx[1] !== void 0) {
    		menu_props.aboutme = /*aboutme*/ ctx[1];
    	}

    	if (/*interests*/ ctx[2] !== void 0) {
    		menu_props.interests = /*interests*/ ctx[2];
    	}

    	if (/*contact*/ ctx[3] !== void 0) {
    		menu_props.contact = /*contact*/ ctx[3];
    	}

    	if (/*social*/ ctx[4] !== void 0) {
    		menu_props.social = /*social*/ ctx[4];
    	}

    	if (/*name*/ ctx[5] !== void 0) {
    		menu_props.name = /*name*/ ctx[5];
    	}

    	if (/*skillsr*/ ctx[6] !== void 0) {
    		menu_props.skillsr = /*skillsr*/ ctx[6];
    	}

    	if (/*work*/ ctx[7] !== void 0) {
    		menu_props.work = /*work*/ ctx[7];
    	}

    	if (/*education*/ ctx[8] !== void 0) {
    		menu_props.education = /*education*/ ctx[8];
    	}

    	if (/*certifications*/ ctx[9] !== void 0) {
    		menu_props.certifications = /*certifications*/ ctx[9];
    	}

    	if (/*projects*/ ctx[10] !== void 0) {
    		menu_props.projects = /*projects*/ ctx[10];
    	}

    	if (/*achievements*/ ctx[11] !== void 0) {
    		menu_props.achievements = /*achievements*/ ctx[11];
    	}

    	if (/*positions*/ ctx[12] !== void 0) {
    		menu_props.positions = /*positions*/ ctx[12];
    	}

    	if (/*skillsl*/ ctx[13] !== void 0) {
    		menu_props.skillsl = /*skillsl*/ ctx[13];
    	}

    	if (/*customl*/ ctx[14] !== void 0) {
    		menu_props.customl = /*customl*/ ctx[14];
    	}

    	if (/*customr*/ ctx[15] !== void 0) {
    		menu_props.customr = /*customr*/ ctx[15];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, "avatar", menu_avatar_binding));
    	binding_callbacks.push(() => bind(menu, "aboutme", menu_aboutme_binding));
    	binding_callbacks.push(() => bind(menu, "interests", menu_interests_binding));
    	binding_callbacks.push(() => bind(menu, "contact", menu_contact_binding));
    	binding_callbacks.push(() => bind(menu, "social", menu_social_binding));
    	binding_callbacks.push(() => bind(menu, "name", menu_name_binding));
    	binding_callbacks.push(() => bind(menu, "skillsr", menu_skillsr_binding));
    	binding_callbacks.push(() => bind(menu, "work", menu_work_binding));
    	binding_callbacks.push(() => bind(menu, "education", menu_education_binding));
    	binding_callbacks.push(() => bind(menu, "certifications", menu_certifications_binding));
    	binding_callbacks.push(() => bind(menu, "projects", menu_projects_binding));
    	binding_callbacks.push(() => bind(menu, "achievements", menu_achievements_binding));
    	binding_callbacks.push(() => bind(menu, "positions", menu_positions_binding));
    	binding_callbacks.push(() => bind(menu, "skillsl", menu_skillsl_binding));
    	binding_callbacks.push(() => bind(menu, "customl", menu_customl_binding));
    	binding_callbacks.push(() => bind(menu, "customr", menu_customr_binding));
    	let if_block0 = /*avatar*/ ctx[0] && create_if_block_15(ctx);
    	let if_block1 = /*aboutme*/ ctx[1] && create_if_block_14(ctx);
    	let if_block2 = /*customl*/ ctx[14] && create_if_block_13(ctx);
    	let if_block3 = /*skillsl*/ ctx[13] && create_if_block_12(ctx);
    	let if_block4 = /*interests*/ ctx[2] && create_if_block_11(ctx);
    	let if_block5 = /*contact*/ ctx[3] && create_if_block_10(ctx);
    	let if_block6 = /*social*/ ctx[4] && create_if_block_9(ctx);
    	let if_block7 = /*name*/ ctx[5] && create_if_block_8(ctx);
    	let if_block8 = /*skillsr*/ ctx[6] && create_if_block_7(ctx);
    	let if_block9 = /*work*/ ctx[7] && create_if_block_6(ctx);
    	let if_block10 = /*education*/ ctx[8] && create_if_block_5(ctx);
    	let if_block11 = /*certifications*/ ctx[9] && create_if_block_4(ctx);
    	let if_block12 = /*projects*/ ctx[10] && create_if_block_3(ctx);
    	let if_block13 = /*achievements*/ ctx[11] && create_if_block_2(ctx);
    	let if_block14 = /*positions*/ ctx[12] && create_if_block_1(ctx);
    	let if_block15 = /*customr*/ ctx[15] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			t5 = space();
    			if (if_block5) if_block5.c();
    			t6 = space();
    			if (if_block6) if_block6.c();
    			t7 = space();
    			div2 = element("div");
    			if (if_block7) if_block7.c();
    			t8 = space();
    			if (if_block8) if_block8.c();
    			t9 = space();
    			if (if_block9) if_block9.c();
    			t10 = space();
    			if (if_block10) if_block10.c();
    			t11 = space();
    			if (if_block11) if_block11.c();
    			t12 = space();
    			if (if_block12) if_block12.c();
    			t13 = space();
    			if (if_block13) if_block13.c();
    			t14 = space();
    			if (if_block14) if_block14.c();
    			t15 = space();
    			if (if_block15) if_block15.c();
    			attr_dev(div0, "class", "menubar svelte-dp5835");
    			add_location(div0, file, 38, 2, 1457);
    			attr_dev(div1, "class", "left svelte-dp5835");
    			add_location(div1, file, 59, 4, 1876);
    			attr_dev(div2, "class", "right svelte-dp5835");
    			add_location(div2, file, 82, 4, 2295);
    			attr_dev(div3, "class", "main svelte-dp5835");
    			attr_dev(div3, "size", "A4");
    			add_location(div3, file, 58, 2, 1842);
    			attr_dev(main, "class", "svelte-dp5835");
    			add_location(main, file, 37, 0, 1447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(menu, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div3);
    			append_dev(div3, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t2);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t3);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div1, t4);
    			if (if_block4) if_block4.m(div1, null);
    			append_dev(div1, t5);
    			if (if_block5) if_block5.m(div1, null);
    			append_dev(div1, t6);
    			if (if_block6) if_block6.m(div1, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			if (if_block7) if_block7.m(div2, null);
    			append_dev(div2, t8);
    			if (if_block8) if_block8.m(div2, null);
    			append_dev(div2, t9);
    			if (if_block9) if_block9.m(div2, null);
    			append_dev(div2, t10);
    			if (if_block10) if_block10.m(div2, null);
    			append_dev(div2, t11);
    			if (if_block11) if_block11.m(div2, null);
    			append_dev(div2, t12);
    			if (if_block12) if_block12.m(div2, null);
    			append_dev(div2, t13);
    			if (if_block13) if_block13.m(div2, null);
    			append_dev(div2, t14);
    			if (if_block14) if_block14.m(div2, null);
    			append_dev(div2, t15);
    			if (if_block15) if_block15.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menu_changes = {};

    			if (!updating_avatar && dirty[0] & /*avatar*/ 1) {
    				updating_avatar = true;
    				menu_changes.avatar = /*avatar*/ ctx[0];
    				add_flush_callback(() => updating_avatar = false);
    			}

    			if (!updating_aboutme && dirty[0] & /*aboutme*/ 2) {
    				updating_aboutme = true;
    				menu_changes.aboutme = /*aboutme*/ ctx[1];
    				add_flush_callback(() => updating_aboutme = false);
    			}

    			if (!updating_interests && dirty[0] & /*interests*/ 4) {
    				updating_interests = true;
    				menu_changes.interests = /*interests*/ ctx[2];
    				add_flush_callback(() => updating_interests = false);
    			}

    			if (!updating_contact && dirty[0] & /*contact*/ 8) {
    				updating_contact = true;
    				menu_changes.contact = /*contact*/ ctx[3];
    				add_flush_callback(() => updating_contact = false);
    			}

    			if (!updating_social && dirty[0] & /*social*/ 16) {
    				updating_social = true;
    				menu_changes.social = /*social*/ ctx[4];
    				add_flush_callback(() => updating_social = false);
    			}

    			if (!updating_name && dirty[0] & /*name*/ 32) {
    				updating_name = true;
    				menu_changes.name = /*name*/ ctx[5];
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_skillsr && dirty[0] & /*skillsr*/ 64) {
    				updating_skillsr = true;
    				menu_changes.skillsr = /*skillsr*/ ctx[6];
    				add_flush_callback(() => updating_skillsr = false);
    			}

    			if (!updating_work && dirty[0] & /*work*/ 128) {
    				updating_work = true;
    				menu_changes.work = /*work*/ ctx[7];
    				add_flush_callback(() => updating_work = false);
    			}

    			if (!updating_education && dirty[0] & /*education*/ 256) {
    				updating_education = true;
    				menu_changes.education = /*education*/ ctx[8];
    				add_flush_callback(() => updating_education = false);
    			}

    			if (!updating_certifications && dirty[0] & /*certifications*/ 512) {
    				updating_certifications = true;
    				menu_changes.certifications = /*certifications*/ ctx[9];
    				add_flush_callback(() => updating_certifications = false);
    			}

    			if (!updating_projects && dirty[0] & /*projects*/ 1024) {
    				updating_projects = true;
    				menu_changes.projects = /*projects*/ ctx[10];
    				add_flush_callback(() => updating_projects = false);
    			}

    			if (!updating_achievements && dirty[0] & /*achievements*/ 2048) {
    				updating_achievements = true;
    				menu_changes.achievements = /*achievements*/ ctx[11];
    				add_flush_callback(() => updating_achievements = false);
    			}

    			if (!updating_positions && dirty[0] & /*positions*/ 4096) {
    				updating_positions = true;
    				menu_changes.positions = /*positions*/ ctx[12];
    				add_flush_callback(() => updating_positions = false);
    			}

    			if (!updating_skillsl && dirty[0] & /*skillsl*/ 8192) {
    				updating_skillsl = true;
    				menu_changes.skillsl = /*skillsl*/ ctx[13];
    				add_flush_callback(() => updating_skillsl = false);
    			}

    			if (!updating_customl && dirty[0] & /*customl*/ 16384) {
    				updating_customl = true;
    				menu_changes.customl = /*customl*/ ctx[14];
    				add_flush_callback(() => updating_customl = false);
    			}

    			if (!updating_customr && dirty[0] & /*customr*/ 32768) {
    				updating_customr = true;
    				menu_changes.customr = /*customr*/ ctx[15];
    				add_flush_callback(() => updating_customr = false);
    			}

    			menu.$set(menu_changes);

    			if (/*avatar*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty[0] & /*avatar*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_15(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*aboutme*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty[0] & /*aboutme*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_14(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*customl*/ ctx[14]) {
    				if (if_block2) {
    					if (dirty[0] & /*customl*/ 16384) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_13(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*skillsl*/ ctx[13]) {
    				if (if_block3) {
    					if (dirty[0] & /*skillsl*/ 8192) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_12(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, t4);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*interests*/ ctx[2]) {
    				if (if_block4) {
    					if (dirty[0] & /*interests*/ 4) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_11(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div1, t5);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*contact*/ ctx[3]) {
    				if (if_block5) {
    					if (dirty[0] & /*contact*/ 8) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_10(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div1, t6);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*social*/ ctx[4]) {
    				if (if_block6) {
    					if (dirty[0] & /*social*/ 16) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_9(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div1, null);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*name*/ ctx[5]) {
    				if (if_block7) {
    					if (dirty[0] & /*name*/ 32) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_8(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div2, t8);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*skillsr*/ ctx[6]) {
    				if (if_block8) {
    					if (dirty[0] & /*skillsr*/ 64) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_7(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div2, t9);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*work*/ ctx[7]) {
    				if (if_block9) {
    					if (dirty[0] & /*work*/ 128) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_6(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div2, t10);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*education*/ ctx[8]) {
    				if (if_block10) {
    					if (dirty[0] & /*education*/ 256) {
    						transition_in(if_block10, 1);
    					}
    				} else {
    					if_block10 = create_if_block_5(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div2, t11);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*certifications*/ ctx[9]) {
    				if (if_block11) {
    					if (dirty[0] & /*certifications*/ 512) {
    						transition_in(if_block11, 1);
    					}
    				} else {
    					if_block11 = create_if_block_4(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div2, t12);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			if (/*projects*/ ctx[10]) {
    				if (if_block12) {
    					if (dirty[0] & /*projects*/ 1024) {
    						transition_in(if_block12, 1);
    					}
    				} else {
    					if_block12 = create_if_block_3(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div2, t13);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*achievements*/ ctx[11]) {
    				if (if_block13) {
    					if (dirty[0] & /*achievements*/ 2048) {
    						transition_in(if_block13, 1);
    					}
    				} else {
    					if_block13 = create_if_block_2(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(div2, t14);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (/*positions*/ ctx[12]) {
    				if (if_block14) {
    					if (dirty[0] & /*positions*/ 4096) {
    						transition_in(if_block14, 1);
    					}
    				} else {
    					if_block14 = create_if_block_1(ctx);
    					if_block14.c();
    					transition_in(if_block14, 1);
    					if_block14.m(div2, t15);
    				}
    			} else if (if_block14) {
    				group_outros();

    				transition_out(if_block14, 1, 1, () => {
    					if_block14 = null;
    				});

    				check_outros();
    			}

    			if (/*customr*/ ctx[15]) {
    				if (if_block15) {
    					if (dirty[0] & /*customr*/ 32768) {
    						transition_in(if_block15, 1);
    					}
    				} else {
    					if_block15 = create_if_block(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(div2, null);
    				}
    			} else if (if_block15) {
    				group_outros();

    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menu);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (if_block15) if_block15.d();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let avatar = true,
    		aboutme = true,
    		interests = true,
    		contact = true,
    		social = true,
    		name = true,
    		skillsr = true,
    		work = true,
    		education = true,
    		certifications = true,
    		projects = true,
    		achievements = false,
    		positions = false,
    		skillsl = false,
    		customl = false,
    		customr = false;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function menu_avatar_binding(value) {
    		avatar = value;
    		$$invalidate(0, avatar);
    	}

    	function menu_aboutme_binding(value) {
    		aboutme = value;
    		$$invalidate(1, aboutme);
    	}

    	function menu_interests_binding(value) {
    		interests = value;
    		$$invalidate(2, interests);
    	}

    	function menu_contact_binding(value) {
    		contact = value;
    		$$invalidate(3, contact);
    	}

    	function menu_social_binding(value) {
    		social = value;
    		$$invalidate(4, social);
    	}

    	function menu_name_binding(value) {
    		name = value;
    		$$invalidate(5, name);
    	}

    	function menu_skillsr_binding(value) {
    		skillsr = value;
    		$$invalidate(6, skillsr);
    	}

    	function menu_work_binding(value) {
    		work = value;
    		$$invalidate(7, work);
    	}

    	function menu_education_binding(value) {
    		education = value;
    		$$invalidate(8, education);
    	}

    	function menu_certifications_binding(value) {
    		certifications = value;
    		$$invalidate(9, certifications);
    	}

    	function menu_projects_binding(value) {
    		projects = value;
    		$$invalidate(10, projects);
    	}

    	function menu_achievements_binding(value) {
    		achievements = value;
    		$$invalidate(11, achievements);
    	}

    	function menu_positions_binding(value) {
    		positions = value;
    		$$invalidate(12, positions);
    	}

    	function menu_skillsl_binding(value) {
    		skillsl = value;
    		$$invalidate(13, skillsl);
    	}

    	function menu_customl_binding(value) {
    		customl = value;
    		$$invalidate(14, customl);
    	}

    	function menu_customr_binding(value) {
    		customr = value;
    		$$invalidate(15, customr);
    	}

    	$$self.$capture_state = () => ({
    		Menu,
    		Avatar,
    		About,
    		Interests,
    		Contact,
    		Social,
    		Name,
    		SkillsR,
    		Work,
    		Education,
    		Certifications,
    		Projects,
    		Achievements,
    		Positions,
    		SkillsL,
    		CustomL,
    		CustomR,
    		avatar,
    		aboutme,
    		interests,
    		contact,
    		social,
    		name,
    		skillsr,
    		work,
    		education,
    		certifications,
    		projects,
    		achievements,
    		positions,
    		skillsl,
    		customl,
    		customr
    	});

    	$$self.$inject_state = $$props => {
    		if ("avatar" in $$props) $$invalidate(0, avatar = $$props.avatar);
    		if ("aboutme" in $$props) $$invalidate(1, aboutme = $$props.aboutme);
    		if ("interests" in $$props) $$invalidate(2, interests = $$props.interests);
    		if ("contact" in $$props) $$invalidate(3, contact = $$props.contact);
    		if ("social" in $$props) $$invalidate(4, social = $$props.social);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("skillsr" in $$props) $$invalidate(6, skillsr = $$props.skillsr);
    		if ("work" in $$props) $$invalidate(7, work = $$props.work);
    		if ("education" in $$props) $$invalidate(8, education = $$props.education);
    		if ("certifications" in $$props) $$invalidate(9, certifications = $$props.certifications);
    		if ("projects" in $$props) $$invalidate(10, projects = $$props.projects);
    		if ("achievements" in $$props) $$invalidate(11, achievements = $$props.achievements);
    		if ("positions" in $$props) $$invalidate(12, positions = $$props.positions);
    		if ("skillsl" in $$props) $$invalidate(13, skillsl = $$props.skillsl);
    		if ("customl" in $$props) $$invalidate(14, customl = $$props.customl);
    		if ("customr" in $$props) $$invalidate(15, customr = $$props.customr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		avatar,
    		aboutme,
    		interests,
    		contact,
    		social,
    		name,
    		skillsr,
    		work,
    		education,
    		certifications,
    		projects,
    		achievements,
    		positions,
    		skillsl,
    		customl,
    		customr,
    		menu_avatar_binding,
    		menu_aboutme_binding,
    		menu_interests_binding,
    		menu_contact_binding,
    		menu_social_binding,
    		menu_name_binding,
    		menu_skillsr_binding,
    		menu_work_binding,
    		menu_education_binding,
    		menu_certifications_binding,
    		menu_projects_binding,
    		menu_achievements_binding,
    		menu_positions_binding,
    		menu_skillsl_binding,
    		menu_customl_binding,
    		menu_customr_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
