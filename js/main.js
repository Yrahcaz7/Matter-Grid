const TABS = ["Stats", "Skills", "Reset", "Options"];

let game = {
	grid: [],
	layer: [[0, 0]],
	tab: TABS[0],
	skills: {},
	skillZoom: 0,
	respecProg: 0,
	resetPoints: 0,
	activePowTier: 0,
	darkMode: true,
};

/**
 * Changes the current tab to the tab of the specified index.
 * @param {number} index - the index of the tab to change to.
 */
function changeTab(index) {
	if (gridAnimation.on || resetAnimation.on) return;
	game.tab = TABS[index];
	update(true);
};

/**
 * Toggles the mode from light to dark or vice versa.
 */
function toggleDarkMode() {
	if (gridAnimation.on || resetAnimation.on) return;
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
 * @param {boolean} force - if true, always works even during animations.
 */
function toggleBar(force = false) {
	if (!force && (gridAnimation.on || resetAnimation.on)) return;
	if (!document.getElementById("fullGridCSS")) {
		let element = document.createElement("link");
		element.id = "fullGridCSS";
		element.rel = "stylesheet";
		element.type = "text/css";
		element.href = "css/fullGrid.css";
		document.head.appendChild(element);
		document.getElementById("barToggle").innerHTML = "&larr;";
	} else {
		document.getElementById("fullGridCSS").remove();
		document.getElementById("barToggle").innerHTML = "&rarr;";
	};
};

/**
 * Gets an info button in HTML format.
 * @param {number} lines - the number of lines the info button is next to.
 */
function getInfoButton(lines) {
	let html = "";
	// 0.01x^2 + 0.51x - 1.21 is a quadratic fit for the following points: (1, -0.68) (2, -0.16) (3, 0.42) (4, 1) (5, 1.59)
	// these points are approximations of the correct margin in em (x) to center an info button with a number of lines (y)
	// this quadratic formula replaces the linear formula of 0.55x - 1.25 which drifted noticably when zoomed on 4+ lines
	let quadratic = Math.round((0.01 * (lines ** 2) + 0.51 * lines - 1.21) * 1e12) / 1e12;
	html += "<svg viewBox='0 0 16 16' class='info' style='margin: " + (lines == 1 ? -0.5 : 0) + "em 0 " + quadratic + "em' onmouseenter='adjustUI()' onmouseleave='adjustUI()'>";
	html += "<path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16'/>";
	html += "<path d='m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0'/>";
	html += "</svg>";
	return html;
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
	let currentTier = 0;
	for (; currentTier < game.layer.length; currentTier++) {
		if (game.layer[currentTier].length) break;
	};
	if (gridAnimation.on && !gridAnimation.coords.length) {
		html += "<div id='grid' oncopy='return false' onpaste='return false' oncut='return false'>" + gridAnimation.grid + "</div>";
		let gridWidth = document.getElementById("grid").firstChild.getBoundingClientRect().width;
		const getCoord = index => ((gridWidth - 2) / 13 * (game.layer[currentTier][index] - 5)) + "px";
		let scale = (((gridWidth - 2) / 13 - 2) / gridWidth);
		html += "<div id='gridAnimation' class='inverse' style='left: " + getCoord(0) + "; top: " + getCoord(1) + "; opacity: 0; transform: scale(" + scale + ", " + scale + ")' oncopy='return false' onpaste='return false' oncut='return false'>";
	} else {
		html += "<div id='grid' oncopy='return false' onpaste='return false' oncut='return false'>";
	};
	html += "<table style='--tier-color: " + COLORS[currentTier % COLORS.length] + "80'>";
	for (let col = -1; col < 12; col++) {
		html += "<tr>";
		for (let row = -1; row < 12; row++) {
			if (row < 0 && col < 0) {
				let complete = true;
				check: for (let checkRow = 0; checkRow < 12; checkRow++) {
					for (let checkCol = 0; checkCol < 12; checkCol++) {
						if (game.grid[currentTier][checkRow][checkCol] < 1) {
							complete = false;
							break check;
						};
					};
				};
				if (complete)  html += "<td onclick='completeLayer(" + currentTier + ")' style='cursor: pointer'>&larr;</td>";
				else if (hasHigherTier(currentTier)) html += "<td onclick='goUpToTier(" + (currentTier + 1) + ")' style='cursor: pointer'>&larr;</td>";
				else html += "<td>&nbsp;</td>";
			} else if (row < 0) {
				let prog = 1;
				if (isInIncompleteLayer(currentTier)) {
					prog = 0;
					for (let checkRow = 0; checkRow < 12; checkRow++) {
						if (game.grid[currentTier][checkRow][col] == 1) prog++;
					};
					prog /= 12;
				};
				if (prog == 1) html += "<th scope='col'><div><div>&check;</div></div></th>";
				else if (prog > 0) html += "<th scope='col'><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
				else html += "<th scope='col'>&nbsp;</th>";
			} else if (col < 0) {
				let prog = 1;
				if (isInIncompleteLayer(currentTier)) {
					prog = 0;
					for (let checkCol = 0; checkCol < 12; checkCol++) {
						if (game.grid[currentTier][row][checkCol] == 1) prog++;
					};
					prog /= 12;
				};
				if (prog == 1) html += "<th><div><div>&check;</div></div></th>";
				else if (prog > 0) html += "<th><div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + ">&nbsp;</div></th>";
				else html += "<th>&nbsp;</th>";
			} else {
				let prog = 1;
				if (isInIncompleteLayer(currentTier)) {
					if (game.grid[currentTier][row][col] == -1) {
						prog = 0;
						for (let checkRow = 0; checkRow < 12; checkRow++) {
							for (let checkCol = 0; checkCol < 12; checkCol++) {
								if (game.grid[currentTier - 1][checkRow][checkCol] == 1) prog++;
							};
						};
						prog /= 144;
					} else {
						prog = game.grid[currentTier][row][col];
					};
				};
				html += "<td" + (currentTier > game.activePowTier || prog < 1 ? " onclick='clickNode(" + currentTier + ", " + row + ", " + col + ")' style='cursor: pointer'" : "") + ">";
				if (prog == 1) html += "<div><div>&check;</div></div>";
				else if (prog > 0) html += "<div" + (prog < 1 ? " style='width: " + (prog * 100) + "%'" : "") + "></div>";
				html += "</td>";
			};
		};
		html += "</tr>";
	};
	html += "</table></div>";
	if (gridAnimation.on && gridAnimation.coords.length) {
		html += "<div id='gridAnimation' style='left: 0; top: 0; opacity: 1' oncopy='return false' onpaste='return false' oncut='return false'>" + gridAnimation.grid + "</div>";
	};
	if (resetAnimation.on) {
		let rect = document.getElementById("grid").firstChild.getBoundingClientRect();
		const getCoord = (units, extra) => ((rect.width - 2) / 13 * units + extra) + "px";
		html += "<div id='resetAnimation' style='--tier-color: " + COLORS[resetAnimation.tier % COLORS.length] + "80; --tile-size: " + ((rect.width - 2) / 13 - 2) + "px' oncopy='return false' onpaste='return false' oncut='return false'>";
		for (let row = 12; row > -1; row--) {
			for (let col = 12; col > -1; col--) {
				let time = (row * 0.8 + col * 0.2);
				html += "<div" + ((row == 0 || col == 0) && (row != 0 || col != 0) ? " class='header'" : "") + " style='top: " + getCoord(row, rect.y) + "; left: " + getCoord(col, rect.x) + "; animation: " + (2 / ((time + 1) ** 0.4)) + "s linear " + (time / ((time + 1) ** 0.25)) + "s wormhole forwards'>" + resetAnimation.grid[row][col] + "</div>";
			};
		};
		html += "</div>";
	};
	html += "<div id='bar'><div id='tabs'>";
	for (let index = 0; index < TABS.length; index++) {
		if (TABS[index] == game.tab) html += "<button tabindex='-1' class='on'>" + TABS[index] + "</button>";
		else html += "<button tabindex='-1' onclick='changeTab(" + index + ")'>" + TABS[index] + "</button>";
	};
	html += "</div><div id='main'" + (game.tab == "Skills" ? " style='padding: 0px;'" : "") + " onscroll='adjustUI()'>";
	// main bar display
	if (game.tab == "Stats") {
		// regions setup
		let activeRegions = [];
		let totalRegions = [];
		let bestRegions = [];
		for (let tier = 0; tier < game.grid.length; tier++) {
			activeRegions[tier] = getNodeValues(tier, prog => prog == 1, true);
			totalRegions[tier] = activeRegions[tier];
			bestRegions[tier] = -1;
		};
		for (let tier = game.layer.length; tier > 0; tier--) {
			for (let row = 0; row < 12; row++) {
				for (let col = 0; col < 12; col++) {
					if (game.grid[tier][row][col] > 0 && game.grid[tier][row][col] < 1) {
						let val = game.grid[tier][row][col];
						for (let recurTier = tier - 1; recurTier >= 0; recurTier--) {
							val *= 144;
							totalRegions[recurTier] += Math.floor(val);
							if (val > (bestRegions[recurTier] == -1 ? activeRegions[recurTier] : bestRegions[recurTier])) {
								bestRegions[recurTier] = val;
							};
							val = val % 1;
						};
					};
				};
			};
		};
		// matter setup
		let matter = 0;
		for (let index = 0; index < totalRegions.length; index++) {
			matter += totalRegions[index] * (144 ** index);
		};
		// matter and region displays
		html += "You have a total of " + formatWhole(matter) + " matter, which is made out of:";
		for (let index = 0; index < totalRegions.length; index++) {
			html += "<br>" + colorText(totalRegions[index] + " " + getTierName(index) + (index > 0 && totalRegions[index] != 1 ? "s" : ""), index);
		};
		// percentage setup
		let strayMatterProgTotal = 0;
		for (let row = 0; row < 12; row++) {
			for (let col = 0; col < 12; col++) {
				if (game.grid[0][row][col] > 0) strayMatterProgTotal += game.grid[0][row][col];
			};
		};
		// percentage displays
		html += "<br>";
		for (let index = 1; index < totalRegions.length; index++) {
			let amt = 0;
			if (bestRegions[index - 1] == -1) {
				amt += strayMatterProgTotal;
				for (let tier = 1; tier < index; tier++) {
					amt += getNodeValues(tier, prog => prog > 0);
				};
			} else {
				amt += bestRegions[index - 1] * (144 ** (index - 1));
			};
			html += "<br>You are " + colorText(formatPercent(amt / (144 ** index) * 100), index) + " of the way to filling a " + colorText(getTierName(index), index);
		};
		// band displays
		html += "<br>";
		for (let tier = 0; tier < game.layer.length; tier++) {
			html += "<br><div style='display: inline-block'>You have " + colorText(formatWhole(BAND.getAmount(tier)), tier) + " complete band" + (BAND.getAmount(tier) != 1 ? "s" : "") + " of " + colorText(getTierName(tier) + (tier > 0 ? "s" : ""), tier);
			if (BAND.hasEffect(tier)) {
				html += ",<br>which " + (BAND.getAmount(tier) != 1 ? "are" : "is") + " " + BAND.getEffectDesc(tier) + "</div> " + getInfoButton(2);
			} else {
				html += "</div>";
			};
		};
		// power setup
		let powerType = (game.activePowTier > 0 ? String.fromCharCode(64 + game.activePowTier) + "-" : "") + "power";
		let prevPowerType = (game.activePowTier > 1 ? String.fromCharCode(63 + game.activePowTier) + "-" : "") + "power";
		// click power display
		html += "<br><br>Your click " + powerType + " is " + format(POWER.getClick(game.activePowTier));
		if (game.activePowTier > 0) html += " (" + formatPercent(POWER.getClickFactor(game.activePowTier) * 100) + " of " + prevPowerType + " level)";
		// adjacent power display
		if (POWER.getAdjacent(0) > 0) {
			html += "<br>Your adjacent " + powerType + " is " + format(POWER.getAdjacent(game.activePowTier));
			if (game.activePowTier > 0) html += " (" + formatPercent(POWER.getAdjacentFactor(game.activePowTier) * 100) + " of adjacent " + prevPowerType + ")";
			else html += " (" + formatPercent(POWER.getAdjacentFactor(0) * 100) + " of click power)";
		};
		// rhombus power display
		if (POWER.getRhombus(0) > 0) {
			html += "<br>Your rhombus " + powerType + " is " + format(POWER.getRhombus(game.activePowTier));
			if (game.activePowTier > 0) html += " (" + formatPercent(POWER.getRhombusFactor(game.activePowTier) * 100) + " of rhombus " + prevPowerType + ")";
			else html += " (" + formatPercent(POWER.getRhombusFactor(0) * 100) + " of adjacent power)";
		};
		// mirror power display
		if (POWER.getMirror(0) > 0) {
			html += "<br>Your mirror " + powerType + " is " + format(POWER.getMirror(game.activePowTier));
			if (game.activePowTier > 0) html += " (" + formatPercent(POWER.getMirrorFactor(game.activePowTier) * 100) + " of mirror " + prevPowerType + ")";
		};
		// power level display
		html += "<br><br>Your " + powerType + " level is " + format(POWER.getLevel(game.activePowTier)) + " " + getInfoButton(1);
		// power tier display
		html += "<br><br>Active power tier: <select id='activePowTier' tabIndex='-1' onchange='game.activePowTier = +this.value; update()'>";
		html += "<option value='0'" + (game.activePowTier == 0 ? " selected" : "") + ">none</option>";
		if (POWER.getClick(1) > 0) html += "<option value='1'" + (currentTier < 1 ? " disabled" : (game.activePowTier == 1 ? " selected" : "")) + ">A</option>";
		html += "</select> " + getInfoButton(1);
	} else if (game.tab == "Skills") {
		html += "<div id='skillContainer'><div id='skillTree' style='" + getSkillTreeStyle() + "'>";
		html += "<div id='centerSkillDisplay' class='skill'>";
		let matter = getMatter();
		let skillPoints = SP.getTotal(matter);
		html += "<div>You have <b>" + formatWhole(skillPoints) + " skill points (SP)</b>, of which <b>" + formatWhole(skillPoints - SP.getSpent()) + "</b> are unspent.</div>";
		// band skill path and setup
		let bandSkills = getSkillsOnPath("band");
		let color = (bandSkills >= 1 ? "color-mix(in srgb, var(--txt-color), " + COLORS[(bandSkills - 1) % COLORS.length] + ")" : "var(--txt-color)");
		html += "<svg viewBox='0 0 160 120' style='flex: 1 1 auto; fill: none; stroke: " + color + "'>";
		// raw and mir skill paths
		let rawSkills = getSkillsOnPath("raw");
		let mirSkills = getSkillsOnPath("mir");
		html += "<circle cx='80' cy='60' r='25'" + (mirSkills >= 2 ? " fill='" + color + "' stroke='none'" : "") + "/>";
		if (rawSkills >= 1) html += "<circle cx='80' cy='60' r='10'" + (mirSkills >= 1 ? " fill='" + color + "' stroke='var(--bg-color)'" : "") + "/>";
		if (rawSkills >= 2) {
			html += "<g" + (mirSkills >= 2 ? " stroke='var(--bg-color)'" : "") + (mirSkills >= 3 ? " transform='rotate(45 80 60)'" : "") + ">";
			html += "<line x1='62' y1='42' x2='73' y2='53'/>";
			html += "<line x1='98' y1='42' x2='87' y2='53'/>";
			html += "<line x1='98' y1='78' x2='87' y2='67'/>";
			html += "<line x1='62' y1='78' x2='73' y2='67'/>";
			html += "</g>";
		};
		if (rawSkills >= 3) {
			html += "<g" + (mirSkills >= 1 ? " stroke='var(--bg-color)'" : "") + (mirSkills >= 3 ? " transform='rotate(45 80 60)'" : "") + ">";
			html += "<circle cx='80' cy='60' r='3'/>";
			html += "<line x1='80' y1='50' x2='80' y2='57'/>";
			html += "<line x1='90' y1='60' x2='83' y2='60'/>";
			html += "<line x1='80' y1='70' x2='80' y2='63'/>";
			html += "<line x1='70' y1='60' x2='77' y2='60'/>";
			html += "</g>";
		};
		if (rawSkills >= 4) html += "<polygon points='62.5,42.5 80,50 97.5,42.5 90,60 97.5,77.5 80,70 62.5,77.5 70,60' " + (mirSkills >= 2 ? " stroke='var(--bg-color)'" : "") + "stroke-linejoin='bevel'/>";
		// rhom skill path
		let rhomSkills = getSkillsOnPath("rhom");
		if (rhomSkills >= 1) html += "<polygon points='80,35 105,60 80,85 55,60' " + (mirSkills >= 2 ? "stroke='var(--bg-color)'" : "") + "stroke-linejoin='bevel'/>";
		if (rhomSkills >= 2) {
			html += "<rect x='53.5' y='33.5' width='7.5' height='7.5' transform='rotate(45 57.25 37.25)'/>";
			html += "<rect x='99' y='33.5' width='7.5' height='7.5' transform='rotate(45 102.75 37.25)'/>";
			html += "<rect x='99' y='79' width='7.5' height='7.5' transform='rotate(45 102.75 82.75)'/>";
			html += "<rect x='53.5' y='79' width='7.5' height='7.5' transform='rotate(45 57.25 82.75)'/>";
		};
		if (rhomSkills >= 3) {
			html += "<rect x='43' y='23' width='7.5' height='7.5' transform='rotate(45 46.75 26.75)'/>";
			html += "<rect x='109.5' y='23' width='7.5' height='7.5' transform='rotate(45 113.25 26.75)'/>";
			html += "<rect x='109.5' y='89.5' width='7.5' height='7.5' transform='rotate(45 113.25 93.25)'/>";
			html += "<rect x='43' y='89.5' width='7.5' height='7.5' transform='rotate(45 46.75 93.25)'/>";
		};
		// adj skill path
		let adjSkills = getSkillsOnPath("adj");
		if (adjSkills >= 1) html += "<rect x='55' y='35' width='50' height='50' transform='rotate(45 80 60)'/>";
		if (adjSkills >= 2) html += "<path d='M 80,5 Q 88,52 135,60 Q 88,68 80,115 Q 72,68 25,60 Q 72,52 80,5'/>";
		if (adjSkills >= 3) html += "<rect x='41' y='21' width='78' height='78' transform='rotate(45 80 60)'" + (adjSkills >= 4 ? " stroke-linejoin='bevel'" : "") + "/>";
		if (adjSkills >= 4) html += "<circle cx='80' cy='60' r='55'/>";
		// sp, adjsp, and rawsp skill paths
		let spSkills = getSkillsOnPath("sp");
		let adjspSkills = getSkillsOnPath("adjsp");
		let rawspSkills = getSkillsOnPath("rawsp");
		if (spSkills > 0) {
			html += "<g id='border'>";
			if (spSkills >= 1) html += "<circle cx='10' cy='10' r='3'/>";
			if (spSkills >= 2) {
				html += "<circle cx='20' cy='10' r='3'/>";
				html += "<circle cx='10' cy='20' r='3'/>";
			};
			if (spSkills >= 3) {
				html += "<circle cx='30' cy='10' r='3'/>";
				html += "<circle cx='10' cy='30' r='3'/>";
			};
			if (spSkills >= 4) {
				html += "<circle cx='40' cy='10' r='3'/>";
				html += "<circle cx='10' cy='40' r='3'/>";
			};
			if (adjspSkills >= 1) html += "<rect x='5' y='5' width='10' height='10'/>";
			if (adjspSkills >= 2) {
				html += "<rect x='15' y='5' width='10' height='10'/>";
				html += "<rect x='5' y='15' width='10' height='10'/>";
			};
			if (adjspSkills >= 3) {
				html += "<rect x='25' y='5' width='10' height='10'/>";
				html += "<rect x='5' y='25' width='10' height='10'/>";
			};
			if (rawspSkills >= 1) html += "<circle cx='25' cy='25' r='10'/>";
			if (rawspSkills >= 2) html += "<circle cx='25' cy='25' r='3'/>";
			if (rawspSkills >= 3) {
				html += "<line x1='18' y1='18' x2='23' y2='23'/>";
				html += "<line x1='32' y1='18' x2='27' y2='23'/>";
				html += "<line x1='32' y1='32' x2='27' y2='27'/>";
				html += "<line x1='18' y1='32' x2='23' y2='27'/>";
			};
			html += "</g>";
			html += "<use href='#border' x='-160' transform='scale(-1, 1)'/>";
			html += "<use href='#border' x='-160' y='-120' transform='scale(-1, -1)'/>";
			html += "<use href='#border' y='-120' transform='scale(1, -1)'/>";
		};
		html += "</svg>";
		let prev = SP.getPrevAt(matter);
		let next = SP.getNextAt(matter);
		let percentage = Math.round((matter - prev) / (next - prev) * 100 * 1e12) / 1e12;
		html += "<div style='background: linear-gradient(to right, #808080 0% " + percentage + "%, color-mix(in srgb, var(--bg-color), #808080) " + percentage + "% 100%)'>Progress for next SP:<br>" + formatWhole(matter) + "/" + formatWhole(next) + " matter (" + formatPercent(percentage) + ")</div></div>";
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				if (typeof SKILLS[path].unlocked == "function" && !SKILLS[path].unlocked()) continue;
				for (let skillIndex = 0; skillIndex < SKILLS[path].data.length; skillIndex++) {
					let lines = SKILLS[path].lines(skillIndex);
					for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
						let off = (lineIndex == 0 ?
							skillIndex > 0 && !hasSkill(path, skillIndex - 1)
							: !hasSkill(...SKILLS[path].data[skillIndex].req[lineIndex - 1])
						);
						html += "<div class='line" + (off ? " off" : "") + "' style='left: calc(50%" + (lines[lineIndex].x ? " + " + (lines[lineIndex].x - (lines[lineIndex].size ? lines[lineIndex].size / 2 - 1 : 0)) + "em" : "") + " - 1px); top: calc(50%" + (lines[lineIndex].y ? " + " + lines[lineIndex].y + "em" : "") + " - 1px)" + (lines[lineIndex].size ? "; width: " + lines[lineIndex].size + "em" : "") + (lines[lineIndex].rot ? "; transform: rotate(" + lines[lineIndex].rot + "deg)" : "") + "'></div>";
					};
				};
			};
		};
		for (const path in SKILLS) {
			if (SKILLS.hasOwnProperty(path)) {
				if (typeof SKILLS[path].unlocked == "function" && !SKILLS[path].unlocked()) continue;
				for (let index = 0; index < SKILLS[path].data.length; index++) {
					let pos = SKILLS[path].pos(index);
					if (hasSkill(path, index)) {
						let color = "color-mix(in srgb, var(--txt-color), " + COLORS[index % COLORS.length] + ")";
						html += "<button tabindex='-1' class='skill on' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em); border-color: " + color + "; color: " + color + "'><b>" + SKILLS[path].data[index].name + "</b><br><br>" + SKILLS[path].data[index].desc + "</button>";
					} else if (skillUnlocked(path, index)) {
						html += "<button tabindex='-1' onclick='buySkill(\"" + path + "\", " + index + ")' class='skill' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em)'><b>" + SKILLS[path].data[index].name + "</b><br>" + SKILLS[path].data[index].desc + "<br><br>Cost: <b>" + SKILLS[path].data[index].cost + " SP</b></button>";
					} else {
						html += "<button tabindex='-1' class='skill off' style='left: calc(50% + " + pos[0] + "em); top: calc(50% + " + pos[1] + "em)'><b>" + SKILLS[path].data[index].name + "</b><br>" + SKILLS[path].data[index].desc + "<br><br>Cost: <b>" + SKILLS[path].data[index].cost + " SP</b></button>";
					};
				};
			};
		};
		html += "</div></div>";
		html += "<div class='skillUI' style='left: 0; top: 0'>";
		html += "<button tabindex='-1' onclick='SP.respec()' style='background: linear-gradient(to right, #808080 0% " + game.respecProg + "%, color-mix(in srgb, var(--bg-color), #808080) " + game.respecProg + "% 100%)'>RESPEC</button>";
		html += "</div><div class='skillUI' style='right: 0; top: 0; text-align: right'><div>";
		html += "<button id='zoomIn'" + (game.skillZoom >= 20 ? "class='off'" : "") + " tabindex='-1' onclick='zoomSkillTree()'>ZOOM IN</button>";
		html += "<button id='zoomOut'" + (game.skillZoom <= -20 ? "class='off'" : "") + " tabindex='-1' onclick='zoomSkillTree(true)'>ZOOM OUT</button></div><div>";
		html += "<button tabindex='-1' onclick='resetSkillTreeZoom()'>RESET ZOOM/SCROLL</button>";
		html += "</div></div>";
	} else if (game.tab == "Reset") {
		let matter = getMatter();
		let req = RP.getReq();
		html += "You have <b>" + formatWhole(game.resetPoints) + " reset points (RP)</b>,<br>which are multiplying click power, adjacent power, skill point gain, and band worth for all band types by " + format(RP.getEff()) + "x";
		let percentage = Math.round(Math.min(matter / req, 1) * 100 * 1e12) / 1e12;
		html += "<div style='margin: 5px 0; background: linear-gradient(to right, #808080 0% " + percentage + "%, color-mix(in srgb, var(--bg-color), #808080) " + percentage + "% 100%)'>Progress for next RP:<br>" + formatWhole(matter) + "/" + formatWhole(req) + " matter (" + formatPercent(percentage) + ")</div>";
		html += "You may only reset for <b>1 RP</b> at a time<br><button" + (matter >= req ? " onclick='RP.reset(true)'" : " class='off'") + ">Reset all previous content for <b>1 RP</b></button><hr>";
		for (let index = 0; index < MILESTONES.length; index++) {
			if (index > 0) html += "<br>";
			if (!hasMilestone(index)) {
				if (index > 0) html += "<br>";
				html += "<b>Next Milestone:</b><div class='box' style='margin: 5px auto 0px; width: fit-content'>Obtained at <b>" + formatWhole(MILESTONES[index][0]) + " RP</b><br>" + MILESTONES[index][1] + "</div>";
				break;
			};
			if (index == 0) html += "<b>Obtained Milestone Effects:</b><br>";
			html += "<b>" + formatWhole(MILESTONES[index][0]) + " RP</b>: " + MILESTONES[index][1];
		};
	} else if (game.tab == "Options") {
		html += "Saving Options<hr>";
		html += "<button tabindex='-1' onclick='SAVE.wipe()'>Wipe Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.export()'>Export Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.import()'>Import Save</button>";
		html += "<button tabindex='-1' onclick='SAVE.save()'>Save Game</button>";
		html += "<hr style='margin-top: 10px'>Visual Options<hr>";
		html += "<button tabindex='-1' onclick='toggleDarkMode()'>Toggle Dark Mode</button>";
	};
	html += "</div><div id='barToggle' onclick='toggleBar()'>&rarr;</div></div>";
	// popups
	if (game.tab == "Stats") {
		// band info
		for (let tier = 0; tier < game.layer.length; tier++) {
			if (BAND.hasEffect(tier)) {
				html += "<div class='popup'>";
				if (BAND.getEffect(tier) > 100) {
					html += "<b>Softcapped Formula:</b> (1 + bands&times;worth&divide;4)<sup>0.25</sup>&times;10";
					html += "<br><b>Calculation:</b> (1 + " + formatWhole(BAND.getAmount(tier)) + "&times;" + format(BAND.getWorth(tier)) + "&divide;4)<sup>0.25</sup>&times;10";
				} else {
					html += "<b>Formula:</b> (1 + bands&times;worth&divide;4)<sup>0.5</sup>";
					html += "<br><b>Calculation:</b> (1 + " + formatWhole(BAND.getAmount(tier)) + "&times;" +format(BAND.getWorth(tier)) + "&divide;4)<sup>0.5</sup>";
				};
				html += "</div>";
			};
		};
		// power level info
		html += "<div class='popup'>";
		html += "<b>Formula:</b> ";
		if (POWER.getMirror(0) > 0) html += "(";
		html += "click";
		if (POWER.getAdjacent(0) > 0) html += " + adjacent&times;4";
		if (POWER.getRhombus(0) > 0) html += " + rhombus&times;8";
		if (POWER.getMirror(0) > 0) html += ")(mirror + 1)";
		html += " = level";
		html += "<br><b>Calculation:</b> ";
		if (POWER.getMirror(0) > 0) html += "(";
		html += format(POWER.getClick(game.activePowTier));
		if (POWER.getAdjacent(0) > 0) html += " + " + format(POWER.getAdjacent(game.activePowTier)) + "&times;4";
		if (POWER.getRhombus(0) > 0) html += " + " + format(POWER.getRhombus(game.activePowTier)) + "&times;8";
		if (POWER.getMirror(0) > 0) html += ")(" + format(POWER.getMirror(game.activePowTier)) + " + 1)";
		html += " = " + format(POWER.getLevel(game.activePowTier));
		html += "</div>";
		// power tier info
		let tierLetter = String.fromCharCode(64 + game.activePowTier);
		let tierName = getTierName(game.activePowTier);
		html += "<div class='popup'>";
		html += "<div style='max-width: min(31em, 100%)'>";
		html += "Since " + (game.activePowTier > 0 ? "the " + tierLetter + "-" : "no ") + "power tier is active, you click for ";
		html += colorText(tierName, game.activePowTier) + " progress equal to your click " + (game.activePowTier > 0 ? tierLetter + "-" : "") + "power, ";
		if (game.activePowTier > 0) html += "and you cannot view the insides of " + colorText(tierName + "s", game.activePowTier) + ".";
		else html += "and you can view the insides of all regions.";
		html += "</div>";
		html += "<div style='max-width: min(31em, 100%)'><b>You may change your active power tier to any valid power tier that has click power at any time.</b></div>";
		html += "</div>";
	};
	if (resetAnimation.on) html += "<div id='animationCover'><div id='wormhole'><div></div></div></div>";
	else if (gridAnimation.on) html += "<div id='animationCover'></div>";
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
	if (gridAnimation.on) {
		if (gridAnimation.coords.length) {
			let gridWidth = document.getElementById("grid").firstChild.getBoundingClientRect().width;
			const getCoord = index => ((gridWidth - 2) / 13 * (gridAnimation.coords[index] - 5)) + "px";
			let scale = (((gridWidth - 2) / 13 - 2) / gridWidth);
			document.getElementById("gridAnimation").style = "left: " + getCoord(0) + "; top: " + getCoord(1) + "; opacity: 0; transform: scale(" + scale + ", " + scale + ")";
		} else {
			document.getElementById("gridAnimation").style = "left: 0; top: 0; opacity: 1; transform: scale(1, 1)";
		};
	};
	adjustUI();
};

