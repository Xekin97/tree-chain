import { TreeChain, TreeChainNode } from "../src";
import { Data, MOCK_DATA, simpleCloneData, simpleCloneDatas } from "./mock";

describe("test tree chain", () => {
	const treeChain = TreeChain.create(simpleCloneDatas(MOCK_DATA));

	test("create tree chain node", () => {
		const node = TreeChain.createTreeChainNode(simpleCloneData(MOCK_DATA[0]));
		const nodeTail = node.tail;
		expect(nodeTail.key).toBe(2);
		expect(node.prevNode === undefined).toBe(true);
		expect(nodeTail.nextNode === undefined).toBe(true);
		expect(node.key).toBe(0);
		expect(nodeTail.key).toBe(2);
		expect(node.childNodes.length).toBe(2);
	});

	test("create tree chain", () => {
		const head = treeChain.chain;
		expect(Array.isArray(head.childNodes)).toBe(true);
		expect(head.childNodes.length).toBe(2);
		expect(head.key).toBe(0);
		expect(head.nextNode?.key).toBe(1);
		expect(head.siblingNextNode?.key).toBe(3);
		expect(head.siblingNextNode?.siblingNextNode?.key).toBe(13);
		expect(head.childNodes[0] === head?.nextNode).toBe(true);

		const MOCK_KEYS_SET = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

		let length = 1;
		let lastNode: TreeChainNode<Data> | undefined = head;
		while (lastNode?.nextNode) {
			length++;
			lastNode = lastNode.nextNode;
			MOCK_KEYS_SET.delete(Number(lastNode.key));
		}

		expect(MOCK_KEYS_SET.size).toBe(0);
		expect(lastNode?.key).toBe(13);
		expect(lastNode?.prevNode?.key).toBe(12);

		expect(head?.nextNode?.parentNode === head).toBe(true);
		expect(length).toBe(14);
	});

	test("find node", () => {
		const node = treeChain.findNodeByKey(8);

		expect(node?.data?.name).toBe("san");
		expect(node?.nextNode?.key).toBe(9);
		expect(node?.siblingNextNode?.key).toBe(9);
	});

	test("get nodes by level", () => {
		const level0Nodes = treeChain.getNodesByLevel();

		expect(level0Nodes.length).toBe(3);
		expect(level0Nodes[0].key).toBe(0);
		expect(level0Nodes[1].key).toBe(3);
		expect(level0Nodes[2].key).toBe(13);

		const level1Nodes = treeChain.getNodesByLevel(1);

		expect(level1Nodes.length).toBe(4);
		expect(level1Nodes[0].key).toBe(1);
		expect(level1Nodes[1].key).toBe(2);
		expect(level1Nodes[2].key).toBe(4);
		expect(level1Nodes[3].key).toBe(12);
	});

	test("each chain", () => {
		const idSet = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
		treeChain.each((node) => {
			idSet.delete(Number(node.key));
		});
		expect(idSet.size).toBe(0);
	});

	test("tree chain top nodes", () => {
		expect(treeChain.topLevelNodes.length).toBe(3);
	});

	test("tree chain length", () => {
		expect(treeChain.chainLength).toBe(14);
	});
});

