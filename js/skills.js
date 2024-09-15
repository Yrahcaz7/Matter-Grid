const SKILLS = {
	raw: {
		data: [{
			name: "Stronger Clicks",
			desc: "Adds 10% click power mult",
			cost: 1,
		}, {
			name: "Even Stronger Clicks",
			desc: "Adds 15% click power mult",
			cost: 2,
		}, {
			name: "Bloated Clicks",
			desc: "Adds 20% click power mult",
			cost: 4,
		}, {
			name: "Oversized Clicks",
			desc: "Adds 25% click power mult",
			cost: 8,
		}],
		pos(index) {return [0 - (index * 12 + 22), -5]},
		lines(index) {return [{x: 0 - (index * 12 + 12)}]},
	},
	mir: {
		data: [{
			name: "Reflection",
			desc: "Adds " + format(0.05) + " mirror power",
			cost: 2,
			req: [["raw", 0], ["band", 0]],
		}, {
			name: "Stronger Mirroring",
			desc: "Adds " + format(0.1) + " mirror power",
			cost: 4,
			req: [["raw", 1], ["band", 1]],
		}, {
			name: "Reinforced Reflection",
			desc: "Adds " + format(0.15) + " mirror power",
			cost: 8,
			req: [["raw", 2], ["band", 2]],
		}],
		pos(index) {return [0 - (index * 12 + 22), 0 - (index * 12 + 22)]},
		lines(index) {return [
			{x: 0 - (index * 12 + 12), y: 0 - (index * 12 + 11), size: 3, rot: 45},
			{x: 0 - (index * 12 + 18), y: 0 - (index * 6 + 8.5), size: index * 12 + 7, rot: 90},
			{x: 0 - (index * 6 + 9.5), y: 0 - (index * 12 + 17), size: index * 12 + 7},
		]},
		unlocked() {return hasMilestone(0)},
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
		}, {
			name: "Enhanced Band Power",
			desc: "Makes all band types worth 2x as much",
			cost: 20,
		}, {
			name: "???",
			desc: "Coming Soon",
			cost: 999,
		}],
		pos(index) {return [-5, 0 - (index * 12 + 22)]},
		lines(index) {return [{x: -1, y: 0 - (index * 12 + 11), rot: 90}]},
	},
	rhom: {
		data: [{
			name: "Cascading Area",
			desc: "Adds 5% of adjacent power as rhombus power",
			cost: 2,
			req: [["band", 0], ["adj", 0]],
		}, {
			name: "Stronger Rhombus",
			desc: "Adds 10% of adjacent power as rhombus power",
			cost: 4,
			req: [["band", 1], ["adj", 1]],
		}, {
			name: "Adjacent Linking",
			desc: "Adds 15% of adjacent power as rhombus power",
			cost: 8,
			req: [["band", 2], ["adj", 2]],
		}],
		pos(index) {return [index * 12 + 12, 0 - (index * 12 + 22)]},
		lines(index) {return [
			{x: index * 12 + 10, y: 0 - (index * 12 + 11), size: 3, rot: 135},
			{x: index * 6 + 7.5, y: 0 - (index * 12 + 17), size: index * 12 + 7},
			{x: index * 12 + 16, y: 0 - (index * 6 + 8.5), size: index * 12 + 7, rot: 90},
		]},
		unlocked() {return hasMilestone(0)},
	},
	adj: {
		data: [{
			name: "Larger Area",
			desc: "Adds 5% of click power as adjacent power",
			cost: 1,
		}, {
			name: "Stronger Link",
			desc: "Adds 10% of click power as adjacent power",
			cost: 2,
		}, {
			name: "Adjacent Advantage",
			desc: "Adds 15% of click power as adjacent power",
			cost: 4,
		}, {
			name: "Secondary Power",
			desc: "Adds 20% of click power as adjacent power",
			cost: 8,
		}],
		pos(index) {return [index * 12 + 12, -5]},
		lines(index) {return [{x: index * 12 + 10}]},
	},
	adjsp: {
		data: [{
			name: "Leftover Area",
			desc: "Adds 1% of click power as adjacent power per unspent SP",
			cost: 2,
			req: [["adj", 0], ["sp", 0]],
		}, {
			name: "Liquid Links",
			desc: "Adds 2% of click power as adjacent power per unspent SP",
			cost: 4,
			req: [["adj", 1], ["sp", 1]],
		}, {
			name: "Adjacent Experience",
			desc: "Adds 3% of click power as adjacent power per unspent SP",
			cost: 8,
			req: [["adj", 2], ["sp", 2]],
		}],
		pos(index) {return [index * 12 + 12, index * 12 + 12]},
		lines(index) {return [
			{x: index * 12 + 10, y: index * 12 + 11, size: 3, rot: 45},
			{x: index * 12 + 16, y: index * 6 + 8.5, size: index * 12 + 7, rot: 90},
			{x: index * 6 + 7.5, y: index * 12 + 17, size: index * 12 + 7},
		]},
		unlocked() {return hasMilestone(0)},
	},
	sp: {
		data: [{
			name: "Skill Growth",
			desc: "Adds 20% skill point mult",
			cost: 1,
		}, {
			name: "Skill Training",
			desc: "Adds 25% skill point mult",
			cost: 2,
		}, {
			name: "Skill Enhancement",
			desc: "Adds 30% skill point mult",
			cost: 4,
		}, {
			name: "Skill Inflation",
			desc: "Adds 35% skill point mult",
			cost: 8,
		}],
		pos(index) {return [-5, index * 12 + 12]},
		lines(index) {return [{x: -1, y: index * 12 + 11, rot: 90}]},
	},
	rawsp: {
		data: [{
			name: "Leftover Clicks",
			desc: "Adds 2% click power mult per unspent SP",
			cost: 2,
			req: [["sp", 0], ["raw", 0]],
		}, {
			name: "Oozing Clicks",
			desc: "Adds 3% click power mult per unspent SP",
			cost: 4,
			req: [["sp", 1], ["raw", 1]],
		}, {
			name: "Skilled Clicks",
			desc: "Adds 4% click power mult per unspent SP",
			cost: 8,
			req: [["sp", 2], ["raw", 2]],
		}],
		pos(index) {return [0 - (index * 12 + 22), index * 12 + 12]},
		lines(index) {return [
			{x: 0 - (index * 12 + 12), y: index * 12 + 11, size: 3, rot: 135},
			{x: 0 - (index * 6 + 9.5), y: index * 12 + 17, size: index * 12 + 7},
			{x: 0 - (index * 12 + 18), y: index * 6 + 8.5, size: index * 12 + 7, rot: 90},
		]},
		unlocked() {return hasMilestone(0)},
	},
};

