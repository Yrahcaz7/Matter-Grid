const gridAnimationLength = 1200;

let gridAnimation = {
	grid: "",
	coords: [],
	on: false,
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
 * Checks if the player has any complete nodes of tier higher than the tier specified.
 * @param {number} tier - the tier to check above.
 */
function hasHigherTier(tier) {
	for (let index = tier + 1; index < game.grid.length; index++) {
		if (game.grid[index][0][0] == 1) return true;
	};
	return false;
};

/**
 * Checks if the player is in an incomplete layer specified by its tier.
 * @param {number} tier 
 */
function isInIncompleteLayer(tier) {
	for (let index = tier + 1; index < game.grid.length; index++) {
		if (game.grid[index][game.layer[index - 1][0]][game.layer[index - 1][1]] >= 0) return false;
	};
	return true;
};

/**
 * Goes up to the specified tier.
 * @param {number} tier - the tier to go to.
 */
function goUpToTier(tier) {
	if (gridAnimation.on || resetAnimation.on) return;
	gridAnimation.grid = document.getElementById("grid").innerHTML;
	for (let index = 0; index < game.layer.length; index++) {
		if (game.layer[index].length > 0) {
			gridAnimation.coords = game.layer[index].slice();
			break;
		};
	};
	gridAnimation.on = true;
	setTimeout(() => {
		document.getElementById("gridAnimation").remove();
		document.getElementById("animationCover").remove();
		gridAnimation.on = false;
	}, gridAnimationLength);
	if (!game.layer[tier]) game.layer[tier] = [0, 0];
	for (let index = 0; index < tier; index++) {
		game.layer[index] = [];
	};
	update();
};

/**
 * Completes the active layer specified by its tier.
 * @param {number} tier - the tier of the layer to complete.
 */
function completeLayer(tier) {
	if (gridAnimation.on || resetAnimation.on) return;
	game.grid[tier] = getStartLayer();
	game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] = 1;
	POWER.clearCache();
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
 * Raises a node's value by a specified amount.
 * @param {number} tier - the tier of the node to raise the value of.
 * @param {number} row - the row of the node to raise the value of.
 * @param {number} col - the column of the node to raise the value of.
 * @param {number} amt - the amount to raise the node's value by.
 */
function raiseNodeValue(tier, row, col, amt) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (game.grid[tier][row]?.length && game.grid[tier][row][col] >= 0) game.grid[tier][row][col] = Math.min(Math.round((game.grid[tier][row][col] + amt) * 1e12) / 1e12, 1);
};

/**
 * Raises a layer's value by a specified amount.
 * @param {number} tier - the tier of the layer to raise the value of.
 * @param {number} row - the row of the layer to raise the value of.
 * @param {number} col - the column of the layer to raise the value of.
 * @param {number} amt - the amount to raise the layer's value by.
 */
function raiseLayerValue(tier, row, col, amt) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (!game.grid[tier][row]?.length || game.grid[tier][row][col] === undefined) return;
	if (game.grid[tier][row][col] >= 0) {
		raiseNodeValue(tier, row, col, amt);
		return;
	};
	amt *= (144 ** tier);
	let coords = [tier, row, col];
	while (amt > 0) {
		let val = game.grid[coords[0]][coords[1]][coords[2]];
		if (val >= 0 && amt >= (1 - val) * (144 ** coords[0])) {
			amt -= (1 - val) * (144 ** coords[0]);
			game.grid[coords[0]][coords[1]][coords[2]] = 1;
			coords[2]++;
			if (coords[2] >= 12) coords = [coords[0], coords[1] + 1, coords[2] - 12];
			if (coords[1] >= 12) coords = [coords[0] + 1, 0, 0];
			if (coords[0] >= tier) {
				game.grid[tier][row][col] = 1;
				for (let index = 0; index < tier; index++) {
					game.grid[index] = getStartLayer();
				};
				break;
			};
		} else if (coords[0] > 0) {
			game.grid[coords[0]][coords[1]][coords[2]] = -1;
			coords = [coords[0] - 1, 0, 0];
		} else {
			raiseNodeValue(0, coords[1], coords[2], amt);
			break;
		};
	};
};

/**
 * Swaps the active layer (specified by its tier, row, and column) to a new layer (specified by its row and column) after a confirmation.
 * @param {number} tier - the tier of the active layer to swap.
 * @param {number} oldRow - the old row of the active layer to swap.
 * @param {number} oldCol - the old column of the active layer to swap.
 * @param {number} newRow - the row to swap the active layer to.
 * @param {number} newCol - the column to swap the active layer to.
 */
