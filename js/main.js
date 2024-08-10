const TABS = ["Stats", "Settings"];

let game = {
	grid: [],
	layer: [[0, 0]],
	tab: TABS[0],
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
 * Gets the player's click power.
 */
function getClickPower() {
	let power = 0.1;
	return 0.1;
};

/**
 * Clicks the node with the specified row and column in the active tier 0 layer.
 * @param {number} row - the row of the node to click.
 * @param {number} col - the column of the node to click.
 */
function clickNode(row, col) {
	let value = game.grid[0][row][col] + getClickPower();
	game.grid[0][row][col] = Math.min(Math.round(value * 1e12) / 1e12, 1);
	update();
};

/**
 * Changes the current tab to the tab of the specified index.
 * @param {number} index - the index of the tab to change to.
 */
function changeTab(index) {
	game.tab = TABS[index];
	update();
};

/**
 * Returns a whole number formatted as a string.
 * @param {number} num - the number to format.
 * @returns {string}
 */
function format(num) {
	let str = (+num).toFixed();
	if (str.charAt(0) == "-") return "-" + format(str.slice(1));
	if (str.length > 9 || num >= 1e12) return (+num).toExponential(3).replace("+", "");
	if (str.length > 6) return str.slice(0, -6) + "," + str.slice(-6, -3) + "," + str.slice(-3);
	if (str.length > 3) return str.slice(0, -3) + "," + str.slice(-3);
	return str;
};

/**
 * Updates the HTML of the page.
 */
function update() {
	let html = "";
	html += "<div id='grid' oncopy='return false' onpaste='return false' oncut='return false'><table>";
	while (!game.grid[game.layer.length]) {
		let arr = getStartLayer();
		if (game.grid.length) arr[0][0] = -1;
		game.grid.push(arr);
	};
	let tier = 0;
	for (; tier < game.layer.length; tier++) {
		if (game.layer[tier].length) break;
	};
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
	html += "</div><div id='main'>";
	if (game.tab == "Stats") {
		let regions = [];
		for (let tier = 0; tier < game.grid.length; tier++) {
			regions[tier] = 0;
			for (let row = 0; row < 12; row++) {
				for (let col = 0; col < 12; col++) {
					if (game.grid[tier][row][col] == 1) regions[tier]++;
				};
			};
		};
		let matter = 0;
		for (let index = 0; index < regions.length; index++) {
			matter += regions[index] * (144 ** index);
		};
		html += "You have a total of " + format(matter) + " matter, which is made out of:";
		for (let index = 0; index < regions.length; index++) {
			html += "<br>" + regions[index] + " " + getTierName(index) + (index > 0 && regions[index] != 1 ? "s" : "");
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
			html += "<br>You are ~" + amt.toFixed(digits) + "% of the way to filling a " + getTierName(index);
			runningTotal += regions[index] * (144 ** index);
		};
	} else if (game.tab == "Settings") {
		html += "Saving Settings<hr>";
		html += "<button onclick='SAVE.wipe()'>Wipe Save</button>";
		html += "<button onclick='SAVE.export()'>Export Save</button>";
		html += "<button onclick='SAVE.import()'>Import Save</button>";
		html += "<button onclick='SAVE.save()'>Save Game</button>";
	};
	html += "</div></div>";
	document.body.innerHTML = html;
};

window.addEventListener("load", () => {
	SAVE.load();
	update();
});
