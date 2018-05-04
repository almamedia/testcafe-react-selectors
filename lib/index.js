'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*global document window*/
var Selector = require('testcafe').Selector;

var ReactSelector = exports.ReactSelector = Selector(function (selector) {
    var getRootElsReact15 = /*global document*/

    /*eslint-disable no-unused-vars*/
    function getRootElsReact15() {
        /*eslint-enable no-unused-vars*/

        var ELEMENT_NODE = 1;

        function getRootComponent(el) {
            if (!el || el.nodeType !== ELEMENT_NODE) return null;

            for (var _i2 = 0, _Object$keys2 = Object.keys(el), _length2 = _Object$keys2.length; _i2 < _length2; _i2++) {
                var prop = _Object$keys2[_i2];
                if (!/^__reactInternalInstance/.test(prop)) continue;

                return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
            }
        }

        var rootEls = [].slice.call(document.querySelectorAll('[data-reactroot]'));
        var checkRootEls = rootEls.length && Object.keys(rootEls[0]).some(function (prop) {
            var rootEl = rootEls[0];

            //NOTE: server rendering in React 16 also adds data-reactroot attribute, we check existing the
            //alternate field because it doesn't exists in React 15.
            return (/^__reactInternalInstance/.test(prop) && !rootEl[prop].hasOwnProperty('alternate')
            );
        });

        return (checkRootEls && rootEls || []).map(getRootComponent);
    };

    var getRootElsReact16 = /*global document*/

    /*eslint-disable no-unused-vars*/
    function getRootElsReact16(el) {
        el = el || document.body;

        if (el._reactRootContainer) {
            var rootContainer = el._reactRootContainer._internalRoot || el._reactRootContainer;

            return rootContainer.current.child;
        }

        var children = el.children;
        var rootEls = [];

        for (var index = 0; index < children.length; ++index) {
            var child = children[index];

            rootEls = rootEls.concat(getRootElsReact16(child));
        }

        return rootEls;
    };

    var selectorReact15 = /*global window rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

    /*eslint-disable no-unused-vars*/
    function react15elector(selector) {
        var parents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rootEls;

        var ELEMENT_NODE = 1;
        var COMMENT_NODE = 8;

        window['%testCafeReactFoundComponents%'] = [];

        /*eslint-enable no-unused-vars*/
        function getName(component) {
            var currentElement = component._currentElement;

            var name = component.getName ? component.getName() : component._tag;

            //NOTE: getName() returns null in IE, also it try to get function name for a stateless component
            if (name === null && currentElement && typeof currentElement === 'object') {
                var matches = currentElement.type.toString().match(/^function\s*([^\s(]+)/);

                if (matches) name = matches[1];
            }

            return name;
        }

        function getRootComponent(el) {
            if (!el || el.nodeType !== ELEMENT_NODE) return null;

            for (var _i4 = 0, _Object$keys4 = Object.keys(el), _length4 = _Object$keys4.length; _i4 < _length4; _i4++) {
                var prop = _Object$keys4[_i4];
                if (!/^__reactInternalInstance/.test(prop)) continue;

                return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
            }
        }

        if (!window['%testCafeReactSelectorUtils%']) window['%testCafeReactSelectorUtils%'] = { getName, getRootComponent };

        function getRenderedChildren(component) {
            var hostNode = component.getHostNode();
            var hostNodeType = hostNode.nodeType;
            var container = component._instance && component._instance.container;
            var isRootComponent = hostNode.hasAttribute && hostNode.hasAttribute('data-reactroot');

            //NOTE: prevent the repeating visiting of reactRoot Component inside of portal
            if (component._renderedComponent && isRootComponent) {
                if (checkRootNodeVisited(component._renderedComponent)) return [];

                visitedRootEls.push(component._renderedComponent);
            }

            //NOTE: Detect if it's a portal component
            if (hostNodeType === COMMENT_NODE && container) {
                var domNode = container.querySelector('[data-reactroot]');

                return { _: getRootComponent(domNode) };
            }

            return component._renderedChildren || component._renderedComponent && { _: component._renderedComponent } || {};
        }

        function parseSelectorElements(compositeSelector) {
            return compositeSelector.split(' ').filter(function (el) {
                return !!el;
            }).map(function (el) {
                return el.trim();
            });
        }

        function reactSelect(compositeSelector) {
            var foundComponents = [];

            function findDOMNode(rootEl) {
                if (typeof compositeSelector !== 'string') throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

                var selectorIndex = 0;
                var selectorElms = parseSelectorElements(compositeSelector);

                if (selectorElms.length) defineSelectorProperty(selectorElms[selectorElms.length - 1]);

                function walk(reactComponent, cb) {
                    if (!reactComponent) return;

                    var componentWasFound = cb(reactComponent);

                    //NOTE: we're looking for only between the children of component
                    if (selectorIndex > 0 && selectorIndex < selectorElms.length && !componentWasFound) {
                        var isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];
                        var parent = reactComponent._hostParent;

                        if (isTag && parent) {
                            var renderedChildren = parent._renderedChildren;
                            var renderedChildrenKeys = Object.keys(renderedChildren);

                            var currentElementId = renderedChildrenKeys.filter(function (key) {
                                var renderedComponent = renderedChildren[key]._renderedComponent;

                                return renderedComponent && renderedComponent._domID === reactComponent._domID;
                            })[0];

                            if (!renderedChildren[currentElementId]) return;
                        }
                    }

                    var currSelectorIndex = selectorIndex;

                    renderedChildren = getRenderedChildren(reactComponent);

                    Object.keys(renderedChildren).forEach(function (key) {
                        walk(renderedChildren[key], cb);

                        selectorIndex = currSelectorIndex;
                    });
                }

                return walk(rootEl, function (reactComponent) {
                    var componentName = getName(reactComponent);

                    if (!componentName) return false;

                    var domNode = reactComponent.getHostNode();

                    if (selectorElms[selectorIndex] !== componentName) return false;

                    if (selectorIndex === selectorElms.length - 1) {
                        foundComponents.push(domNode);

                        window['%testCafeReactFoundComponents%'].push({ node: domNode, component: reactComponent });
                    }

                    selectorIndex++;

                    return true;
                });
            }

            [].forEach.call(parents, findDOMNode);

            return foundComponents;
        }

        return reactSelect(selector);
    };

    var selectorReact16 = /*global window document Node rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

    /*eslint-disable no-unused-vars*/
    function react16Selector(selector) {
        var parents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rootEls;

        window['%testCafeReactFoundComponents%'] = [];

        /*eslint-enable no-unused-vars*/
        function createAnnotationForEmptyComponent(component) {
            var comment = document.createComment('testcafe-react-selectors: the requested component didn\'t render any DOM elements');

            comment.__$$reactInstance = component;

            if (!window['%testCafeReactEmptyComponent%']) window['%testCafeReactEmptyComponent%'] = [];

            window['%testCafeReactEmptyComponent%'].push(comment);

            return comment;
        }

        function getName(component) {
            if (!component.type && !component.memoizedState) return null;

            var currentElement = component.type ? component : component.memoizedState.element;
            // Added magic prop "_reactSelectorName" to make it possible to use this with mangled component names
            var foundMagicTestProp = '';

            if (component.memoizedProps && component.memoizedProps._reactSelectorName) foundMagicTestProp = component.memoizedProps._reactSelectorName;else if (component.props && component.props._reactSelectorName) foundMagicTestProp = component.props._reactSelectorName;

            //NOTE: tag
            if (typeof component.type === 'string') return component.type;
            if (component.type.displayName || component.type.name) return foundMagicTestProp || component.type.displayName || component.type.name;

            var matches = currentElement.type.toString().match(/^function\s*([^\s(]+)/);

            if (matches) return matches[1];

            return null;
        }

        function getContainer(component) {
            var node = component;

            while (!(node.stateNode instanceof Node)) {
                if (node.child) node = node.child;else break;
            }

            if (!(node.stateNode instanceof Node)) return null;

            return node.stateNode;
        }

        function getRenderedChildren(component) {
            var isRootComponent = rootEls.indexOf(component) > -1;

            //Nested root element
            if (isRootComponent) {
                if (checkRootNodeVisited(component)) return [];

                visitedRootEls.push(component);
            }

            //Portal component
            if (!component.child) {
                var portalRoot = component.stateNode && component.stateNode.container && component.stateNode.container._reactRootContainer;

                var rootContainer = portalRoot && (portalRoot._internalRoot || portalRoot);

                if (rootContainer) component = rootContainer.current;
            }

            if (!component.child) return [];

            var currentChild = component.child;

            if (typeof component.type !== 'string') currentChild = component.child;

            var children = [currentChild];

            while (currentChild.sibling) {
                children.push(currentChild.sibling);

                currentChild = currentChild.sibling;
            }

            return children;
        }

        function parseSelectorElements(compositeSelector) {
            return compositeSelector.split(' ').filter(function (el) {
                return !!el;
            }).map(function (el) {
                return el.trim();
            });
        }

        function reactSelect(compositeSelector) {
            var foundComponents = [];

            function findDOMNode(rootComponent) {
                if (typeof compositeSelector !== 'string') throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

                var selectorIndex = 0;
                var selectorElms = parseSelectorElements(compositeSelector);

                if (selectorElms.length) defineSelectorProperty(selectorElms[selectorElms.length - 1]);

                function walk(reactComponent, cb) {
                    if (!reactComponent) return;

                    var componentWasFound = cb(reactComponent);
                    var currSelectorIndex = selectorIndex;

                    var isNotFirstSelectorPart = selectorIndex > 0 && selectorIndex < selectorElms.length;

                    if (isNotFirstSelectorPart && !componentWasFound) {
                        var isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];

                        //NOTE: we're looking for only between the children of component
                        if (isTag && getName(reactComponent.return) !== selectorElms[selectorIndex - 1]) return;
                    }

                    var renderedChildren = getRenderedChildren(reactComponent);

                    Object.keys(renderedChildren).forEach(function (key) {
                        walk(renderedChildren[key], cb);

                        selectorIndex = currSelectorIndex;
                    });
                }

                return walk(rootComponent, function (reactComponent) {
                    var componentName = getName(reactComponent);

                    if (!componentName) return false;

                    var domNode = getContainer(reactComponent);

                    if (selectorElms[selectorIndex] !== componentName) return false;

                    if (selectorIndex === selectorElms.length - 1) {
                        foundComponents.push(domNode || createAnnotationForEmptyComponent(reactComponent));

                        window['%testCafeReactFoundComponents%'].push({ node: domNode, component: reactComponent });
                    }

                    selectorIndex++;

                    return true;
                });
            }

            [].forEach.call(parents, findDOMNode);

            return foundComponents;
        }

        return reactSelect(selector);
    };

    var visitedRootEls = [];
    var rootEls = null;

    function checkRootNodeVisited(component) {
        return visitedRootEls.indexOf(component) > -1;
    }

    function defineSelectorProperty(value) {
        if (window['%testCafeReactSelector%']) delete window['%testCafeReactSelector%'];

        Object.defineProperty(window, '%testCafeReactSelector%', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: value
        });
    }

    rootEls = getRootElsReact15();

    var foundDOMNodes = void 0;

    if (rootEls.length) {
        window['%testCafeReactVersion%'] = 15;
        window['$testCafeReactSelector'] = selectorReact15;

        foundDOMNodes = selectorReact15(selector);
    }

    rootEls = getRootElsReact16();

    if (rootEls.length) {
        window['%testCafeReactVersion%'] = 16;
        window['$testCafeReactSelector'] = selectorReact16;

        foundDOMNodes = selectorReact16(selector);
    }

    visitedRootEls = [];

    if (foundDOMNodes) return foundDOMNodes;

    throw new Error('testcafe-react-selectors supports React version 15.x and newer');
}).addCustomMethods({
    getReact: function getReact(node, fn) {
        var reactVersion = window['%testCafeReactVersion%'];
        var react15Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;
            var utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                var parent = component._hostParent || component;
                var renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                var renderedChildrenKeys = Object.keys(renderedChildren);
                var componentName = window['%testCafeReactSelector%'];

                for (var index = 0; index < renderedChildrenKeys.length; ++index) {
                    var key = renderedChildrenKeys[index];
                    var renderedComponent = renderedChildren[key];
                    var componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                var componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    var rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (var _i6 = 0, _Object$keys6 = Object.keys(el), _length6 = _Object$keys6.length; _i6 < _length6; _i6++) {
                    var prop = _Object$keys6[_i6];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        var react16Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var component = null;
                var emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(function (desc) {
                    return desc.node === el;
                })[0].component;

                var isTag = typeof component.type === 'string';

                if (isTag) return null;

                var props = component.stateNode && component.stateNode.props || component.memoizedProps;
                var state = component.stateNode && component.stateNode.state || component.memoizedState;

                return { props, state };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        delete window['%testCafeReactVersion%'];

        if (reactVersion === 15) return react15Utils.getReact(node, fn);
        if (reactVersion === 16) return react16Utils.getReact(node, fn);
    }
}).addCustomMethods({
    withProps: function withProps(nodes) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        function isEql(value1, value2) {
            if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null) return value1 === value2;

            if (Object.keys(value1).length !== Object.keys(value2).length) return false;

            for (var prop in value1) {
                if (!value2.hasOwnProperty(prop)) return false;
                if (!isEql(value1[prop], value2[prop])) return false;
            }

            return true;
        }

        function componentHasProps(_ref, filterProps) {
            var props = _ref.props;

            if (Object.keys(props).length === 0 && Object.keys(filterProps).length > 0) return false;

            for (var _i8 = 0, _Object$keys8 = Object.keys(filterProps), _length8 = _Object$keys8.length; _i8 < _length8; _i8++) {
                var prop = _Object$keys8[_i8];
                if (!props.hasOwnProperty(prop) || !isEql(props[prop], filterProps[prop])) return false;
            }

            return true;
        }

        var reactVersion = window['%testCafeReactVersion%'];
        var react15Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;
            var utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                var parent = component._hostParent || component;
                var renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                var renderedChildrenKeys = Object.keys(renderedChildren);
                var componentName = window['%testCafeReactSelector%'];

                for (var index = 0; index < renderedChildrenKeys.length; ++index) {
                    var key = renderedChildrenKeys[index];
                    var renderedComponent = renderedChildren[key];
                    var componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                var componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    var rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (var _i10 = 0, _Object$keys10 = Object.keys(el), _length10 = _Object$keys10.length; _i10 < _length10; _i10++) {
                    var prop = _Object$keys10[_i10];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        var react16Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var component = null;
                var emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(function (desc) {
                    return desc.node === el;
                })[0].component;

                var isTag = typeof component.type === 'string';

                if (isTag) return null;

                var props = component.stateNode && component.stateNode.props || component.memoizedProps;
                var state = component.stateNode && component.stateNode.state || component.memoizedState;

                return { props, state };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        var filterProps = {};

        var isPropsValid = args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0]);

        if (args.length === 1 && !isPropsValid) throw new Error(`"props" option is expected to be a non-null object, but it was ${typeof args[0]}.`);

        if (args.length > 1 && typeof args[0] !== 'string') throw new Error(`property name is expected to be a string, but it was ${typeof args[0]}.`);

        if (args.length > 1) filterProps[args[0]] = args[1];else if (args[0]) filterProps = args[0];

        var getComponentForDOMNode = reactVersion === 15 ? react15Utils.getComponentForDOMNode : react16Utils.getComponentForDOMNode;

        var filteredNodes = [];
        var foundInstances = nodes.filter(function (node) {
            var componentInstance = getComponentForDOMNode(node);

            if (componentInstance && componentHasProps(componentInstance, filterProps)) {
                filteredNodes.push(node);

                return true;
            }
        });

        window['%testCafeReactFoundComponents%'] = window['%testCafeReactFoundComponents%'].filter(function (component) {
            return filteredNodes.indexOf(component.node) > -1;
        });

        return foundInstances;
    },

    findReact: function findReact(nodes, selector) {
        var reactVersion = window['%testCafeReactVersion%'];
        var react15Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;
            var utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                var parent = component._hostParent || component;
                var renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                var renderedChildrenKeys = Object.keys(renderedChildren);
                var componentName = window['%testCafeReactSelector%'];

                for (var index = 0; index < renderedChildrenKeys.length; ++index) {
                    var key = renderedChildrenKeys[index];
                    var renderedComponent = renderedChildren[key];
                    var componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                var componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    var rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (var _i12 = 0, _Object$keys12 = Object.keys(el), _length12 = _Object$keys12.length; _i12 < _length12; _i12++) {
                    var prop = _Object$keys12[_i12];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        var react16Utils = /*global window*/
        function () {
            var ELEMENT_NODE = 1;
            var COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                var component = null;
                var emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(function (desc) {
                    return desc.node === el;
                })[0].component;

                var isTag = typeof component.type === 'string';

                if (isTag) return null;

                var props = component.stateNode && component.stateNode.props || component.memoizedProps;
                var state = component.stateNode && component.stateNode.state || component.memoizedState;

                return { props, state };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                var componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(function (desc) {
                    return desc.component;
                });
            }

            return { getReact, getComponentForDOMNode, getFoundComponentInstances };
        }();

        var componentInstances = null;

        if (reactVersion === 15) componentInstances = react15Utils.getFoundComponentInstances();else if (reactVersion === 16) componentInstances = react16Utils.getFoundComponentInstances();

        var reactSelector = window['$testCafeReactSelector'];

        return reactSelector(selector, componentInstances);
    }
}, { returnDOMNodes: true });