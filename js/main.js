const TABS = ["Stats", "Skills", "Settings"];
const COLORS = ["#10F010", "#10F0F0", "#1010F0", "#F010F0", "#F01010", "#F0F010"];

let game = {
	grid: [],
	layer: [[0, 0]],
	tab: TABS[0],
	skills: {},
	skillZoom: 75,
};

/**
 * Gets the starting state of a normal layer.
 * @returns {number[][]}
 */
function getStartLayer() {
	let arr = [];
	for (let row = 0; row < 12; row++) {
		arr[row] = [];
		for (let col = 0; col < 12; col++) {
			arr[row][col] = 0;
		};
	};
	return arr;
};

/**
 * Goes up to the specified tier.
 * @param {number} tier - the tier to go to.
 */
function goUpToTier(tier) {
	if (!game.layer[tier]) game.layer[tier] = [0, 0];
	for (let index = 0; index < tier; index++) {
		game.layer[index] = [];
	};
	update();
};

/**
 * Completes the layer specified by its tier.
 * @param {number} tier - the tier of the layer to complete.
 */
function completeLayer(tier) {
	game.grid[tier] = getStartLayer();
	game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] = 1;
	goUpToTier(tier + 1);
};

/**
 * Gets the name of the specified tier.
 * @param {number} tier - the tier to get the name of.
 */
function getTierName(tier) {
	if (tier == 0) return "stray matter";
	else return "type-" + String.fromCharCode(64 + tier) + " region";
};

/**
 * Moves a layer specified by its containing tier to the specified coordinates after a confirmation.
 * @param {number} tier - the tier of the layer to move.
 * @param {number} row - the destination row of the movement.
 * @param {number} col - the destination column of the movement.
 */
function moveLayer(tier, row, col) {
	if (!document.getElementById("confirm_move")) {
		let element = document.createElement("dialog");
		element.id = "confirm_move";
		element.innerHTML = "<div><div>Are you sure you want to move your incomplete " + getTierName(tier) + " to " + (col + 1) + "-" + (row + 1) + "-" + String.fromCharCode(64 + tier) + "?</div></div>";
		document.body.append(element);
		element.showModal();
	};
	if (!document.getElementById("confirm_move_no")) {
		let element = document.createElement("button");
		element.id = "confirm_move_no";
		element.innerHTML = "No";
		element.onclick = () => document.getElementById("confirm_move").remove();
		document.getElementById("confirm_move").firstChild.append(element);
	};
	if (!document.getElementById("confirm_move_yes")) {
		let element = document.createElement("button");
		element.id = "confirm_move_yes";
		element.innerHTML = "Yes";
		element.onclick = () => {
			for (let r = 0; r < 12; r++) {
				for (let c = 0; c < 12; c++) {
					if (r == row && c == col) {
						game.grid[tier][r][c] = -1;
					} else if (game.grid[tier][r][c] == -1) {
						game.grid[tier][r][c] = 0;
					};
				};
			};
			update();
		};
		document.getElementById("confirm_move").firstChild.append(element);
	};
};

/**
 * Enters the layer specified by its tier, row, and column.
 * @param {number} tier - the tier of the layer to enter.
 * @param {number} row - the row of the laye to enterr.
 * @param {number} col - the column of the layer to enter.
 */
function enterLayer(tier, row, col) {
	if (game.grid[tier + 1][row][col] < 1) {
		for (let r = 0; r < 12; r++) {
			for (let c = 0; c < 12; c++) {
				if (game.grid[tier + 1][r][c] == -1 && !(r == row && c == col)) {
					moveLayer(tier + 1, row, col);
					return;
				};
			};
		};
		game.grid[tier + 1][row][col] = -1;
	};
	game.layer[tier] = [row, col];
	update();
};

/**
 * Gets the amount of complete nodes in the specified tier.
 * @param {number} tier - the tier to get the node amount from.
 */
function getCompleteNodes(tier) {
	let nodes = 0;
	for (let row = 0; row < 12; row++) {
		for (let col = 0; col < 12; col++) {
			if (game.grid[tier][row][col] == 1) nodes++;
		};
	};
	return nodes;
};

/**
 * Gets the player's matter amount.
 */
function getMatter() {
	let matter = 0;
	for (let tier = 0; tier < game.grid.length; tier++) {
		matter += getCompleteNodes(tier) * (144 ** tier);
	};
	return matter;
};

/**
 * Returns a whole number formatted as a string.
 * @param {number} num - the number to format.
 * @returns {string}
 */