/**
 * Adjusts UI appropriately.
 */
function adjustUI() {
	if (document.getElementById("skillContainer")) {
		let skillUI = document.getElementsByClassName("skillUI");
		if (skillUI.length) {
			let width = 0;
			for (let index = 0; index < skillUI.length; index++) {
				width += skillUI[index].getBoundingClientRect().width;
			};
			if (document.getElementById("skillContainer").getBoundingClientRect().width + 15 < width) {
				let respec = skillUI[0].children[0];
				if (respec) {
					skillUI[1].innerHTML += "<div class='skillUI' style='right: 10px; padding: 0'>" + respec.outerHTML + "</div>";
					skillUI[0].removeChild(respec);
				};
			} else {
				let respec = skillUI[1].children[2];
				if (respec) {
					skillUI[0].innerHTML += respec.innerHTML;
					skillUI[1].removeChild(respec);
				};
			};
		};
	} else {
		let infoList = document.getElementsByClassName("info");
		let popupList = document.getElementsByClassName("popup");
		for (let index = 0; index < infoList.length && index < popupList.length; index++) {
			if (infoList[index].matches(":hover")) {
				popupList[index].style = "";
				let children = popupList[index].children;
				for (let child = 0; child < children.length; child++) {
					children[child].style.width = "auto";
				};
				requestAnimationFrame(() => {
					let children = popupList[index].children;
					for (let child = 0; child < children.length; child++) {
						if (children[child] instanceof HTMLDivElement) {
							const range = document.createRange();
							range.selectNodeContents(children[child]);
							children[child].style.width = range.getBoundingClientRect().width + "px";
						};
					};
				});
			} else {
				popupList[index].style = "display: none";
			};
			requestAnimationFrame(() => {
				let infoRect = infoList[index].getBoundingClientRect();
				if (infoRect.bottom + popupList[index].getBoundingClientRect().height + 15 > document.documentElement.offsetHeight) {
					popupList[index].style.bottom = "calc(100% - " + (infoRect.top - 5) + "px)";
				} else {
					popupList[index].style.top = (infoRect.bottom + 5) + "px";
				};
			});
		};
	};
};

window.addEventListener("load", () => {
	SAVE.load();
	update(true);
});

window.addEventListener("resize", adjustUI);
