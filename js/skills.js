const SKILLS = {
	raw: {
		data: [{
			name: "Raw Power",
			desc: "Increases click power by +20%",
			cost: 1,
		}, {
			name: "Raw Power 2",
			desc: "Increases click power by +50%",
			cost: 2,
		}],
		style(index) {return "left: calc(50% - " + (index * 12 + 22) + "em); top: calc(50% - 5em)"},
	},
	band: {
		data: [{
			name: "Matter Band Power",
			desc: "Unlocks the " + colorText(getTierName(0), 0) + " band effect",
			cost: 1,
		}, {
			name: "Regional Band Power",
			desc: "Unlocks the " + colorText(getTierName(1), 1) + " band effect",
			cost: 10,
		}],
		style(index) {return "left: calc(50% - 5em); top: calc(50% - " + (index * 12 + 22) + "em)"},
	},
};