/**
 * Gets the dynamic style of the skill tree.
 */
function getSkillTreeStyle() {
	let maxPathLength = 0;
	for (const path in SKILLS) {
		if (SKILLS.hasOwnProperty(path)) {
			if (SKILLS[path].data.length > maxPathLength) maxPathLength = SKILLS[path].data.length;
		};
	};
	let scale = Math.round((0.75 * (4 / 3) ** (game.skillZoom / 3) * 1e12)) / 1e12;
	let size = (maxPathLength + 1) * 24 * scale;
	return "width: " + size + "em; height: " + size + "em; transform: scale(" + scale + ", " + scale + ")";
};

/**
 * Centers the skill tree display.
 */
function centerSkillTree() {
	if (gridAnimation.on || resetAnimation.on) return;
	if (document.getElementById("skillContainer") && document.getElementById("skillTree")) {
		document.getElementById("skillContainer").scrollLeft = (document.getElementById("skillTree").offsetWidth - document.getElementById("skillContainer").offsetWidth) / 2;
		document.getElementById("skillContainer").scrollTop = (document.getElementById("skillTree").offsetHeight - document.getElementById("skillContainer").offsetHeight) / 2;
	};
};

/**
 * Zooms the skill tree display.
 * @param {boolean} out - if true, zooms out, not in.
 */
function zoomSkillTree(out = false) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (document.getElementById("skillContainer")) {
		let size = [document.getElementById("skillContainer").offsetWidth / 2, document.getElementById("skillContainer").offsetHeight / 2];
		if (out) {
			if (game.skillZoom <= -20) return;
			game.skillZoom--;
			document.getElementById("skillTree").style = getSkillTreeStyle();
			document.getElementById("skillContainer").scrollLeft = (document.getElementById("skillContainer").scrollLeft + size[0]) / (4 / 3) ** (1 / 3) - size[0];
			document.getElementById("skillContainer").scrollTop = (document.getElementById("skillContainer").scrollTop + size[1]) / (4 / 3) ** (1 / 3) - size[1];
		} else {
			if (game.skillZoom >= 20) return;
			game.skillZoom++;
			document.getElementById("skillTree").style = getSkillTreeStyle();
			document.getElementById("skillContainer").scrollLeft = (document.getElementById("skillContainer").scrollLeft + size[0]) * (4 / 3) ** (1 / 3) - size[0];
			document.getElementById("skillContainer").scrollTop = (document.getElementById("skillContainer").scrollTop + size[1]) * (4 / 3) ** (1 / 3) - size[1];
		};
		document.getElementById("zoomOut").className = (game.skillZoom <= -20 ? "off" : "");
		document.getElementById("zoomIn").className = (game.skillZoom >= 20 ? "off" : "");
	};
};

