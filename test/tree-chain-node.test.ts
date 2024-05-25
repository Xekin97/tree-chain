import { TreeChain } from "../src";
import { MOCK_DATA, simpleCloneData } from "./mock";

describe("test tree chain node", () => {
	const treeChainNode1 = TreeChain.createTreeChainNode(simpleCloneData(MOCK_DATA[1]));
	const treeChainNode2 = TreeChain.createTreeChainNode(simpleCloneData(MOCK_DATA[2]));

	test("node tail", () => {
		expect(treeChainNode1.tail.key).toBe(12);
		expect(treeChainNode2.tail.key).toBe(13);
	});

	test("ancestor nodes", () => {
		expect(
			treeChainNode1.nextNode?.nextNode?.nextNode?.ancestors
				.map((node) => node.key)
				.toString()
		).toBe("5,4,3");
	});

	test("first ancestor", () => {
		expect(treeChainNode1.nextNode?.nextNode?.nextNode?.firstAncestor.key).toBe(3);
	});

	test("include nodes", () => {
		expect(treeChainNode1.includeNodes.length).toBe(10);
		expect(treeChainNode2.includeNodes.length).toBe(1);
	});

	test("leaf", () => {
		expect(treeChainNode1.leaf).toBe(false);
		expect(treeChainNode1.tail.leaf).toBe(true);
		expect(treeChainNode2.leaf).toBe(true);
	});

	test("level", () => {
		expect(treeChainNode1.tail.prevNode?.level).toBe(3);
		expect(treeChainNode2.level).toBe(0);
		expect(treeChainNode2.tail.level).toBe(0);
	});

	test("node size", () => {
		expect(treeChainNode1.nodeSize).toBe(10);
		expect(treeChainNode2.nodeSize).toBe(1);
	});
});
