"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fn_utils_1 = require("./utils/fn.utils");
var Observable_1 = require("rxjs/Observable");
var tree_types_1 = require("./tree.types");
var uuidv4 = require("uuid/v4");
var ChildrenLoadingState;
(function (ChildrenLoadingState) {
    ChildrenLoadingState[ChildrenLoadingState["NotStarted"] = 0] = "NotStarted";
    ChildrenLoadingState[ChildrenLoadingState["Loading"] = 1] = "Loading";
    ChildrenLoadingState[ChildrenLoadingState["Completed"] = 2] = "Completed";
})(ChildrenLoadingState || (ChildrenLoadingState = {}));
var Tree = (function () {
    /**
     * Build an instance of Tree from an object implementing TreeModel interface.
     * @param {TreeModel} model - A model that is used to build a tree.
     * @param {Tree} [parent] - An optional parent if you want to build a tree from the model that should be a child of an existing Tree instance.
     * @param {boolean} [isBranch] - An option that makes a branch from created tree. Branch can have children.
     */
    function Tree(node, parent, isBranch) {
        if (parent === void 0) { parent = null; }
        if (isBranch === void 0) { isBranch = false; }
        var _this = this;
        this._childrenLoadingState = ChildrenLoadingState.NotStarted;
        this._childrenAsyncOnce = fn_utils_1.once(function () {
            return new Observable_1.Observable(function (observer) {
                setTimeout(function () {
                    _this._childrenLoadingState = ChildrenLoadingState.Loading;
                    _this._loadChildren(function (children) {
                        _this._children = (children || []).map(function (child) { return new Tree(child, _this); });
                        _this._childrenLoadingState = ChildrenLoadingState.Completed;
                        observer.next(_this.children);
                        observer.complete();
                    });
                });
            });
        });
        this.buildTreeFromModel(node, parent, isBranch || Array.isArray(node.children));
    }
    // STATIC METHODS ----------------------------------------------------------------------------------------------------
    /**
     * Check that value passed is not empty (it doesn't consist of only whitespace symbols).
     * @param {string} value - A value that should be checked.
     * @returns {boolean} - A flag indicating that value is empty or not.
     * @static
     */
    // STATIC METHODS ----------------------------------------------------------------------------------------------------
    /**
       * Check that value passed is not empty (it doesn't consist of only whitespace symbols).
       * @param {string} value - A value that should be checked.
       * @returns {boolean} - A flag indicating that value is empty or not.
       * @static
       */
    Tree.isValueEmpty = 
    // STATIC METHODS ----------------------------------------------------------------------------------------------------
    /**
       * Check that value passed is not empty (it doesn't consist of only whitespace symbols).
       * @param {string} value - A value that should be checked.
       * @returns {boolean} - A flag indicating that value is empty or not.
       * @static
       */
    function (value) {
        return fn_utils_1.isEmpty(fn_utils_1.trim(value));
    };
    /**
     * Check whether a given value can be considered RenamableNode.
     * @param {any} value - A value to check.
     * @returns {boolean} - A flag indicating whether given value is Renamable node or not.
     * @static
     */
    /**
       * Check whether a given value can be considered RenamableNode.
       * @param {any} value - A value to check.
       * @returns {boolean} - A flag indicating whether given value is Renamable node or not.
       * @static
       */
    Tree.isRenamable = /**
       * Check whether a given value can be considered RenamableNode.
       * @param {any} value - A value to check.
       * @returns {boolean} - A flag indicating whether given value is Renamable node or not.
       * @static
       */
    function (value) {
        return (fn_utils_1.has(value, 'setName') &&
            fn_utils_1.isFunction(value.setName) &&
            (fn_utils_1.has(value, 'toString') && fn_utils_1.isFunction(value.toString) && value.toString !== Object.toString));
    };
    Tree.cloneTreeShallow = function (origin) {
        var tree = new Tree(Object.assign({}, origin.node));
        tree._children = origin._children;
        return tree;
    };
    Tree.applyNewValueToRenamable = function (value, newValue) {
        var renamableValue = Object.assign({}, value);
        renamableValue.setName(newValue);
        return renamableValue;
    };
    Tree.prototype.buildTreeFromModel = function (model, parent, isBranch) {
        var _this = this;
        this.parent = parent;
        this.node = Object.assign(fn_utils_1.omit(model, 'children'), { settings: tree_types_1.TreeModelSettings.merge(model, fn_utils_1.get(parent, 'node')) }, { emitLoadNextLevel: model.emitLoadNextLevel === true });
        if (fn_utils_1.isFunction(this.node.loadChildren)) {
            this._loadChildren = this.node.loadChildren;
        }
        else {
            fn_utils_1.get(model, 'children', []).forEach(function (child, index) {
                _this._addChild(new Tree(child, _this), index);
            });
        }
        if (!Array.isArray(this._children)) {
            this._children = this.node.loadChildren || isBranch ? [] : null;
        }
    };
    Tree.prototype.hasDeferredChildren = function () {
        return typeof this._loadChildren === 'function';
    };
    /* Setting the children loading state to Loading since a request was dispatched to the client */
    /* Setting the children loading state to Loading since a request was dispatched to the client */
    Tree.prototype.loadingChildrenRequested = /* Setting the children loading state to Loading since a request was dispatched to the client */
    function () {
        this._childrenLoadingState = ChildrenLoadingState.Loading;
    };
    /**
     * Check whether children of the node are being loaded.
     * Makes sense only for nodes that define `loadChildren` function.
     * @returns {boolean} A flag indicating that children are being loaded.
     */
    /**
       * Check whether children of the node are being loaded.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children are being loaded.
       */
    Tree.prototype.childrenAreBeingLoaded = /**
       * Check whether children of the node are being loaded.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children are being loaded.
       */
    function () {
        return this._childrenLoadingState === ChildrenLoadingState.Loading;
    };
    /**
     * Check whether children of the node were loaded.
     * Makes sense only for nodes that define `loadChildren` function.
     * @returns {boolean} A flag indicating that children were loaded.
     */
    /**
       * Check whether children of the node were loaded.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children were loaded.
       */
    Tree.prototype.childrenWereLoaded = /**
       * Check whether children of the node were loaded.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children were loaded.
       */
    function () {
        return this._childrenLoadingState === ChildrenLoadingState.Completed;
    };
    Tree.prototype.canLoadChildren = function () {
        return (this._childrenLoadingState === ChildrenLoadingState.NotStarted &&
            this.foldingType === tree_types_1.FoldingType.Expanded &&
            !!this._loadChildren);
    };
    /**
     * Check whether children of the node should be loaded and not loaded yet.
     * Makes sense only for nodes that define `loadChildren` function.
     * @returns {boolean} A flag indicating that children should be loaded for the current node.
     */
    /**
       * Check whether children of the node should be loaded and not loaded yet.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children should be loaded for the current node.
       */
    Tree.prototype.childrenShouldBeLoaded = /**
       * Check whether children of the node should be loaded and not loaded yet.
       * Makes sense only for nodes that define `loadChildren` function.
       * @returns {boolean} A flag indicating that children should be loaded for the current node.
       */
    function () {
        return !this.childrenWereLoaded() && (!!this._loadChildren || this.node.emitLoadNextLevel === true);
    };
    Object.defineProperty(Tree.prototype, "children", {
        /**
         * Get children of the current tree.
         * @returns {Tree[]} The children of the current tree.
         */
        get: /**
           * Get children of the current tree.
           * @returns {Tree[]} The children of the current tree.
           */
        function () {
            return this._children;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "childrenAsync", {
        /**
         * By getting value from this property you start process of loading node's children using `loadChildren` function.
         * Once children are loaded `loadChildren` function won't be called anymore and loaded for the first time children are emitted in case of subsequent calls.
         * @returns {Observable<Tree[]>} An observable which emits children once they are loaded.
         */
        get: /**
           * By getting value from this property you start process of loading node's children using `loadChildren` function.
           * Once children are loaded `loadChildren` function won't be called anymore and loaded for the first time children are emitted in case of subsequent calls.
           * @returns {Observable<Tree[]>} An observable which emits children once they are loaded.
           */
        function () {
            if (this.canLoadChildren()) {
                return this._childrenAsyncOnce();
            }
            return Observable_1.Observable.of(this.children);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * By calling this method you start process of loading node's children using `loadChildren` function.
     */
    /**
       * By calling this method you start process of loading node's children using `loadChildren` function.
       */
    Tree.prototype.reloadChildren = /**
       * By calling this method you start process of loading node's children using `loadChildren` function.
       */
    function () {
        var _this = this;
        if (this.childrenShouldBeLoaded()) {
            this._childrenLoadingState = ChildrenLoadingState.Loading;
            this._loadChildren(function (children) {
                _this._children = children && children.map(function (child) { return new Tree(child, _this); });
                _this._childrenLoadingState = ChildrenLoadingState.Completed;
            });
        }
    };
    /**
     * By calling this method you will remove all current children of a treee and create new.
     */
    /**
       * By calling this method you will remove all current children of a treee and create new.
       */
    Tree.prototype.setChildren = /**
       * By calling this method you will remove all current children of a treee and create new.
       */
    function (children) {
        var _this = this;
        this._children = children && children.map(function (child) { return new Tree(child, _this); });
        if (this.childrenShouldBeLoaded()) {
            this._childrenLoadingState = ChildrenLoadingState.Completed;
        }
    };
    /**
     * Create a new node in the current tree.
     * @param {boolean} isBranch - A flag that indicates whether a new node should be a "Branch". "Leaf" node will be created by default
     * @param {TreeModel} model - Tree model of the new node which will be inserted. Empty node will be created by default and it will fire edit mode of this node
     * @returns {Tree} A newly created child node.
     */
    /**
       * Create a new node in the current tree.
       * @param {boolean} isBranch - A flag that indicates whether a new node should be a "Branch". "Leaf" node will be created by default
       * @param {TreeModel} model - Tree model of the new node which will be inserted. Empty node will be created by default and it will fire edit mode of this node
       * @returns {Tree} A newly created child node.
       */
    Tree.prototype.createNode = /**
       * Create a new node in the current tree.
       * @param {boolean} isBranch - A flag that indicates whether a new node should be a "Branch". "Leaf" node will be created by default
       * @param {TreeModel} model - Tree model of the new node which will be inserted. Empty node will be created by default and it will fire edit mode of this node
       * @returns {Tree} A newly created child node.
       */
    function (isBranch, model) {
        if (model === void 0) { model = { value: '' }; }
        var tree = new Tree(model, this, isBranch);
        if (!model.id) {
            tree.markAsNew();
        }
        tree.id = tree.id || uuidv4();
        if (this.childrenShouldBeLoaded() && !(this.childrenAreBeingLoaded() || this.childrenWereLoaded())) {
            return null;
        }
        if (this.isLeaf()) {
            return this.addSibling(tree);
        }
        else {
            return this.addChild(tree);
        }
    };
    Object.defineProperty(Tree.prototype, "value", {
        /**
         * Get the value of the current node
         * @returns {(string|RenamableNode)} The value of the node.
         */
        get: /**
           * Get the value of the current node
           * @returns {(string|RenamableNode)} The value of the node.
           */
        function () {
            return this.node.value;
        },
        /**
         * Set the value of the current node
         * @param {(string|RenamableNode)} value - The new value of the node.
         */
        set: /**
           * Set the value of the current node
           * @param {(string|RenamableNode)} value - The new value of the node.
           */
        function (value) {
            if (typeof value !== 'string' && !Tree.isRenamable(value)) {
                return;
            }
            var stringifiedValue = '' + value;
            if (Tree.isRenamable(this.value)) {
                this.node.value = Tree.applyNewValueToRenamable(this.value, stringifiedValue);
            }
            else {
                this.node.value = Tree.isValueEmpty(stringifiedValue) ? this.node.value : stringifiedValue;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "checked", {
        get: function () {
            return !!fn_utils_1.get(this.node.settings, 'checked');
        },
        set: function (checked) {
            this.node.settings = Object.assign({}, this.node.settings, { checked: checked });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "checkedChildren", {
        get: function () {
            return this.hasLoadedChildren() ? this.children.filter(function (child) { return child.checked; }) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "selectionAllowed", {
        get: function () {
            var value = fn_utils_1.get(this.node.settings, 'selectionAllowed');
            return fn_utils_1.isNil(value) ? true : !!value;
        },
        set: function (selectionAllowed) {
            this.node.settings = Object.assign({}, this.node.settings, { selectionAllowed: selectionAllowed });
        },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.hasLoadedChildren = function () {
        return !fn_utils_1.isEmpty(this.children);
    };
    Tree.prototype.loadedChildrenAmount = function () {
        return fn_utils_1.size(this.children);
    };
    Tree.prototype.checkedChildrenAmount = function () {
        return fn_utils_1.size(this.checkedChildren);
    };
    /**
     * Add a sibling node for the current node. This won't work if the current node is a root.
     * @param {Tree} sibling - A node that should become a sibling.
     * @param [number] position - Position in which sibling will be inserted. By default it will be inserted at the last position in a parent.
     * @returns {Tree} A newly inserted sibling, or null if you are trying to make a sibling for the root.
     */
    /**
       * Add a sibling node for the current node. This won't work if the current node is a root.
       * @param {Tree} sibling - A node that should become a sibling.
       * @param [number] position - Position in which sibling will be inserted. By default it will be inserted at the last position in a parent.
       * @returns {Tree} A newly inserted sibling, or null if you are trying to make a sibling for the root.
       */
    Tree.prototype.addSibling = /**
       * Add a sibling node for the current node. This won't work if the current node is a root.
       * @param {Tree} sibling - A node that should become a sibling.
       * @param [number] position - Position in which sibling will be inserted. By default it will be inserted at the last position in a parent.
       * @returns {Tree} A newly inserted sibling, or null if you are trying to make a sibling for the root.
       */
    function (sibling, position) {
        if (Array.isArray(fn_utils_1.get(this.parent, 'children'))) {
            return this.parent.addChild(sibling, position);
        }
        return null;
    };
    /**
     * Add a child node for the current node.
     * @param {Tree} child - A node that should become a child.
     * @param [number] position - Position in which child will be inserted. By default it will be inserted at the last position in a parent.
     * @returns {Tree} A newly inserted child.
     */
    /**
       * Add a child node for the current node.
       * @param {Tree} child - A node that should become a child.
       * @param [number] position - Position in which child will be inserted. By default it will be inserted at the last position in a parent.
       * @returns {Tree} A newly inserted child.
       */
    Tree.prototype.addChild = /**
       * Add a child node for the current node.
       * @param {Tree} child - A node that should become a child.
       * @param [number] position - Position in which child will be inserted. By default it will be inserted at the last position in a parent.
       * @returns {Tree} A newly inserted child.
       */
    function (child, position) {
        var newborn = this._addChild(Tree.cloneTreeShallow(child), position);
        this._setFoldingType();
        if (this.isNodeCollapsed()) {
            this.switchFoldingType();
        }
        return newborn;
    };
    Tree.prototype._addChild = function (child, position) {
        if (position === void 0) { position = fn_utils_1.size(this._children) || 0; }
        child.parent = this;
        if (Array.isArray(this._children)) {
            this._children.splice(position, 0, child);
        }
        else {
            this._children = [child];
        }
        return child;
    };
    /**
     * Moves a given sibling above the this node.
     * If node passed as a parameter is not a sibling - nothing happens.
     * @param {Tree} sibling - A sibling to move
     */
    /**
       * Moves a given sibling above the this node.
       * If node passed as a parameter is not a sibling - nothing happens.
       * @param {Tree} sibling - A sibling to move
       */
    Tree.prototype.moveSiblingAbove = /**
       * Moves a given sibling above the this node.
       * If node passed as a parameter is not a sibling - nothing happens.
       * @param {Tree} sibling - A sibling to move
       */
    function (sibling) {
        if (!this.hasSibling(sibling)) {
            return;
        }
        var siblings = this.parent._children;
        var siblingToMove = siblings.splice(sibling.positionInParent, 1)[0];
        var insertAtIndex = this.positionInParent;
        siblings.splice(insertAtIndex, 0, siblingToMove);
    };
    /**
     * Moves a given sibling below the this node.
     * If node passed as a parameter is not a sibling - nothing happens.
     * @param {Tree} sibling - A sibling to move
     */
    /**
       * Moves a given sibling below the this node.
       * If node passed as a parameter is not a sibling - nothing happens.
       * @param {Tree} sibling - A sibling to move
       */
    Tree.prototype.moveSiblingBelow = /**
       * Moves a given sibling below the this node.
       * If node passed as a parameter is not a sibling - nothing happens.
       * @param {Tree} sibling - A sibling to move
       */
    function (sibling) {
        if (!this.hasSibling(sibling)) {
            return;
        }
        var siblings = this.parent._children;
        var siblingToMove = siblings.splice(sibling.positionInParent, 1)[0];
        var insertAtIndex = this.positionInParent + 1;
        siblings.splice(insertAtIndex, 0, siblingToMove);
    };
    Object.defineProperty(Tree.prototype, "positionInParent", {
        /**
         * Get a node's position in its parent.
         * @returns {number} The position inside a parent.
         */
        get: /**
           * Get a node's position in its parent.
           * @returns {number} The position inside a parent.
           */
        function () {
            if (this.isRoot()) {
                return -1;
            }
            return this.parent.children ? this.parent.children.indexOf(this) : -1;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check whether or not this tree is static.
     * @returns {boolean} A flag indicating whether or not this tree is static.
     */
    /**
       * Check whether or not this tree is static.
       * @returns {boolean} A flag indicating whether or not this tree is static.
       */
    Tree.prototype.isStatic = /**
       * Check whether or not this tree is static.
       * @returns {boolean} A flag indicating whether or not this tree is static.
       */
    function () {
        return fn_utils_1.get(this.node.settings, 'static', false);
    };
    /**
     * Check whether or not this tree has a left menu.
     * @returns {boolean} A flag indicating whether or not this tree has a left menu.
     */
    /**
       * Check whether or not this tree has a left menu.
       * @returns {boolean} A flag indicating whether or not this tree has a left menu.
       */
    Tree.prototype.hasLeftMenu = /**
       * Check whether or not this tree has a left menu.
       * @returns {boolean} A flag indicating whether or not this tree has a left menu.
       */
    function () {
        return !fn_utils_1.get(this.node.settings, 'static', false) && fn_utils_1.get(this.node.settings, 'leftMenu', false);
    };
    /**
     * Check whether or not this tree has a right menu.
     * @returns {boolean} A flag indicating whether or not this tree has a right menu.
     */
    /**
       * Check whether or not this tree has a right menu.
       * @returns {boolean} A flag indicating whether or not this tree has a right menu.
       */
    Tree.prototype.hasRightMenu = /**
       * Check whether or not this tree has a right menu.
       * @returns {boolean} A flag indicating whether or not this tree has a right menu.
       */
    function () {
        return !fn_utils_1.get(this.node.settings, 'static', false) && fn_utils_1.get(this.node.settings, 'rightMenu', false);
    };
    /**
     * Check whether or not this tree should show a drag icon.
     * @returns {boolean} A flag indicating whether or not this tree has a left menu.
     */
    /**
       * Check whether or not this tree should show a drag icon.
       * @returns {boolean} A flag indicating whether or not this tree has a left menu.
       */
    Tree.prototype.hasDragIcon = /**
       * Check whether or not this tree should show a drag icon.
       * @returns {boolean} A flag indicating whether or not this tree has a left menu.
       */
    function () {
        return !fn_utils_1.get(this.node.settings, 'static', false) && fn_utils_1.get(this.node.settings, 'dragIcon', false);
    };
    /**
     * Check whether this tree is "Leaf" or not.
     * @returns {boolean} A flag indicating whether or not this tree is a "Leaf".
     */
    /**
       * Check whether this tree is "Leaf" or not.
       * @returns {boolean} A flag indicating whether or not this tree is a "Leaf".
       */
    Tree.prototype.isLeaf = /**
       * Check whether this tree is "Leaf" or not.
       * @returns {boolean} A flag indicating whether or not this tree is a "Leaf".
       */
    function () {
        return !this.isBranch();
    };
    Object.defineProperty(Tree.prototype, "menuItems", {
        /**
         * Get menu items of the current tree.
         * @returns {NodeMenuItem[]} The menu items of the current tree.
         */
        get: /**
           * Get menu items of the current tree.
           * @returns {NodeMenuItem[]} The menu items of the current tree.
           */
        function () {
            return fn_utils_1.get(this.node.settings, 'menuItems');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check whether or not this tree has a custom menu.
     * @returns {boolean} A flag indicating whether or not this tree has a custom menu.
     */
    /**
       * Check whether or not this tree has a custom menu.
       * @returns {boolean} A flag indicating whether or not this tree has a custom menu.
       */
    Tree.prototype.hasCustomMenu = /**
       * Check whether or not this tree has a custom menu.
       * @returns {boolean} A flag indicating whether or not this tree has a custom menu.
       */
    function () {
        return !this.isStatic() && !!fn_utils_1.get(this.node.settings, 'menuItems', false);
    };
    /**
     * Check whether this tree is "Branch" or not. "Branch" is a node that has children.
     * @returns {boolean} A flag indicating whether or not this tree is a "Branch".
     */
    /**
       * Check whether this tree is "Branch" or not. "Branch" is a node that has children.
       * @returns {boolean} A flag indicating whether or not this tree is a "Branch".
       */
    Tree.prototype.isBranch = /**
       * Check whether this tree is "Branch" or not. "Branch" is a node that has children.
       * @returns {boolean} A flag indicating whether or not this tree is a "Branch".
       */
    function () {
        return this.node.emitLoadNextLevel === true || Array.isArray(this._children);
    };
    /**
     * Check whether this tree has children.
     * @returns {boolean} A flag indicating whether or not this tree has children.
     */
    /**
       * Check whether this tree has children.
       * @returns {boolean} A flag indicating whether or not this tree has children.
       */
    Tree.prototype.hasChildren = /**
       * Check whether this tree has children.
       * @returns {boolean} A flag indicating whether or not this tree has children.
       */
    function () {
        return !fn_utils_1.isEmpty(this._children) || this.childrenShouldBeLoaded();
    };
    /**
     * Check whether this tree is a root or not. The root is the tree (node) that doesn't have parent (or technically its parent is null).
     * @returns {boolean} A flag indicating whether or not this tree is the root.
     */
    /**
       * Check whether this tree is a root or not. The root is the tree (node) that doesn't have parent (or technically its parent is null).
       * @returns {boolean} A flag indicating whether or not this tree is the root.
       */
    Tree.prototype.isRoot = /**
       * Check whether this tree is a root or not. The root is the tree (node) that doesn't have parent (or technically its parent is null).
       * @returns {boolean} A flag indicating whether or not this tree is the root.
       */
    function () {
        return fn_utils_1.isNil(this.parent);
    };
    /**
     * Check whether provided tree is a sibling of the current tree. Sibling trees (nodes) are the trees that have the same parent.
     * @param {Tree} tree - A tree that should be tested on a siblingness.
     * @returns {boolean} A flag indicating whether or not provided tree is the sibling of the current one.
     */
    /**
       * Check whether provided tree is a sibling of the current tree. Sibling trees (nodes) are the trees that have the same parent.
       * @param {Tree} tree - A tree that should be tested on a siblingness.
       * @returns {boolean} A flag indicating whether or not provided tree is the sibling of the current one.
       */
    Tree.prototype.hasSibling = /**
       * Check whether provided tree is a sibling of the current tree. Sibling trees (nodes) are the trees that have the same parent.
       * @param {Tree} tree - A tree that should be tested on a siblingness.
       * @returns {boolean} A flag indicating whether or not provided tree is the sibling of the current one.
       */
    function (tree) {
        return !this.isRoot() && fn_utils_1.includes(this.parent.children, tree);
    };
    /**
     * Check whether provided tree is a child of the current tree.
     * This method tests that provided tree is a <strong>direct</strong> child of the current tree.
     * @param {Tree} tree - A tree that should be tested (child candidate).
     * @returns {boolean} A flag indicating whether provided tree is a child or not.
     */
    /**
       * Check whether provided tree is a child of the current tree.
       * This method tests that provided tree is a <strong>direct</strong> child of the current tree.
       * @param {Tree} tree - A tree that should be tested (child candidate).
       * @returns {boolean} A flag indicating whether provided tree is a child or not.
       */
    Tree.prototype.hasChild = /**
       * Check whether provided tree is a child of the current tree.
       * This method tests that provided tree is a <strong>direct</strong> child of the current tree.
       * @param {Tree} tree - A tree that should be tested (child candidate).
       * @returns {boolean} A flag indicating whether provided tree is a child or not.
       */
    function (tree) {
        return fn_utils_1.includes(this._children, tree);
    };
    /**
     * Remove given tree from the current tree.
     * The given tree will be removed only in case it is a direct child of the current tree (@see {@link hasChild}).
     * @param {Tree} tree - A tree that should be removed.
     */
    /**
       * Remove given tree from the current tree.
       * The given tree will be removed only in case it is a direct child of the current tree (@see {@link hasChild}).
       * @param {Tree} tree - A tree that should be removed.
       */
    Tree.prototype.removeChild = /**
       * Remove given tree from the current tree.
       * The given tree will be removed only in case it is a direct child of the current tree (@see {@link hasChild}).
       * @param {Tree} tree - A tree that should be removed.
       */
    function (tree) {
        if (!this.hasChildren()) {
            return;
        }
        var childIndex = this._children.findIndex(function (child) { return child === tree; });
        if (childIndex >= 0) {
            this._children.splice(childIndex, 1);
        }
        this._setFoldingType();
    };
    /**
     * Remove current tree from its parent.
     */
    /**
       * Remove current tree from its parent.
       */
    Tree.prototype.removeItselfFromParent = /**
       * Remove current tree from its parent.
       */
    function () {
        if (!this.parent) {
            return;
        }
        this.parent.removeChild(this);
    };
    /**
     * Switch folding type of the current tree. "Leaf" node cannot switch its folding type cause it doesn't have children, hence nothing to fold.
     * If node is a "Branch" and it is expanded, then by invoking current method state of the tree should be switched to "collapsed" and vice versa.
     */
    /**
       * Switch folding type of the current tree. "Leaf" node cannot switch its folding type cause it doesn't have children, hence nothing to fold.
       * If node is a "Branch" and it is expanded, then by invoking current method state of the tree should be switched to "collapsed" and vice versa.
       */
    Tree.prototype.switchFoldingType = /**
       * Switch folding type of the current tree. "Leaf" node cannot switch its folding type cause it doesn't have children, hence nothing to fold.
       * If node is a "Branch" and it is expanded, then by invoking current method state of the tree should be switched to "collapsed" and vice versa.
       */
    function () {
        if (this.isLeaf() || !this.hasChildren()) {
            return;
        }
        this.disableCollapseOnInit();
        this.node._foldingType = this.isNodeExpanded() ? tree_types_1.FoldingType.Collapsed : tree_types_1.FoldingType.Expanded;
    };
    /**
     * Check that tree is expanded.
     * @returns {boolean} A flag indicating whether current tree is expanded. Always returns false for the "Leaf" tree and for an empty tree.
     */
    /**
       * Check that tree is expanded.
       * @returns {boolean} A flag indicating whether current tree is expanded. Always returns false for the "Leaf" tree and for an empty tree.
       */
    Tree.prototype.isNodeExpanded = /**
       * Check that tree is expanded.
       * @returns {boolean} A flag indicating whether current tree is expanded. Always returns false for the "Leaf" tree and for an empty tree.
       */
    function () {
        return this.foldingType === tree_types_1.FoldingType.Expanded;
    };
    /**
     * Check that tree is collapsed.
     * @returns {boolean} A flag indicating whether current tree is collapsed. Always returns false for the "Leaf" tree and for an empty tree.
     */
    /**
       * Check that tree is collapsed.
       * @returns {boolean} A flag indicating whether current tree is collapsed. Always returns false for the "Leaf" tree and for an empty tree.
       */
    Tree.prototype.isNodeCollapsed = /**
       * Check that tree is collapsed.
       * @returns {boolean} A flag indicating whether current tree is collapsed. Always returns false for the "Leaf" tree and for an empty tree.
       */
    function () {
        return this.foldingType === tree_types_1.FoldingType.Collapsed;
    };
    /**
     * Set a current folding type: expanded, collapsed or leaf.
     */
    /**
       * Set a current folding type: expanded, collapsed or leaf.
       */
    Tree.prototype._setFoldingType = /**
       * Set a current folding type: expanded, collapsed or leaf.
       */
    function () {
        if (this.childrenShouldBeLoaded()) {
            this.node._foldingType = tree_types_1.FoldingType.Collapsed;
        }
        else if (this._children && !fn_utils_1.isEmpty(this._children)) {
            this.node._foldingType = this.isCollapsedOnInit() ? tree_types_1.FoldingType.Collapsed : tree_types_1.FoldingType.Expanded;
        }
        else if (Array.isArray(this._children)) {
            this.node._foldingType = tree_types_1.FoldingType.Empty;
        }
        else {
            this.node._foldingType = tree_types_1.FoldingType.Leaf;
        }
    };
    Object.defineProperty(Tree.prototype, "foldingType", {
        /**
         * Get a current folding type: expanded, collapsed or leaf.
         * @returns {FoldingType} A folding type of the current tree.
         */
        get: /**
           * Get a current folding type: expanded, collapsed or leaf.
           * @returns {FoldingType} A folding type of the current tree.
           */
        function () {
            if (!this.node._foldingType) {
                this._setFoldingType();
            }
            return this.node._foldingType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "foldingCssClass", {
        /**
         * Get a css class for element which displayes folding state - expanded, collapsed or leaf
         * @returns {string} A string icontaining css class (classes)
         */
        get: /**
           * Get a css class for element which displayes folding state - expanded, collapsed or leaf
           * @returns {string} A string icontaining css class (classes)
           */
        function () {
            return this.getCssClassesFromSettings() || this.foldingType.cssClass;
        },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.getCssClassesFromSettings = function () {
        if (!this.node._foldingType) {
            this._setFoldingType();
        }
        if (this.node._foldingType === tree_types_1.FoldingType.Collapsed) {
            return fn_utils_1.get(this.node.settings, 'cssClasses.collapsed', null);
        }
        else if (this.node._foldingType === tree_types_1.FoldingType.Expanded) {
            return fn_utils_1.get(this.node.settings, 'cssClasses.expanded', null);
        }
        else if (this.node._foldingType === tree_types_1.FoldingType.Empty) {
            return fn_utils_1.get(this.node.settings, 'cssClasses.empty', null);
        }
        return fn_utils_1.get(this.node.settings, 'cssClasses.leaf', null);
    };
    Object.defineProperty(Tree.prototype, "nodeTemplate", {
        /**
         * Get a html template to render before every node's name.
         * @returns {string} A string representing a html template.
         */
        get: /**
           * Get a html template to render before every node's name.
           * @returns {string} A string representing a html template.
           */
        function () {
            return this.getTemplateFromSettings();
        },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.getTemplateFromSettings = function () {
        if (this.isLeaf()) {
            return fn_utils_1.get(this.node.settings, 'templates.leaf', '');
        }
        else {
            return fn_utils_1.get(this.node.settings, 'templates.node', '');
        }
    };
    Object.defineProperty(Tree.prototype, "leftMenuTemplate", {
        /**
         * Get a html template to render for an element activatin left menu of a node.
         * @returns {string} A string representing a html template.
         */
        get: /**
           * Get a html template to render for an element activatin left menu of a node.
           * @returns {string} A string representing a html template.
           */
        function () {
            if (this.hasLeftMenu()) {
                return fn_utils_1.get(this.node.settings, 'templates.leftMenu', '<span></span>');
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tree.prototype, "dragTemplate", {
        get: function () {
            return fn_utils_1.get(this.node.settings, 'templates.dragIcon', '<span></span>');
        },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.disableCollapseOnInit = function () {
        if (this.node.settings) {
            this.node.settings.isCollapsedOnInit = false;
        }
    };
    Tree.prototype.isCollapsedOnInit = function () {
        return !!fn_utils_1.get(this.node.settings, 'isCollapsedOnInit');
    };
    Tree.prototype.keepNodesInDOM = function () {
        return fn_utils_1.get(this.node.settings, 'keepNodesInDOM');
    };
    /**
     * Check that current tree is newly created (added by user via menu for example). Tree that was built from the TreeModel is not marked as new.
     * @returns {boolean} A flag whether the tree is new.
     */
    /**
       * Check that current tree is newly created (added by user via menu for example). Tree that was built from the TreeModel is not marked as new.
       * @returns {boolean} A flag whether the tree is new.
       */
    Tree.prototype.isNew = /**
       * Check that current tree is newly created (added by user via menu for example). Tree that was built from the TreeModel is not marked as new.
       * @returns {boolean} A flag whether the tree is new.
       */
    function () {
        return this.node._status === tree_types_1.TreeStatus.New;
    };
    Object.defineProperty(Tree.prototype, "id", {
        get: function () {
            return fn_utils_1.get(this.node, 'id');
        },
        set: function (id) {
            this.node.id = id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Mark current tree as new (@see {@link isNew}).
     */
    /**
       * Mark current tree as new (@see {@link isNew}).
       */
    Tree.prototype.markAsNew = /**
       * Mark current tree as new (@see {@link isNew}).
       */
    function () {
        this.node._status = tree_types_1.TreeStatus.New;
    };
    /**
     * Check that current tree is being renamed (it is in the process of its value renaming initiated by a user).
     * @returns {boolean} A flag whether the tree is being renamed.
     */
    /**
       * Check that current tree is being renamed (it is in the process of its value renaming initiated by a user).
       * @returns {boolean} A flag whether the tree is being renamed.
       */
    Tree.prototype.isBeingRenamed = /**
       * Check that current tree is being renamed (it is in the process of its value renaming initiated by a user).
       * @returns {boolean} A flag whether the tree is being renamed.
       */
    function () {
        return this.node._status === tree_types_1.TreeStatus.IsBeingRenamed;
    };
    /**
     * Mark current tree as being renamed (@see {@link isBeingRenamed}).
     */
    /**
       * Mark current tree as being renamed (@see {@link isBeingRenamed}).
       */
    Tree.prototype.markAsBeingRenamed = /**
       * Mark current tree as being renamed (@see {@link isBeingRenamed}).
       */
    function () {
        this.node._status = tree_types_1.TreeStatus.IsBeingRenamed;
    };
    /**
     * Check that current tree is modified (for example it was renamed).
     * @returns {boolean} A flag whether the tree is modified.
     */
    /**
       * Check that current tree is modified (for example it was renamed).
       * @returns {boolean} A flag whether the tree is modified.
       */
    Tree.prototype.isModified = /**
       * Check that current tree is modified (for example it was renamed).
       * @returns {boolean} A flag whether the tree is modified.
       */
    function () {
        return this.node._status === tree_types_1.TreeStatus.Modified;
    };
    /**
     * Mark current tree as modified (@see {@link isModified}).
     */
    /**
       * Mark current tree as modified (@see {@link isModified}).
       */
    Tree.prototype.markAsModified = /**
       * Mark current tree as modified (@see {@link isModified}).
       */
    function () {
        this.node._status = tree_types_1.TreeStatus.Modified;
    };
    /**
     * Makes a clone of an underlying TreeModel instance
     * @returns {TreeModel} a clone of an underlying TreeModel instance
     */
    /**
       * Makes a clone of an underlying TreeModel instance
       * @returns {TreeModel} a clone of an underlying TreeModel instance
       */
    Tree.prototype.toTreeModel = /**
       * Makes a clone of an underlying TreeModel instance
       * @returns {TreeModel} a clone of an underlying TreeModel instance
       */
    function () {
        var model = fn_utils_1.defaultsDeep(this.isLeaf() ? {} : { children: [] }, this.node);
        if (this.children) {
            this.children.forEach(function (child) {
                model.children.push(child.toTreeModel());
            });
        }
        return model;
    };
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=tree.js.map