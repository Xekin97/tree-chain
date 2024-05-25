import { ERROR_PREFIX } from "./constants";
import { recurse } from "./recurse";
import type { CommonObject } from "./types";

function isPropertyKey(key: any): key is PropertyKey {
	return typeof key === "string" || !Number.isNaN(key) || typeof key === "symbol";
}

export class TreeChainNode<Data extends CommonObject> {
	key: PropertyKey = "";
	prevNode?: TreeChainNode<Data>;
	nextNode?: TreeChainNode<Data>;
	parentNode?: TreeChainNode<Data>;
	siblingPrevNode?: TreeChainNode<Data>;
	siblingNextNode?: TreeChainNode<Data>;
	childNodes: TreeChainNode<Data>[] = [];

	detachCallbacks: ((node: TreeChainNode<Data>) => {})[] = [];
	InsertCallbacks: ((node: TreeChainNode<Data>) => {})[] = [];
	destroyCallbacks: ((node: TreeChainNode<Data>) => {})[] = [];

	protected _includeNodes: TreeChainNode<Data>[] = [];
	get includeNodes() {
		this._includeNodes.length = 0;

		this.each((node) => {
			this._includeNodes.push(node);
		});

		return this._includeNodes;
	}

	protected _ancestors: TreeChainNode<Data>[] = [];
	get ancestors() {
		this._ancestors.length = 0;
		this.eachParent((ancestor) => {
			this._ancestors.push(ancestor);
		});
		return this._ancestors;
	}

	get firstAncestor() {
		const length = this._ancestors.length;
		if (length > 0 && this._ancestors[length - 1].parentNode === void 0) {
			return this._ancestors[length - 1];
		} else {
			const ancestors = this.ancestors;
			return ancestors[ancestors.length - 1];
		}
	}

	get tail() {
		let tailNode: TreeChainNode<Data> = this;

		while (tailNode.childNodes.length > 0) {
			tailNode = tailNode.childNodes[tailNode.childNodes.length - 1];
		}

		return tailNode;
	}

	get leaf() {
		return this.childNodes.length === 0;
	}

	get level() {
		let num = 0;

		let parent = this.parentNode;

		while (parent) {
			parent = parent.parentNode;
			num++;
		}

		return num;
	}

	get nodeSize() {
		let size = 1;
		this.each((node) => {
			size += node.childNodes.length;
		});
		return size;
	}

	constructor(public data: Data | null = null, keyName: PropertyKey = "id") {
		if (!data) return;
		if (!isPropertyKey(keyName)) {
			throw new Error(ERROR_PREFIX + `Invalid key name "${String(keyName)}" in data.`);
		}
		if (!isPropertyKey(data[keyName])) {
			throw new Error(ERROR_PREFIX + `Invalid key "${String(data[keyName])}" in data.`);
		}
		this.key = data[keyName];
	}

	protected takeDetachCallbacks() {
		this.detachCallbacks.forEach((cb) => cb(this));
	}

	protected takeInsertCallbacks() {
		this.InsertCallbacks.forEach((cb) => cb(this));
	}

	protected takeDestroyCallbacks() {
		this.destroyCallbacks.forEach((cb) => cb(this));
	}

	onDetach(callback: (node: TreeChainNode<Data>) => {}) {
		this.detachCallbacks.push(callback);
	}
	onInsert(callback: (node: TreeChainNode<Data>) => {}) {
		this.InsertCallbacks.push(callback);
	}
	onDestroy(callback: (node: TreeChainNode<Data>) => {}) {
		this.destroyCallbacks.push(callback);
	}

	each(
		callback: (node: TreeChainNode<Data>, index: number, parent?: TreeChainNode<Data>) => void
	) {
		const node = this as TreeChainNode<Data>;
		recurse([node], "childNodes", (_node, index, parent, native) =>
			callback(native, index, parent)
		);

		return this;
	}

	eachParent(callback: (node: TreeChainNode<Data>) => void) {
		let parent = this.parentNode;

		while (parent) {
			callback(parent);
			parent = parent.parentNode;
		}
	}

	clean() {
		this.prevNode = void 0;
		this.nextNode = void 0;
		this.parentNode = void 0;
		this.childNodes = [];
		this.siblingNextNode = void 0;
		this.siblingPrevNode = void 0;
		return this;
	}

	detach() {
		const oPrevNode = this.prevNode;
		const oSibilingPrevNode = this.siblingPrevNode;
		const oSibilingNextNode = this.siblingNextNode;

		if (oPrevNode) {
			oPrevNode.nextNode = oSibilingNextNode;
		}
		if (oSibilingPrevNode) {
			oSibilingPrevNode.siblingNextNode = oSibilingNextNode;
		}
		if (oSibilingNextNode) {
			oSibilingNextNode.siblingPrevNode = oSibilingPrevNode;
			oSibilingNextNode.prevNode = oPrevNode;
		}
		if (this.parentNode) {
			this.parentNode.childNodes = this.parentNode.childNodes.filter((node) => node !== this);
		}

		this.prevNode = void 0;
		this.parentNode = void 0;
		this.tail.nextNode = void 0;
		this.siblingNextNode = void 0;
		this.siblingPrevNode = void 0;

		this.takeDetachCallbacks();

		return this;
	}

