const SKILLS = {
	raw: {
		data: [{
			name: "Stronger Clicks",
			desc: "Adds +10% click power",
			cost: 1,
		}, {
			name: "Even Stronger Clicks",
			desc: "Adds +10% click power",
			cost: 2,
		}, {
			name: "Bloated Clicks",
			desc: "Adds +10% click power",
			cost: 4,
		}],
		pos(index) {return [0 - (index * 12 + 22), -5]},
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
		pos(index) {return [-5, 0 - (index * 12 + 22)]},
	},
	area: {
		data: [{
			name: "Larger Area",
			desc: "Adds +10% of click power as adjacent power",
			cost: 1,
		}, {
			name: "Stronger Link",
			desc: "Adds +10% of click power as adjacent power",
			cost: 2,
		}, {
			name: "Adjacent Advantage",
			desc: "Adds +10% of click power as adjacent power",
			cost: 4,
		}],
		pos(index) {return [index * 12 + 12, -5]},
	},
};

/**
 * Checks whether the player has a skill specified by its path and index.
 * @param {string} path - the path of the skill to check.
 * @param {number} index - the index of the skill to check.
 */
function hasSkill(path, index) {
	return game.skills[path][index] !== undefined;
};

/**
 * Buys a skill specified by its path and index.
 * @param {string} path - the path of the skill to check.
 * @param {number} index - the index of the skill to check.
 */
function buySkill(path, index) {
	if (game.skills[path][index] === undefined && SP.getTotal() - SP.getSpent() >= SKILLS[path].data[index].cost) {
		game.skills[path][index] = SKILLS[path].data[index].cost;
		update();
	};
};

const SP = {
	/**
	 * Gets the player's spent skill points.
	 */
	getSpent() {
		let spent = 0;
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				for (let index = 0; index < SKILLS[path].data.length; index++) {
					if (game.skills[path][index]) spent += game.skills[path][index];
				};
			};
		};
		return spent;
	},
	/**
	 * Gets the player's total skill points.
	 * @param {number} matter - overrides the matter amount in the formula.
	 */
	getTotal(matter = getMatter()) {
		return Math.floor((matter ** 0.5) / 2);
	},
	/**
	 * Gets the amount of matter required for the next skill point.
	 * @param {number} matter - overrides the matter amount in the formula.
	 */
	getNextAt(matter = getMatter()) {
		let amt = SP.getTotal(matter) + 1;
		return (amt * 2) ** 2;
	},
	/**
	 * Respecs the player's skill points after a confirmation.
	 */
	respec() {
		if (game.respecProg < 100) {
			game.respecProg += 10;
			update();
			return;
		};
		if (!document.getElementById("confirm_respec")) {
			let element = document.createElement("dialog");
			element.id = "confirm_respec";
			element.innerHTML = "<div><div>Are you sure you want to respec?<br>You will lose all bought skills but regain all spent skill points.</div></div>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_respec_no")) {
			let element = document.createElement("button");
			element.id = "confirm_respec_no";
			element.innerHTML = "No";
			element.onclick = () => document.getElementById("confirm_respec").remove();
			document.getElementById("confirm_respec").firstChild.append(element);
		};
		if (!document.getElementById("confirm_respec_yes")) {
			let element = document.createElement("button");
			element.id = "confirm_respec_yes";
			element.innerHTML = "Yes";
			element.onclick = () => {
				game.skills = {};
				game.respecProg = 0;
				update(true);
			};
			document.getElementById("confirm_respec").firstChild.append(element);
		};
	},
};