describe("test to handle tree chain", () => {
	const treeChain = TreeChain.create(simpleCloneDatas(MOCK_DATA));

	test("delete and insert node", () => {
		treeChain.deleteNodeByKey(3);

		expect(treeChain.topLevelNodes.length).toBe(2);

		const node = TreeChain.createTreeChainNode(MOCK_DATA[1]);

		treeChain.insertNodeByKey(node, 0);

		expect(treeChain.topLevelNodes.length).toBe(3);

		expect(treeChain.map.get(0)?.siblingNextNode?.key).toBe(3);
		expect(treeChain.map.get(13)?.siblingPrevNode?.key).toBe(3);
	});

	test("delete and insert head node", () => {
		// delete
		treeChain.deleteNodeByKey(0);
		const node0 = treeChain.findNodeByKey(0);
		const node1 = treeChain.findNodeByKey(1);
		const node2 = treeChain.findNodeByKey(2);
		expect(node0 === undefined).toBe(true);
		expect(node1 === undefined).toBe(true);
		expect(node2 === undefined).toBe(true);
		expect(treeChain.chain.key).toBe(3);
		// insert
		const node = TreeChain.createTreeChainNode(simpleCloneData(MOCK_DATA[0]));
		treeChain.insertNodeIntoHead(node);
		expect(treeChain.chain.key).toBe(0);
		expect(treeChain.chain.siblingNextNode?.key).toBe(3);
		expect(treeChain.chain.nextNode?.key).toBe(1);
	});

	test("delete and insert tail node", () => {
		// delete
		treeChain.deleteNodeByKey(13);
		const nodeDeleted = treeChain.findNodeByKey(13);
		expect(nodeDeleted === undefined).toBe(true);
		// insert
		const nodeInserted = TreeChain.createTreeChainNode(simpleCloneData(MOCK_DATA[2]));
		treeChain.insertNodeByKey(nodeInserted, 3);
		const target = treeChain.findNodeByKey(13);
		expect(target?.prevNode?.key).toBe(12);
		expect(target?.siblingPrevNode?.key).toBe(3);
	});

	test("delete and insert node between parent and chlid", () => {
		// delete
		treeChain.deleteNodeByKey(4);
		const nodeDeletedPrev = treeChain.findNodeByKey(3);
		expect(nodeDeletedPrev?.nextNode?.key).toBe(12);
		expect(nodeDeletedPrev?.childNodes.length).toBe(1);
		// insert
		const nodeInserted = TreeChain.createTreeChainNode(
			simpleCloneData(MOCK_DATA[1].children![0])
		); // 4
		treeChain.insertNodeByKey(nodeInserted, 3, true);
		const nodeInsertedNext = treeChain.findNodeByKey(12);
		expect(nodeDeletedPrev?.childNodes.length).toBe(2);
		expect(nodeDeletedPrev?.nextNode?.key).toBe(4);
		expect(nodeDeletedPrev?.nextNode?.nextNode?.key).toBe(5);
		expect(nodeInsertedNext?.prevNode?.key).toBe(11);
	});

	test("move node", () => {
		const NODE_KEY_BE_MOVED = 3;
		const NODE_KEY_BE_INSERTED = 13;
		const nodeBeMoved = treeChain.findNodeByKey(NODE_KEY_BE_MOVED);
		const nodeBeInserted = treeChain.findNodeByKey(NODE_KEY_BE_INSERTED);

		treeChain.moveNodeByKey(NODE_KEY_BE_MOVED, NODE_KEY_BE_INSERTED);

		expect(treeChain.topLevelNodes.length).toBe(3);
		expect(nodeBeMoved?.siblingPrevNode === nodeBeInserted).toBe(true);
		expect(nodeBeInserted?.siblingNextNode === nodeBeMoved).toBe(true);
		expect(treeChain.topLevelNodes[2].key).toBe(3);
		expect(treeChain.topLevelNodes[1].key).toBe(13);

		treeChain.moveNodeByKey(NODE_KEY_BE_MOVED, NODE_KEY_BE_INSERTED, true);

		expect(treeChain.topLevelNodes.length).toBe(2);
		expect(nodeBeMoved?.parentNode === nodeBeInserted).toBe(true);
		expect(nodeBeInserted?.childNodes.length).toBe(1);

		treeChain.moveNodeByKey(3, 0);

		expect(treeChain.topLevelNodes.length).toBe(3);
		expect(treeChain.topLevelNodes[1] === nodeBeMoved).toBe(true);
	});
});

describe("test make array of tree chain", () => {
	const treeChain = TreeChain.create(simpleCloneDatas(MOCK_DATA));

	test("make Array", () => {
		const arr = treeChain.toArray();

		expect(arr.length).toBe(14);
		expect(arr[4].key).toBe(4);
		expect(arr[5].key).toBe(5);
		expect(arr[6].key).toBe(6);
		expect(arr[12].key).toBe(12);
	});
	test("make Array limit count", () => {
		const arr = treeChain.toArray({
			count: 7,
		});

		expect(arr.length).toBe(7);
	});
	test("make Array with startKey", () => {
		const arr = treeChain.toArray({
			startKey: 10,
		});

		expect(arr.length).toBe(4);
		expect(arr[0].key).toBe(10);
		expect(arr[1].key).toBe(11);
		expect(arr[2].key).toBe(12);
		expect(arr[3].key).toBe(13);
	});
	test("make Array with filter", () => {
		const arr = treeChain.toArray({
			filter: (node) => node.level === 0,
		});

		expect(arr.length).toBe(3);
		expect(arr[0].key).toBe(0);
		expect(arr[1].key).toBe(3);
		expect(arr[2].key).toBe(13);
	});
	test("make Array with filter and keep ancestor node if has any descendant", () => {
		const arr = treeChain.toArray({
			filter: (node) => Number(node.key) % 2 === 0,
			keepAncestorsWithChildren: true,
		});

		expect(arr.map((node) => node.key).toString()).toBe("0,2,3,4,5,6,8,9,10,12");
	});
	test("make Array with filter and filter parent node if has no descendant", () => {
		const arr = treeChain.toArray({
			filter: (node) => ![1, 2, 6, 10, 11].includes(Number(node.key)),
			keepParentWithoutChildren: false,
		});

		expect(arr.map((node) => node.key).toString()).toBe("3,4,7,8,12,13");
	});
	test("make Array with sort", () => {
		const arr = treeChain.toArray({
			sort: (a, b) => Number(b.key) - Number(a.key),
		});
		expect(arr.map((node) => node.key).toString()).toBe("13,3,12,4,9,11,10,8,7,5,6,0,2,1");
	});
	test("make Array with conditions", () => {
		const arr = treeChain.toArray({
			filter: (node) => ![6, 9, 10].includes(Number(node.key)),
			keepAncestorsWithChildren: true,
			keepParentWithoutChildren: false,
			sort: (a, b) => Number(b.key) - Number(a.key),
			startKey: 5,
			count: 5,
		});
		expect(arr.map((node) => node.key).toString()).toBe("12,9,11,8,7");
	});
});
