import type { TreeChainNode } from "./tree-chain-node";

export type CommonObject = Record<PropertyKey, any>;

export interface TreeChainNodeDetail<T extends CommonObject> {
	tailNode: TreeChainNode<T>;
	includeNodes: TreeChainNode<T>[];
}

export interface ConfigCreateTreeChain {
	childrenKey?: PropertyKey;
	dataKey?: PropertyKey;
}

export type SortFn<Data extends CommonObject> = (
	a: TreeChainNode<Data>,
	b: TreeChainNode<Data>
) => number;

export type FilterFn<Data extends CommonObject> = (data: TreeChainNode<Data>) => boolean;

export interface ConfigToArray<Data extends CommonObject> {
	filter?: FilterFn<Data>;
	keepAncestorsWithChildren?: boolean;
	keepParentWithoutChildren?: boolean;
	sort?: SortFn<Data>;
	startKey?: PropertyKey;
	count?: number;
}