/**
 * Resets the zoom and scroll of the skill tree display.
 */
function resetSkillTreeZoom() {
	if (gridAnimation.on || resetAnimation.on) return;
	game.skillZoom = 0;
	document.getElementById("skillTree").style = getSkillTreeStyle();
	centerSkillTree();
	document.getElementById("zoomOut").className = "";
	document.getElementById("zoomIn").className = "";
};

/**
 * Adjusts the skill UI appropriately.
 */
function adjustSkillUI() {
	if (document.getElementById("skillContainer")) {
		let skillUI = document.getElementsByClassName("skillUI");
		if (skillUI.length) {
			let width = 0;
			for (let index = 0; index < skillUI.length; index++) {
				width += skillUI[index].offsetWidth;
			};
			if (document.getElementById("skillContainer").offsetWidth + 15 < width) {
				let respec = skillUI[0].children[0];
				if (respec) {
					skillUI[1].innerHTML += "<div class='skillUI' style='right: 10px; padding: 0'>" + respec.outerHTML + "</div>";
					skillUI[0].removeChild(respec);
				};
			} else {
				let respec = skillUI[1].children[2];
				if (respec) {
					skillUI[0].innerHTML += respec.innerHTML;
					skillUI[1].removeChild(respec);
				};
			};
		};
	};
};

/**
 * Checks the unlock status of a skill specified by its path and index.
 * @param {string} path - the path of the skill to check.
 * @param {number} index - the index of the skill to check.
 */
function skillUnlocked(path, index) {
	if (typeof SKILLS[path].unlocked == "function" && !SKILLS[path].unlocked()) return false;
	if (index > 0 && !hasSkill(path, index - 1)) return false;
	for (let num = 0; num < SKILLS[path].data[index].req?.length; num++) {
		if (!hasSkill(...SKILLS[path].data[index].req[num])) return false;
	};
	return true;
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
 * Gets the number of skills the player has on a specified path.
 * @param {string} path - the path to get the number of skills from.
 */
function getSkillsOnPath(path) {
	let skills = 0;
	for (let index = 0; index < SKILLS[path].data.length; index++) {
		if (hasSkill(path, index)) skills++;
	};
	return skills;
};

/**
 * Buys a skill specified by its path and index.
 * @param {string} path - the path of the skill to check.
 * @param {number} index - the index of the skill to check.
 */
function buySkill(path, index) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (skillUnlocked(path, index) && !hasSkill(path, index) && SP.getTotal() - SP.getSpent() >= SKILLS[path].data[index].cost) {
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
	 * Gets the player's skill point multiplier.
	 */
	getMult() {
		let mult = 1;
		if (hasSkill("sp", 0)) mult += 0.2;
		if (hasSkill("sp", 1)) mult += 0.25;
		if (hasSkill("sp", 2)) mult += 0.3;
		if (hasSkill("sp", 3)) mult += 0.35;
		if (game.resetPoints > 0) mult *= RP.getEff();
		return mult;
	},
	/**
	 * Gets the player's total skill points.
	 * @param {number} matter - overrides the matter amount in the formula.
	 */
	getTotal(matter = getMatter()) {
		return Math.floor((matter ** 0.5) / 2 * SP.getMult());
	},
	/**
	 * Gets the amount of matter required for the previous skill point.
	 * @param {number} matter - overrides the matter amount in the formula.
	 */
	getPrevAt(matter = getMatter()) {
		let amt = SP.getTotal(matter);
		return Math.ceil((amt / SP.getMult() * 2) ** 2);
	},
	/**
	 * Gets the amount of matter required for the next skill point.
	 * @param {number} matter - overrides the matter amount in the formula.
	 */
	getNextAt(matter = getMatter()) {
		let amt = SP.getTotal(matter) + 1;
		return Math.ceil((amt / SP.getMult() * 2) ** 2);
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
			element.innerHTML = "<div>Are you sure you want to respec?<br>You will lose all bought skills but regain all spent skill points.</div>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_respec_no")) {
			let element = document.createElement("button");
			element.id = "confirm_respec_no";
			element.tabIndex = -1;
			element.innerHTML = "No";
			element.onclick = () => document.getElementById("confirm_respec").remove();
			document.getElementById("confirm_respec").append(element);
		};
		if (!document.getElementById("confirm_respec_yes")) {
			let element = document.createElement("button");
			element.id = "confirm_respec_yes";
			element.tabIndex = -1;
			element.innerHTML = "Yes";
			element.onclick = () => {
				game.skills = {};
				game.respecProg = 0;
				update(true);
			};
			document.getElementById("confirm_respec").append(element);
		};
	},
};

window.addEventListener("resize", adjustSkillUI);
