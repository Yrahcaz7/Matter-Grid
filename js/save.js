let loaded = false;

const SAVE = {
	/**
	 * Opens the save wiping menu.
	 */
	wipe() {
		if (gridAnimation.on || resetAnimation.on) return;
		if (!document.getElementById("confirm_wipe")) {
			let element = document.createElement("dialog");
			element.id = "confirm_wipe";
			element.innerHTML = "<div>Are you really sure you want to wipe your save?<br>This will reset EVERYTHING!</div>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_wipe_no")) {
			let element = document.createElement("button");
			element.id = "confirm_wipe_no";
			element.tabIndex = -1;
			element.innerHTML = "No";
			element.onclick = () => document.getElementById("confirm_wipe").remove();
			document.getElementById("confirm_wipe").append(element);
		};
		if (!document.getElementById("confirm_wipe_yes")) {
			let element = document.createElement("button");
			element.id = "confirm_wipe_yes";
			element.tabIndex = -1;
			element.innerHTML = "Yes";
			element.onclick = () => {
				loaded = false;
				localStorage.removeItem(SAVE.ID);
				location.reload();
			};
			document.getElementById("confirm_wipe").append(element);
		};
	},
	/**
	 * Opens the save exporting menu.
	 */
	export() {
		if (gridAnimation.on || resetAnimation.on) return;
		if (!document.getElementById("confirm_export")) {
			let element = document.createElement("dialog");
			element.id = "confirm_export";
			let item = localStorage.getItem(SAVE.ID);
			if (item) element.innerHTML = "<div>Your save is shown below.</div><div class='box'>" + item + "</div>";
			else element.innerHTML = "<div>Your have no saved data to export.</div>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_export_no")) {
			let element = document.createElement("button");
			element.id = "confirm_export_no";
			element.tabIndex = -1;
			element.innerHTML = "Close";
			element.onclick = () => document.getElementById("confirm_export").remove();
			document.getElementById("confirm_export").append(element);
		};
	},
	/**
	 * Opens the save importing menu.
	 */
	import() {
		if (gridAnimation.on || resetAnimation.on) return;
		if (!document.getElementById("confirm_import")) {
			let element = document.createElement("dialog");
			element.id = "confirm_import";
			element.innerHTML = "<div>Paste your save in the field below.<br>WARNING: this will wipe your current save.</div><input type='text' id='confirm_import_input' size='20' autocomplete='off' class='box'><br>";
			document.body.append(element);
			element.showModal();
		};
		if (!document.getElementById("confirm_import_no")) {
			let element = document.createElement("button");
			element.id = "confirm_import_no";
			element.tabIndex = -1;
			element.innerHTML = "Cancel";
			element.onclick = () => document.getElementById("confirm_import").remove();
			document.getElementById("confirm_import").append(element);
		};
		if (!document.getElementById("confirm_import_yes")) {
			let element = document.createElement("button");
			element.id = "confirm_import_yes";
			element.tabIndex = -1;
			element.innerHTML = "Import";
			element.onclick = () => {
				let item = document.getElementById("confirm_import_input").value;
				if (item) {
					try {
						let parsed = JSON.parse(atob(item));
						if (typeof parsed == "object") {
							loaded = false;
							localStorage.setItem(SAVE.ID, item);
							location.reload();
						} else {
							console.warn('Importing an invalid save was attempted.');
						};
					} catch {
						console.warn('Importing an invalid save was attempted.');
					};
				} else {
					console.warn('Importing an empty save was attempted.');
				};
			};
			document.getElementById("confirm_import").append(element);
		};
	},
	/**
	 * Saves all data to local storage.
	 */
	save() {
		if (!loaded) return;
		let item = btoa(JSON.stringify(game));
		if (item) localStorage.setItem(SAVE.ID, item);
	},
	/**
	 * Loads the saved data from local storage.
	 */
	load() {
		let item = localStorage.getItem(SAVE.ID);
		if (item) {
			let obj = JSON.parse(atob(item));
			if (!obj.darkMode) toggleDarkMode();
			Object.assign(game, obj);
			loaded = true;
		};
	},
	ID: "Yrahcaz7/Matter-Grid/save",
};

window.addEventListener("beforeunload", SAVE.save);
