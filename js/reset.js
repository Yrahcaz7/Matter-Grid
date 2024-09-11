const MILESTONES = [
	[1, "Unlocks secondary skill paths"],
	[2, "Coming Soon"],
];

/**
 * Checks whether the player has a milestone specified by its index.
 * @param {number} index - the index of the milestone to check.
 */
function hasMilestone(index) {
	return game.resetPoints >= MILESTONES[index][0];
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
		if (gridAnimation.on) return;
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
				if (gainPoint) game.resetPoints++;
				game.grid = [];
				game.layer = [[0, 0]];
				game.skills = {};
				game.skillZoom = 0;
				game.respecProg = 0;
				update(true);
			};
			document.getElementById("confirm_reset").append(element);
		};
	},
};