	insertInto(left: TreeChainNode<Data> | null, right: TreeChainNode<Data> | null) {
		const thisTail = this.tail;

		const isSiblingHead = left === null && right !== null && right.siblingPrevNode === void 0;
		const isSiblingTail = left !== null && right === null && left.siblingNextNode === void 0;
		const isRightNextToLeft = left?.nextNode === right;
		const isRightSiblingNextToLeft = left?.siblingNextNode === right;
		const isLeftTheParentOfRight = right?.parentNode === left;
		const isIndependentNode = !this.prevNode && !thisTail.nextNode;

		if (!isIndependentNode) {
			throw new Error(
				ERROR_PREFIX + "This chain node is used to other chain, please detach."
			);
		}

		if (isSiblingHead) {
			this.parentNode = right.parentNode;
			if (this.parentNode) {
				this.prevNode = this.parentNode;
				this.parentNode.childNodes.unshift(this);
			}

			right.prevNode = thisTail;
			thisTail.nextNode = right;

			right.siblingPrevNode = this;
			this.siblingNextNode = right;
		} else if (isSiblingTail) {
			const leftTail = left.tail;

			this.parentNode = left.parentNode;
			if (this.parentNode) {
				this.parentNode.childNodes.push(this);
			}

			leftTail.nextNode = this;
			this.prevNode = leftTail;

			left.siblingNextNode = this;
			this.siblingPrevNode = left;
		} else if (isRightNextToLeft && isRightSiblingNextToLeft) {
			this.parentNode = left.parentNode;

			if (this.parentNode) {
				const index = this.parentNode.childNodes.findIndex((child) => child === left);
				this.parentNode.childNodes.splice(index + 1, 0, this);
			}

			left.nextNode = this;
			this.prevNode = left;

			left.siblingNextNode = this;
			this.siblingPrevNode = left;

			right.prevNode = thisTail;
			thisTail.nextNode = right;

			right.siblingPrevNode = this;
			this.siblingNextNode = right;
		} else if (isRightNextToLeft && isLeftTheParentOfRight) {
			this.parentNode = left;
			this.parentNode.childNodes.unshift(this);

			left.nextNode = this;
			this.prevNode = left;

			right.prevNode = thisTail;
			thisTail.nextNode = right;

			right.siblingPrevNode = this;
			this.siblingNextNode = right;
		} else if (isRightSiblingNextToLeft) {
			this.parentNode = left.parentNode;

			if (this.parentNode) {
				const index = this.parentNode.childNodes.findIndex((child) => child === left);
				this.parentNode.childNodes.splice(index + 1, 0, this);
			}

			const leftTail = left.tail;
			leftTail.nextNode = this;
			this.prevNode = leftTail;

			left.siblingNextNode = this;
			this.siblingPrevNode = left;

			right.prevNode = thisTail;
			thisTail.nextNode = right;

			right.siblingPrevNode = this;
			this.siblingNextNode = right;
		} else if (isRightNextToLeft) {
			this.parentNode = left.parentNode;

			if (this.parentNode) {
				this.parentNode.childNodes.push(this);
			}

			left.siblingNextNode = this;
			this.siblingPrevNode = left;

			const leftTail = left.tail;
			leftTail.nextNode = this;
			this.prevNode = leftTail;

			right.prevNode = thisTail;
			thisTail.nextNode = right;
		} else {
			throw new Error(
				ERROR_PREFIX +
					"Invalid insert because the left node is unrelated to the right node."
			);
		}

		this.takeInsertCallbacks();

		return this;
	}

	insertChild(node: TreeChainNode<Data>) {
		if (!!this.childNodes.length) {
			const right = this.childNodes[0];
			return node.insertInto(this, right);
		}

		return this.addChildIfHasNoChildNodes(node);
	}

	addChild(node: TreeChainNode<Data>) {
		if (!!this.childNodes.length) {
			const left = this.childNodes[this.childNodes.length - 1];
			return node.insertInto(left, null);
		}

		return this.addChildIfHasNoChildNodes(node);
	}

	addChildIfHasNoChildNodes(node: TreeChainNode<Data>) {
		const nodeTail = node.tail;

		if (node.prevNode || nodeTail.nextNode) {
			throw new Error(
				ERROR_PREFIX + "This chain node is used to other chain, please detach."
			);
		}

		node.parentNode = this;
		this.childNodes.push(node);

		if (this.nextNode) {
			this.nextNode.prevNode = nodeTail;
			nodeTail.nextNode = this.nextNode;
			this.nextNode = node;
			node.prevNode = this;
		} else {
			this.nextNode = node;
			node.prevNode = this;
		}

		this.takeInsertCallbacks();

		return this;
	}

	destroy() {
		const needDetach = !!this.prevNode || !!this.tail.nextNode;
		if (needDetach) {
			this.detach();
		}
		this._destroy();
	}

	protected _destroy() {
		this.childNodes.forEach((child) => child._destroy());
		this.data = null;
		this.clean();
		this.takeDestroyCallbacks();
	}
}
