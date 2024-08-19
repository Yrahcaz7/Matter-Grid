const TABS = ["Stats", "Skills", "Settings"];

let game = {
	grid: [],
	layer: [[0, 0]],
	tab: TABS[0],
	skills: {},
	skillZoom: 0,
	respecProg: 0,
	darkMode: true,
};

/**
 * Gets the player's click power.
 */
function getClickPower() {
	let skillMult = 1;
	if (hasSkill("raw", 0)) skillMult += 0.1;
	if (hasSkill("raw", 1)) skillMult += 0.1;
	if (hasSkill("raw", 2)) skillMult += 0.1;
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
	if (hasSkill("area", 2)) skillMult += 0.1;
	return getClickPower() * skillMult;
};

/**
 * Changes the current tab to the tab of the specified index.
 * @param {number} index - the index of the tab to change to.
 */
function changeTab(index) {
	game.tab = TABS[index];
	update(true);
};

/**
 * Toggles the mode from light to dark or vice versa.
 */
function toggleDarkMode() {
	if (game.darkMode) {
		document.documentElement.style.setProperty("--bg-color", "#F0F0F0");
		document.documentElement.style.setProperty("--txt-color", "#101010");
	} else {
		document.documentElement.style.setProperty("--bg-color", "#101010");
		document.documentElement.style.setProperty("--txt-color", "#F0F0F0");
	};
	game.darkMode = !game.darkMode;
};

/**
 * Toggles whether the right bar is collapsed.
 */
function toggleBar() {
	if (!document.getElementById("fullGridCSS")) {
		let element = document.createElement("link");
		element.id = "fullGridCSS";
		element.rel = "stylesheet";
		element.type = "text/css";
		element.href = "fullGrid.css";
		document.head.appendChild(element);
		document.getElementById("barToggle").innerHTML = "&larr;";
	} else {
		document.getElementById("fullGridCSS").remove();
		document.getElementById("barToggle").innerHTML = "&rarr;";
	};
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
				if (prog == 1) html += "<th scope='col'><div><div>&check;</div></div></th>";
				else if (prog > 0) html += "<th scope='col'><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
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
				if (prog == 1) html += "<th><div><div>&check;</div></div></th>";
				else if (prog > 0) html += "<th><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
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
				if (prog == 1) html += "<div><div>&check;</div></div>";
				else if (prog > 0) html += "<div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + "></div>";
				html += "</td>";
			};
		};
		html += "</tr>";
	};
	html += "</table></div><div id='bar'><div id='tabs'>";
	for (let index = 0; index < TABS.length; index++) {
		if (TABS[index] == game.tab) html += "<button tabindex='-1' class='on'>" + TABS[index] + "</button>";
		else html += "<button tabindex='-1' onclick='changeTab(" + index + ")'>" + TABS[index] + "</button>";
	};
	html += "</div><div id='main'" + (game.tab == "Skills" ? " style='padding: 0px;'" : "") + ">";
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
			html += "<br>You are " + colorText(formatPercent(amt), index) + " of the way to filling a " + colorText(getTierName(index), index);
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
		html += "<div id='skillContainer'><div id='skillTree' style='" + getSkillTreeStyle() + "'>";
		html += "<div id='centerSkillDisplay' class='skill'>";
		let matter = getMatter();
		let skillPoints = SP.getTotal(matter);
		html += "<div>You have " + colorText(formatWhole(skillPoints)) + " " + colorText("skill points (SP)") + ", of which " + colorText(formatWhole(skillPoints - SP.getSpent())) + " are unspent.</div>";
		html += "<div style='flex: 1 1 auto; padding: 5px'></div>";
		let next = SP.getNextAt(matter);
		let percentage = Math.round(matter / next * 100 * 1e12) / 1e12;
		html += "<div style='background: linear-gradient(to right, var(--txt-color) 0% " + percentage + "%, #808080 " + percentage + "% 100%); color: var(--bg-color)'>Progress for next SP:<br>" + formatWhole(matter) + "/" + formatWhole(next) + " matter (" + formatPercent(percentage) + ")</div></div>";
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				for (let index = 0; index < SKILLS[path].data.length; index++) {
					let line = SKILLS[path].line(index);
					html += "<div class='line' style='left: calc(50% + " + line[0] + "em - 1px); top: calc(50% + " + line[1] + "em - 1px)" + (line[2] ? "; transform: rotate(" + line[2] + "deg)" : "") + "'></div>";
				};
			};
		};
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				for (let index = 0; index < SKILLS[path].data.length; index++) {
					let pos = SKILLS[path].pos(index);
					if (hasSkill(path, index)) {
						let color = "color-mix(in srgb, var(--txt-color), " + COLORS[index % COLORS.length] + ")";
						html += "<button tabindex='-1' class='skill on' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em); border-color: " + color + "; color: " + color + "'><b>" + SKILLS[path].data[index].name + "</b><br><br>" + SKILLS[path].data[index].desc + "</button>";
					} else {
						html += "<button tabindex='-1' onclick='buySkill(\"" + path + "\", " + index + ")' class='skill' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em)'><b>" + SKILLS[path].data[index].name + "</b><br>" + SKILLS[path].data[index].desc + "<br><br>Cost: " + colorText(SKILLS[path].data[index].cost + " SP") + "</button>";
					};
				};
			};
		};
		html += "</div></div>";
		html += "<div class='skillUI' style='left: 0; top: 0'>";
		html += "<button tabindex='-1' onclick='SP.respec()' style='background: linear-gradient(to right, var(--txt-color) 0% " + game.respecProg + "%, #808080 " + game.respecProg + "% 100%)'>RESPEC</button>";
		html += "</div><div class='skillUI' style='right: 0; top: 0; text-align: right'><div>";
		html += "<button tabindex='-1' onclick='zoomSkillTree()'>ZOOM IN</button>";
		html += "<button tabindex='-1' onclick='zoomSkillTree(true)'>ZOOM OUT</button></div><div>";
		html += "<button tabindex='-1' onclick='resetSkillTreeZoom()'>RESET ZOOM/SCROLL</button>";
		html += "</div></div>";
	} else if (game.tab == "Settings") {
		html += "Saving Settings<hr>";
		html += "<button tabindex='-1' onclick='SAVE.wipe()'>Wipe Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.export()'>Export Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.import()'>Import Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.save()'>Save Game</button>";
		html += "<hr style='margin-top: 10px'>Visual Settings<hr>";
		html += "<button tabindex='-1' onclick='toggleDarkMode()'>Toggle Dark Mode</button>";
	};
	html += "</div><div id='barToggle' onclick='toggleBar()'>&rarr;</div></div>";
	if (resetScroll) {
		document.body.innerHTML = html;
		if (game.tab == "Skills") centerSkillTree();
	} else {
		let id = (document.getElementById("skillContainer") ? "skillContainer" : "main");
		let scrollLeft = document.getElementById(id).scrollLeft;
		let scrollTop = document.getElementById(id).scrollTop;
		document.body.innerHTML = html;
		document.getElementById(id).scrollLeft = scrollLeft;
		document.getElementById(id).scrollTop = scrollTop;
	};
	adjustSkillUI();
};

window.addEventListener("load", () => {
	SAVE.load();
	update(true);
});
