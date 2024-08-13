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
		element.innerHTML = "<div>Are you sure you want to move your incomplete " + getTierName(tier) + " to " + (col + 1) + "-" + (row + 1) + "-" + String.fromCharCode(64 + tier) + "?</div>";
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
		document.getElementById("confirm_move").append(element);
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
