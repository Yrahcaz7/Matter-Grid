const MILESTONES = [
	[1, "Unlocks secondary skill paths"],
	[2, "Adds 0.1% of power level as A-tier power per RP", () => game.resetPoints / 1000],
	[3, "Coming soon"],
];

/**
 * Checks whether the player has a milestone specified by its index.
 * @param {number} index - the index of the milestone to check.
 */
function hasMilestone(index) {
	return game.resetPoints >= MILESTONES[index][0];
};

/**
 * Gets the effect of a milestone specified by its index.
 * @param {number} index - the index of the milestone to get the effect of.
 */
function getMilestoneEffect(index) {
	return MILESTONES[index][2]();
};

let resetAnimation = {
	tier: 0,
	grid: [],
	on: false,
};

/**
 * Performs a reset with no shenanigans.
 */
function reset() {
	game.grid = [];
	game.layer = [[0, 0]];
	game.skills = {};
	game.skillZoom = 0;
	game.respecProg = 0;
	game.activePowTier = 0;
	update();
};

const RP = {
	/**
	 * Gets the amount of matter required for the next reset point.
	 */
	getReq() {
		return (2 ** game.resetPoints) * 2500;
	},
	/**
	 * Gets the reset point effect.
	 */
	getEff() {
		return 1.2 ** (game.resetPoints ** 0.5);
	},
	/**
	 * Performs a reset after a confirmation.
	 * @param {boolean} gainPoint - if true, gains a reset point.
	 */
	reset(gainPoint = false) {
		if (gridAnimation.on || resetAnimation.on) return;
		if (!document.getElementById("confirm_reset")) {
			let element = document.createElement("dialog");
			element.id = "confirm_reset";
			element.innerHTML = "<div>Are you sure you want to reset" + (gainPoint ? " for <b>1 RP</b>" : "") + "?<br>This will reset all previous content!</div>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_reset_no")) {
			let element = document.createElement("button");
			element.id = "confirm_reset_no";
			element.tabIndex = -1;
			element.innerHTML = "No";
			element.onclick = () => document.getElementById("confirm_reset").remove();
			document.getElementById("confirm_reset").append(element);
		};
		if (!document.getElementById("confirm_reset_yes")) {
			let element = document.createElement("button");
			element.id = "confirm_reset_yes";
			element.tabIndex = -1;
			element.innerHTML = "Yes";
			element.onclick = () => {
				if (gainPoint) {
					resetAnimation.tier = 0;
					for (; resetAnimation.tier < game.layer.length; resetAnimation.tier++) {
						if (game.layer[resetAnimation.tier].length) break;
					};
					let rows = document.getElementById("grid").firstChild.firstChild.children;
					for (let row = 0; row < rows.length; row++) {
						resetAnimation.grid[row] = [];
						let cols = rows[row].children;
						for (let col = 0; col < cols.length; col++) {
							resetAnimation.grid[row][col] = cols[col].innerHTML;
						};
					};
					resetAnimation.on = true;
					setTimeout(() => {
						document.getElementById("resetAnimation").remove();
						document.getElementById("animationCover").remove();
						resetAnimation.on = false;
					}, 8000);
					game.resetPoints++;
					if (Math.max(document.documentElement.clientWidth, window.innerWidth) <= 600 && !document.getElementById("fullGridCSS")) {
						toggleBar(true);
						requestAnimationFrame(() => requestAnimationFrame(() => reset()));
					} else {
						reset();
					};
				} else {
					reset();
				};
			};
			document.getElementById("confirm_reset").append(element);
		};
	},
};
