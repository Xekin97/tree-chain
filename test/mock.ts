export interface Data {
	id: number;
	name: string;
	children?: Data[];
}

export function simpleCloneData(data: Data) {
	const newone = { ...data };
	data.children = data.children ? (data.children = data.children.map(simpleCloneData)) : void 0;
	return newone;
}

export function simpleCloneDatas(data: Data[]) {
	return [...data.map(simpleCloneData)];
}

export const MOCK_DATA: Data[] = [
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
