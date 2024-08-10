const TABS = ["Stats", "Settings"];

let game = {
	grid: [],
	layer: [[0, 0]],
	tab: TABS[0],
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
 * Gets the player's click power.
 */
function getClickPower() {
	let power = 0.1;
	return 0.1;
};

function clickNode(row, col) {
	let value = game.grid[0][row][col] + getClickPower();
	game.grid[0][row][col] = Math.min(Math.round(value * 1e12) / 1e12, 1);
	update();
};

/**
 * Updates the HTML of the page.
 */
function update() {
	let html = "";
	html += "<div id='grid'><table>";
	while (!game.grid[game.layer.length]) {
		let arr = [];
		for (let row = 0; row < 12; row++) {
			arr[row] = [];
			for (let col = 0; col < 12; col++) {
				arr[row][col] = 0;
			};
		};
		if (game.grid.length) arr[0][0] = -1;
		game.grid.push(arr);
	};
	let tier = 0;
	for (; tier < game.layer.length; tier++) {
		if (game.layer[tier].length) break;
	};
	for (let col = 0; col < 12; col++) {
		html += "<tr>";
		for (let row = 0; row < 12; row++) {
			let prog = 1;
			if (game.grid[tier + 1][game.layer[tier][0]][game.layer[tier][1]] == -1) {
				prog = game.grid[tier][row][col];
			};
			html += "<td" + (prog < 1 ? " onclick='" + (tier == 0 ?
				"clickNode(" + row + ", " + col + ")"
				: "game.layer[" + (tier - 1) + "] = [" + row + ", " + col + "]"
			) + "' style='cursor: pointer'" : "") + ">";
			if (prog > 0) html += "<div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + "></div>";
			html += "</td>";
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
		html += "You have a total of " + matter + " matter, which is made out of:";
		for (let index = 0; index < regions.length; index++) {
			if (index == 0) html += "<br>" + regions[index] + " stray matter";
			else html += "<br>" + regions[index] + " type-" + String.fromCharCode(64 + index) + " regions";
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
