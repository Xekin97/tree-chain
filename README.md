# tree-chain

A data structure in which each tree node is sequentially concatenated into a linked list based on a tree structure for Typescript. Support node inserting, deleting, moving, and supporting flat the tree to an array.

Structure image:

![Structure_Image](https://github.com/Xekin97/tree-chain/assets/25792845/c4bafe01-57f2-435a-b564-9d3fed363d4f)

## start

```
npm install tree-chain
```

## Build

```
npm run build
```

## Usage

### TreeChain<Data>

**Properties**

-   `.map` data map.
-   `.chain` head of tree chain.
-   `.topLevelNodes` return nodes of the top level of the tree.
-   `.chainLength` return the length of the chain.

**methods**

-   `insertNodeIntoHead(node: **TreeChainNode<Data>**)`
-   `insertNodeIntoTarget(node: **TreeChainNode<Data>**, target: TreeChainNode<Data>, isTargetChild = false)`
-   `insertNodeByKey(node: **TreeChainNode<Data>**, key)`
-   `deleteNode(node: **TreeChainNode<Data>**)`
-   `deleteNodeByKey(key)`
-   `moveNode(from: **TreeChainNode<Data>**, to: **TreeChainNode<Data>**)`
-   `moveNodeByKey(fromKey, toKey)`
-   `getNodesByLevel(level = 0)`
-   `each(callback)`
-   `findNodeByKey(key)`
-   `toArray(config: ConfigToArray<Data>)`

**Static methods**

-   `TreeChain.create<TreeData>(source: TreeData[], config?: ConfigCreateTreeChain)`
-   `TreeChain.createTreeChain<TreeData>((source: TreeData[], config?: ConfigCreateTreeChain)`
-   `TreeChain.createTreeChainNode<TreeNodeData>(source: TreeNodeData, config?:ConfigCreateTreeChain)`
-   `TreeChain.findNodeByKeyFromChain(key, chain: TreeChain)`
-   `TreeChain.eachChain(node: **TreeChainNode<Data>**, callback)`
-   `TreeChain.getTreeCHainHeadByNode(node: **TreeChainNode<Data>**)`

### TreeChainNode<Data>

**properties**

-   `.key`
-   `.prevNode`
-   `.nextNode`
-   `.parentNode`
-   `.siblingNextNode`
-   `.childNodes`
-   `.includeNodes`
-   `.ancestors`
-   `.firstAncestor`
-   `.tail`
-   `.leaf`
-   `.level`
-   `.nodeSize`

**methods**

-   `onDetach(callback)`
-   `onInsert(callback)`
-   `onDestroy(callback)`
-   `each(callback)`
-   `eachParent(callback)`
-   `clean`
-   `detach`
-   `insertInto(left: **TreeChainNode<Data>**, right: **TreeChainNode<Data>**)`
-   `insertChild(node: **TreeChainNode<Data>**)`
-   `addChild(node: **TreeChainNode<Data>**)`
-   `addChildIfHasNoChildNodes(node: **TreeChainNode<Data>**)`
-   `destroy`

### Type

#### ConfigToArray

-   `filter?: FilterFn<Data>`
-   `keepAncestorsWithChildren?: boolean`
-   `keepParentWithoutChildren?: boolean`
-   `sort?: SortFn<Data>`
-   `startKey?: PropertyKey`
-   `count?: number`

#### ConfigCreateTreeChain

-   `childrenKey?: PropertyKey`
-   `dataKey?: PropertyKey`

## Example

```typescript
const MOCK_DATA: Data[] = [
	{
		id: 0,
		name: "tom",
		children: [
			{
				id: 1,
				name: "jerry",
			},
			{
				id: 2,
				name: "john",
			},
		],
	},
	{
		id: 3,
		name: "halo",
		children: [
			{
				id: 4,
				name: "rox",
				children: [
					{
						id: 5,
						name: "holy",
						children: [
							{
								id: 6,
								name: "xekin",
							},
						],
					},
					{
						id: 7,
						name: "siri",
					},
					{
						id: 8,
						name: "san",
					},
					{
						id: 9,
						name: "dan",
						children: [
							{
								id: 10,
								name: "danny",
							},
							{
								id: 11,
								name: "ally",
							},
						],
					},
				],
			},
			{
				id: 12,
				name: "neo",
			},
		],
	},
	{
		id: 13,
		name: "belly",
	},
];

const treeChain = TreeChain.create(MOCK_DATA);

const arr = treeChain.toArray({
	filter: (node) => ![6, 9, 10].includes(Number(node.key)),
	keepAncestorsWithChildren: true,
	keepParentWithoutChildren: false,
	sort: (a, b) => Number(b.key) - Number(a.key),
	startKey: 5,
	count: 5,
});

arr.map((node) => node.key.toString());
// [12,9,11,8,7];
```

## TODO

-   finish README.md
-   others...
