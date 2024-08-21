const SKILLS = {
	raw: {
		data: [{
			name: "Stronger Clicks",
			desc: "Adds 10% click power mult",
			cost: 1,
		}, {
			name: "Even Stronger Clicks",
			desc: "Adds 10% click power mult",
			cost: 2,
		}, {
			name: "Bloated Clicks",
			desc: "Adds 10% click power mult",
			cost: 4,
		}],
		pos(index) {return [0 - (index * 12 + 22), -5]},
		line(index) {return [0 - (index * 12 + 12), 0]},
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
		line(index) {return [-1, 0 - (index * 12 + 11), 90]},
	},
	area: {
		data: [{
			name: "Larger Area",
			desc: "Adds 10% of click power as adjacent power",
			cost: 1,
		}, {
			name: "Stronger Link",
			desc: "Adds 10% of click power as adjacent power",
			cost: 2,
		}, {
			name: "Adjacent Advantage",
			desc: "Adds 10% of click power as adjacent power",
			cost: 4,
		}],
		pos(index) {return [index * 12 + 12, -5]},
		line(index) {return [index * 12 + 10, 0]},
	},
	sp: {
		data: [{
			name: "Skill Growth",
			desc: "Adds 20% skill point mult",
			cost: 1,
		}, {
			name: "Skill Training",
			desc: "Adds 20% skill point mult",
			cost: 2,
		}, {
			name: "Skill Enhancement",
			desc: "Adds 20% skill point mult",
			cost: 4,
		}],
		pos(index) {return [-5, index * 12 + 12]},
		line(index) {return [-1, index * 12 + 11, 90]},
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
		document.getElementById("zoomOut").className = (game.skillZoom <= -20 ? "on" : "");
		document.getElementById("zoomIn").className = (game.skillZoom >= 20 ? "on" : "");
	};
};

/**
 * Resets the zoom and scroll of the skill tree display.
 */
function resetSkillTreeZoom() {
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
	 * Gets the player's skill point multiplier.
	 */
	getMult() {
		let mult = 1;
		if (hasSkill("sp", 0)) mult += 0.2;
		if (hasSkill("sp", 1)) mult += 0.2;
		if (hasSkill("sp", 2)) mult += 0.2;
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
