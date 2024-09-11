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
 * Goes up to the specified tier.
 * @param {number} tier - the tier to go to.
 */
function goUpToTier(tier) {
	if (gridAnimation.on) return;
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
 * Completes the layer specified by its tier.
 * @param {number} tier - the tier of the layer to complete.
 */
function completeLayer(tier) {
	if (gridAnimation.on) return;
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
	if (gridAnimation.on) return;
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
	if (gridAnimation.on) return;
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
 * Raises a node's value by a specified amount.
 * @param {number} row - the row of the node to raise the value of.
 * @param {number} col - the column of the node to raise the value of.
 * @param {number} amt - the amount to raise the node's value by.
 */
function raiseNodeValue(row, col, amt) {
	if (gridAnimation.on) return;
	if (game.grid[0][row]?.length && game.grid[0][row][col] !== undefined) game.grid[0][row][col] = Math.min(Math.round((game.grid[0][row][col] + amt) * 1e12) / 1e12, 1);
};

/**
 * Clicks the node with the specified row and column in the active tier 0 layer.
 * @param {number} row - the row of the node to click.
 * @param {number} col - the column of the node to click.
 */
function clickNode(row, col) {
	if (gridAnimation.on) return;
	let raises = [[row, col, getClickPower()]];
	// rightward path powers
	let adjPow = getAdjacentPower();
	if (adjPow > 0) raises.push([row - 1, col, adjPow], [row, col - 1, adjPow], [row, col + 1, adjPow], [row + 1, col, adjPow]);
	let rhomPow = getRhombusPower();
	if (rhomPow > 0) raises.push([row - 2, col, rhomPow], [row - 1, col - 1, rhomPow], [row - 1, col + 1, rhomPow], [row, col - 2, rhomPow], [row, col + 2, rhomPow], [row + 1, col - 1, rhomPow], [row + 1, col + 1, rhomPow], [row + 2, col, rhomPow]);
	// other path powers
	let mirPower = getMirrorPower();
	for (let index = 0; index < raises.length; index++) {
		raiseNodeValue(raises[index][0], raises[index][1], raises[index][2]);
		if (mirPower > 0) raiseNodeValue(11 - raises[index][0], raises[index][1], raises[index][2] * mirPower);
	};
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
		let mult = 0.25;
		if (hasSkill("band", 2)) mult *= 2;
		if (game.resetPoints > 0) mult *= RP.getEff();
		return (1 + amt * mult) ** 0.5;
	},
	/**
	 * Gets a band effect description specified by its tier.
	 * @param {number} tier - the tier of the band effect description to get.
	 * @param {number} eff - overrides the band effect in the text.
	 */
	getEffDesc(tier, eff = BAND.getEffect(tier)) {
		if (tier == 0) return "multiplying click power by " + format(eff) + "x";
		if (tier == 1) return "multiplying adjacent power by " + format(eff) + "x";
		return "";
	},
};
