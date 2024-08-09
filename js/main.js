const TABS = ["Stats", "Settings"];

let game = {
	grid: [[]],
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
 * Updates the HTML of the right bar.
 */
function update() {
	let tabs = "";
	for (let index = 0; index < TABS.length; index++) {
		if (TABS[index] == game.tab) tabs += "<button class='on'>" + TABS[index] + "</button>";
		else tabs += "<button onclick='changeTab(" + index + ")'>" + TABS[index] + "</button>";
	};
	document.getElementById("tabs").innerHTML = tabs;
	let main = "";
	if (game.tab == "Settings") {
		main += "<button onclick='SAVE.wipe()'>Wipe Save</button><button onclick='SAVE.export()'>Export Save</button><button onclick='SAVE.import()'>Import Save</button><button onclick='SAVE.save()'>Save Game</button>";
	};
	document.getElementById("main").innerHTML = main;
};

window.addEventListener("load", () => {
	SAVE.load();
	update();
});
