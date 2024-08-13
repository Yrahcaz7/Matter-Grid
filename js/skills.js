const SKILLS = {
	raw: {
		data: [{
			name: "Stronger Clicks",
			desc: "Adds 10% click power",
			cost: 1,
		}, {
			name: "Even Stronger Clicks",
			desc: "Adds 10% click power",
			cost: 2,
		}, {
			name: "Bloated Clicks",
			desc: "Adds 10% click power",
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
	},
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
			game.skillZoom--;
			document.getElementById("skillContainer").scrollLeft = (document.getElementById("skillContainer").scrollLeft + size[0]) / (4 / 3) ** (1 / 3) - size[0];
			document.getElementById("skillContainer").scrollTop = (document.getElementById("skillContainer").scrollTop + size[1]) / (4 / 3) ** (1 / 3) - size[1];
		} else {
			game.skillZoom++;
			document.getElementById("skillContainer").scrollLeft = (document.getElementById("skillContainer").scrollLeft + size[0]) * (4 / 3) ** (1 / 3) - size[0];
			document.getElementById("skillContainer").scrollTop = (document.getElementById("skillContainer").scrollTop + size[1]) * (4 / 3) ** (1 / 3) - size[1];
		};
		update();
	};
};

/**
 * Resets the zoom and scroll of the skill tree display.
 */
function resetSkillTreeZoom() {
	game.skillZoom = 0;
	update(true);
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