function formatWhole(num) {
	let str = (+num).toFixed();
	if (str.charAt(0) == "-") return "-" + formatWhole(str.slice(1));
	if (str.length > 9 || num >= 1e12) return (+num).toExponential(3).replace("+", "");
	if (str.length > 6) return str.slice(0, -6) + "," + str.slice(-6, -3) + "," + str.slice(-3);
	if (str.length > 3) return str.slice(0, -3) + "," + str.slice(-3);
	return str;
};

/**
 * Returns a number formatted as a string.
 * @param {number} num - the number to format.
 * @returns {string}
 */
function format(num) {
	let places = 4 - (num >= 0.99995 ? 1 : 0) - (num >= 9.9995 ? 1 : 0) - (num >= 99.995 ? 1 : 0) - (num >= 999.95 ? 1 : 0);
	if (places == 0) return formatWhole(num);
	return (+num).toFixed(places);
};

const BAND = {
	/**
	 * Gets the player's amount of a band specified by its tier.
	 * @param {number} tier - the tier of the band effect to get.
	 */
	getAmount(tier) {
		let amt = 0;
		for (let col = 0; col < 12; col++) {
			let row = 0;
			for (; row < 12; row++) {
				if (game.grid[tier][row][col] < 1) break;
			};
			if (row == 12) amt++;
		};
		for (let row = 0; row < 12; row++) {
			let col = 0;
			for (; col < 12; col++) {
				if (game.grid[tier][row][col] < 1) break;
			};
			if (col == 12) amt++;
		};
		for (let index = tier + 1; index < game.grid.length; index++) {
			amt += getCompleteNodes(index) * 24 * (144 ** (index - tier - 1));
		};
		return amt;
	},
	/**
	 * Checks if a band effect specified by its tier is unlocked.
	 * @param {number} tier - the tier of the band effect to check.
	 */
	hasEffect(tier) {
		if (tier == 0) return hasSkill("band", 0);
		if (tier == 1) return hasSkill("band", 1);
		return false;
	},
	/**
	 * Gets a band effect specified by its tier.
	 * @param {number} tier - the tier of the band effect to get.
	 * @param {number} amt - overrides the band amount in the formula.
	 */
	getEffect(tier, amt = BAND.getAmount(tier)) {
		if (tier == 0) return (1 + amt / 4) ** 0.5;
		return 0;
	},
	/**
	 * Gets a band effect description specified by its tier.
	 * @param {number} tier - the tier of the band effect description to get.
	 * @param {number} eff - overrides the band effect in the text.
	 */
	getEffDesc(tier, eff = BAND.getEffect(tier)) {
		if (tier == 0) return "multiplying click power by " + format(eff) + "x";
		return "";
	},
};

/**
 * Gets the player's click power.
 */
function getClickPower() {
	let skillMult = 1;
	if (hasSkill("raw", 0)) skillMult += 0.1;
	if (hasSkill("raw", 1)) skillMult += 0.1;
	let otherMult = 1;
	if (BAND.hasEffect(0)) otherMult += BAND.getEffect(0);
	return 0.1 * skillMult * otherMult;
};

/**
 * Gets the player's adjacent power.
 */
function getAdjacentPower() {
	let skillMult = 0;
	if (hasSkill("area", 0)) skillMult += 0.1;
	if (hasSkill("area", 1)) skillMult += 0.1;
	return getClickPower() * skillMult;
};

/**
 * Clicks the node with the specified row and column in the active tier 0 layer.
 * @param {number} row - the row of the node to click.
 * @param {number} col - the column of the node to click.
 */
function clickNode(row, col) {
	game.grid[0][row][col] = Math.min(Math.round((game.grid[0][row][col] + getClickPower()) * 1e12) / 1e12, 1);
	let adjPow = getAdjacentPower();
	if (adjPow > 0) {
		if (game.grid[0][row - 1]?.length) game.grid[0][row - 1][col] = Math.min(Math.round((game.grid[0][row - 1][col] + adjPow) * 1e12) / 1e12, 1);
		if (game.grid[0][row + 1]?.length) game.grid[0][row + 1][col] = Math.min(Math.round((game.grid[0][row + 1][col] + adjPow) * 1e12) / 1e12, 1);
		if (game.grid[0][row][col - 1] !== undefined) game.grid[0][row][col - 1] = Math.min(Math.round((game.grid[0][row][col - 1] + adjPow) * 1e12) / 1e12, 1);
		if (game.grid[0][row][col + 1] !== undefined) game.grid[0][row][col + 1] = Math.min(Math.round((game.grid[0][row][col + 1] + adjPow) * 1e12) / 1e12, 1);
	};
	update();
};

/**
 * Centers the skill tree display.
 */