function swapActiveLayer(tier, oldRow, oldCol, newRow, newCol) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (!document.getElementById("confirm_move")) {
		let element = document.createElement("dialog");
		element.id = "confirm_move";
		element.innerHTML = "<div>You are currently managing the " + colorText(getTierName(tier), tier) + " at (" + (oldRow + 1) + ", " + (oldCol + 1) + ").<br>Are you sure you want to switch to managing the " + colorText(getTierName(tier), tier) + " at (" + (newRow + 1) + ", " + (newCol + 1) + ")?<br><br>Doing this will compact all matter in your " + colorText(getTierName(tier), tier) + " at (" + (oldRow + 1) + ", " + (oldCol + 1) + "),<br>which may result in fewer bands of tiers lower than tier " + String.fromCharCode(64 + tier) + ".</div>";
		document.body.append(element);
		element.showModal();
	};
	if (!document.getElementById("confirm_move_no")) {
		let element = document.createElement("button");
		element.id = "confirm_move_no";
		element.tabIndex = -1;
		element.innerHTML = "No";
		element.onclick = () => document.getElementById("confirm_move").remove();
		document.getElementById("confirm_move").append(element);
	};
	if (!document.getElementById("confirm_move_yes")) {
		let element = document.createElement("button");
		element.id = "confirm_move_yes";
		element.tabIndex = -1;
		element.innerHTML = "Yes";
		element.onclick = () => {
			let prog = 0;
			for (let checkTier = 0; checkTier < tier; checkTier++) {
				for (let checkRow = 0; checkRow < 12; checkRow++) {
					for (let checkCol = 0; checkCol < 12; checkCol++) {
						if (game.grid[checkTier][checkRow][checkCol] > 0) prog += game.grid[checkTier][checkRow][checkCol] * (144 ** (checkTier - tier));
					};
				};
				game.grid[checkTier] = getStartLayer();
			};
			game.grid[tier][oldRow][oldCol] = Math.round(prog * 1e12) / 1e12;
			let prevProg = game.grid[tier][newRow][newCol];
			game.grid[tier][newRow][newCol] = -1;
			raiseLayerValue(tier, newRow, newCol, prevProg);
			update();
		};
		document.getElementById("confirm_move").append(element);
	};
};

/**
 * Starts a layer specified by its tier, row, and col if able. Else, calls `swapActiveLayer`.
 * @param {number} tier - the tier of the layer to move.
 * @param {number} row - the destination row of the movement.
 * @param {number} col - the destination column of the movement.
 * @returns {boolean} `true` if layer was started, `false` if `swapActiveLayer` was called.
 */
function startLayer(tier, row, col) {
	for (let checkRow = 0; checkRow < 12; checkRow++) {
		for (let checkCol = 0; checkCol < 12; checkCol++) {
			if (game.grid[tier][checkRow][checkCol] == -1 && !(checkRow == row && checkCol == col)) {
				swapActiveLayer(tier, checkRow, checkCol, row, col);
				return false;
			};
		};
	};
	game.grid[tier][row][col] = -1;
	return true;
};

/**
 * Enters the layer specified by its tier, row, and column.
 * @param {number} tier - the tier of the layer to enter.
 * @param {number} row - the row of the layer to enter.
 * @param {number} col - the column of the layer to enter.
 */
function enterLayer(tier, row, col) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (tier > 0 && game.grid[tier][row][col] > 0 && game.grid[tier][row][col] < 1) raiseLayerValue(tier, row, col, game.grid[tier][row][col]);
	game.layer[tier - 1] = [row, col];
	gridAnimation.grid = document.getElementById("grid").innerHTML;
	gridAnimation.coords = [];
	gridAnimation.on = true;
	setTimeout(() => {
		gridAnimation.on = false;
		update();
	}, gridAnimationLength);
	update();
};

/**
 * Clicks the node with the specified tier, row, and column in the active layer.
 * @param {number} tier - the tier of the node to click.
 * @param {number} row - the row of the node to click.
 * @param {number} col - the column of the node to click.
 */
function clickNode(tier, row, col) {
	if (gridAnimation.on || resetAnimation.on) return;
	if (tier > game.activePowTier) {
		if (game.grid[tier][row][col] < 1 && isInIncompleteLayer(tier) && !startLayer(tier, row, col)) return;
		enterLayer(tier, row, col);
	} else {
		let raises = [[row, col, POWER.getClick(tier)]];
		if (POWER.getAdjacent(tier) > 0) raises.push([row - 1, col, POWER.getAdjacent(tier)], [row, col - 1, POWER.getAdjacent(tier)], [row, col + 1, POWER.getAdjacent(tier)], [row + 1, col, POWER.getAdjacent(tier)]);
		if (POWER.getRhombus(tier) > 0) raises.push([row - 2, col, POWER.getRhombus(tier)], [row - 1, col - 1, POWER.getRhombus(tier)], [row - 1, col + 1, POWER.getRhombus(tier)], [row, col - 2, POWER.getRhombus(tier)], [row, col + 2, POWER.getRhombus(tier)], [row + 1, col - 1, POWER.getRhombus(tier)], [row + 1, col + 1, POWER.getRhombus(tier)], [row + 2, col, POWER.getRhombus(tier)]);
		for (let index = 0; index < raises.length; index++) {
			raiseLayerValue(tier, raises[index][0], raises[index][1], raises[index][2]);
			if (POWER.getMirror(tier) > 0) raiseLayerValue(tier, 11 - raises[index][0], raises[index][1], raises[index][2] * POWER.getMirror(tier));
		};
		POWER.clearCache();
		update();
	};
};

/**
 * Gets the total value of nodes in the specified tier that match a condition.
 * @param {number} tier - the tier to get the value from.
 * @param {function} func - a function that takes a node's progress and returns true if the node meets the condition.
 * @param {boolean} noMult - if true, does not apply the value multiplier from the tier number.
 */
function getNodeValues(tier, func, noMult = false) {
	let totalVal = 0;
	for (let row = 0; row < 12; row++) {
		for (let col = 0; col < 12; col++) {
			if (func(game.grid[tier][row][col])) {
				if (noMult) totalVal += Math.floor(game.grid[tier][row][col]);
				else totalVal += Math.floor(game.grid[tier][row][col] * (144 ** tier));
			};
		};
	};
	return totalVal;
};

/**
 * Gets the player's matter amount.
 */
function getMatter() {
	let matter = 0;
	for (let tier = 0; tier < game.grid.length; tier++) {
		if (tier == 0) matter += getNodeValues(tier, prog => prog == 1);
		else matter += getNodeValues(tier, prog => prog > 0);
	};
	return matter;
};