function centerSkillTree() {
	if (document.getElementById("skillTree")) {
		document.getElementById("main").scrollLeft = (document.getElementById("skillTree").offsetWidth - document.getElementById("main").offsetWidth + 2) / 2;
		document.getElementById("main").scrollTop = (document.getElementById("skillTree").offsetHeight - document.getElementById("main").offsetHeight + 2) / 2;
	};
};

/**
 * Changes the current tab to the tab of the specified index.
 * @param {number} index - the index of the tab to change to.
 */
function changeTab(index) {
	game.tab = TABS[index];
	update(true);
	if (game.tab == "Skills") centerSkillTree();
};

/**
 * Returns a string colored with a specified tier's color in HTML format.
 * @param {string} str - the string to color.
 * @param {number} tier - the tier to use for coloring.
 */
function colorText(str, tier = -1) {
	return "<span style='color: color-mix(in srgb, var(--txt-color), " + (tier >= 0 ? COLORS[tier % COLORS.length] : "#808080") + ")'>" + str + "</span>";
};

/**
 * Updates the HTML of the page.
 * @param {boolean} resetScroll - if true, resets scroll.
 */
function update(resetScroll = false) {
	let html = "";
	while (!game.grid[game.layer.length]) {
		let arr = getStartLayer();
		if (game.grid.length) arr[0][0] = -1;
		game.grid.push(arr);
	};
	for (const path in SKILLS) {
		if (SKILLS.hasOwnProperty(path)) {
			if (!game.skills[path]) game.skills[path] = [];
		};
	};
	let tier = 0;
	for (; tier < game.layer.length; tier++) {
		if (game.layer[tier].length) break;
	};
	html += "<div id='grid' oncopy='return false' onpaste='return false' oncut='return false'><table style='--tier-color: " + COLORS[tier % COLORS.length] + "80'>";
	for (let col = -1; col < 12; col++) {
		html += "<tr>";
		for (let row = -1; row < 12; row++) {
			if (row < 0 && col < 0) {
				let complete = true;
				check: for (let r = 0; r < 12; r++) {
					for (let c = 0; c < 12; c++) {
						if (game.grid[tier][r][c] < 1) {
							complete = false;
							break check;
						};
					};
				};
				if (complete)  html += "<td onclick='completeLayer(" + tier + ")' style='cursor: pointer'>&larr;</td>";
				else if (game.grid[tier + 1][0][0] == 1) html += "<td onclick='goUpToTier(" + (tier + 1) + ")' style='cursor: pointer'>&larr;</td>";
				else html += "<td>&nbsp;</td>";
			} else if (row < 0) {
				let prog = 1;
				if (game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] == -1) {
					prog = 0;
					for (let r = 0; r < 12; r++) {
						if (game.grid[tier][r][col] == 1) prog++;
					};
					prog /= 12;
				};
				if (prog > 0) html += "<th scope='col'><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
				else html += "<th scope='col'>&nbsp;</th>";
			} else if (col < 0) {
				let prog = 1;
				if (game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] == -1) {
					prog = 0;
					for (let c = 0; c < 12; c++) {
						if (game.grid[tier][row][c] == 1) prog++;
					};
					prog /= 12;
				};
				if (prog > 0) html += "<th><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
				else html += "<th>&nbsp;</th>";
			} else {
				let prog = 1;
				if (game.grid[tier][row][col] == -1) {
					prog = 0;
					for (let r = 0; r < 12; r++) {
						for (let c = 0; c < 12; c++) {
							if (game.grid[tier - 1][r][c] == 1) prog++;
						};
					};
					prog /= 144;
				} else if (game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] == -1) {
					prog = game.grid[tier][row][col];
				};
				html += "<td" + (tier == 0 ?
					(prog < 1 ? " onclick='clickNode(" + row + ", " + col + ")' style='cursor: pointer'" : "")
					: " onclick='enterLayer(" + (tier - 1) + ", " + row + ", " + col + ")' style='cursor: pointer'"
				) + ">";
				if (prog > 0) html += "<div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + "></div>";
				html += "</td>";
			};
		};
		html += "</tr>";
	};
	html += "</table></div><div id='bar'><div id='tabs'>";
	for (let index = 0; index < TABS.length; index++) {
		if (TABS[index] == game.tab) html += "<button class='on'>" + TABS[index] + "</button>";
		else html += "<button onclick='changeTab(" + index + ")'>" + TABS[index] + "</button>";
	};
	html += "</div><div id='main'" + (game.tab == "Skills" ? " style='padding: 0px; overflow: scroll'" : "") + ">";
	if (game.tab == "Stats") {
		let regions = [];
		for (let tier = 0; tier < game.grid.length; tier++) {
			regions[tier] = getCompleteNodes(tier);
		};
		let matter = 0;
		for (let index = 0; index < regions.length; index++) {
			matter += regions[index] * (144 ** index);
		};
		html += "You have a total of " + formatWhole(matter) + " matter, which is made out of:";
		for (let index = 0; index < regions.length; index++) {
			html += "<br>" + colorText(regions[index] + " " + getTierName(index) + (index > 0 && regions[index] != 1 ? "s" : ""), index);
		};
		html += "<br>";
		let runningTotal = 0;
		for (let row = 0; row < 12; row++) {
			for (let col = 0; col < 12; col++) {
				if (game.grid[0][row][col] > 0) runningTotal += game.grid[0][row][col];
			};
		};
		for (let index = 1; index < regions.length; index++) {
			let amt = runningTotal / (144 ** index) * 100;
			let digits = 2 - (amt >= 9.995 ? 1 : 0) - (amt >= 99.95 ? 1 : 0);
			html += "<br>You are " + colorText(amt.toFixed(digits) + "%", index) + " of the way to filling a " + colorText(getTierName(index), index);
			runningTotal += regions[index] * (144 ** index);
		};
		html += "<br>";
		for (let tier = 0; tier < game.grid.length - 1; tier++) {
			let amt = BAND.getAmount(tier);
			html += "<br>You have " + colorText(formatWhole(amt), tier) + " complete bands of " + colorText(getTierName(tier) + (tier > 0 && amt != 1 ? "s" : ""), tier);
			if (BAND.hasEffect(tier)) html += ",<br>which are " + BAND.getEffDesc(tier, BAND.getEffect(tier, amt));
		};
		html += "<br><br>Your click power is " + format(getClickPower());
		let adjPower = getAdjacentPower();
		if (adjPower > 0) html += "<br>Your adjacent power is " + format(adjPower);
	} else if (game.tab == "Skills") {
		let maxPathLength = 0;
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				if (SKILLS[path].data.length > maxPathLength) maxPathLength = SKILLS[path].data.length;
			};
		};
		html += "<div id='skillTree' style='width: " + ((maxPathLength + 1) * 24) + "em; height: " + ((maxPathLength + 1) * 24) + "em; font-size: " + game.skillZoom + "%'>";
		html += "<div id='centerSkillDisplay' class='skill'>";
		let matter = getMatter();
		let skillPoints = SP.getTotal(matter);
		html += "<div>You have " + colorText(formatWhole(skillPoints)) + " " + colorText("skill points (SP)") + ", of which " + colorText(formatWhole(skillPoints - SP.getSpent())) + " are unspent.</div>";
		html += "<div style='flex: 1 1 auto'></div>";
		let next = SP.getNextAt(matter);
		html += "<div>You have " + colorText(formatWhole(matter)) + " out of the " + colorText(formatWhole(next)) + " matter required for the next " + colorText("skill point") + ".</div></div>";
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				for (let index = 0; index < SKILLS[path].data.length; index++) {
					let pos = SKILLS[path].pos(index);
					if (hasSkill(path, index)) {
						let color = "color-mix(in srgb, var(--txt-color), " + COLORS[index % COLORS.length] + ")";
						html += "<button class='skill on' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em); border-color: " + color + "; color: " + color + "'><b>" + SKILLS[path].data[index].name + "</b><br><br>" + SKILLS[path].data[index].desc + "</button>";
					} else {
						html += "<button onclick='buySkill(\"" + path + "\", " + index + ")' class='skill' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em)'><b>" + SKILLS[path].data[index].name + "</b><br>" + SKILLS[path].data[index].desc + "<br><br>Cost: " + colorText(SKILLS[path].data[index].cost + " SP") + "</button>";
					};
				};
			};
		};
		html += "</div></div>";
	} else if (game.tab == "Settings") {
		html += "Saving Settings<hr>";
		html += "<button onclick='SAVE.wipe()'>Wipe Save</button>";
		html += "<button onclick='SAVE.export()'>Export Save</button>";
		html += "<button onclick='SAVE.import()'>Import Save</button>";
		html += "<button onclick='SAVE.save()'>Save Game</button>";
	};
	html += "</div></div>";
	if (resetScroll) {
		document.body.innerHTML = html;
	} else {
		let scrollLeft = document.getElementById("main").scrollLeft;
		let scrollTop = document.getElementById("main").scrollTop;
		document.body.innerHTML = html;
		document.getElementById("main").scrollLeft = scrollLeft;
		document.getElementById("main").scrollTop = scrollTop;
	};
};

window.addEventListener("load", () => {
	SAVE.load();
	update(true);
	if (game.tab == "Skills") centerSkillTree();
});
