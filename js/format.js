const COLORS = ["#10F010", "#10F0F0", "#1010F0", "#F010F0", "#F01010", "#F0F010"];

/**
 * Returns a whole number formatted as a string.
 * @param {number} num - the number to format.
 */
function formatWhole(num) {
	let pre = "";
	let str = (+num).toFixed();
	if (str.charAt(0) == "-") {
		str = str.slice(1);
		pre = "-";
	};
	if (str.length > 9 || num >= 1e12) return (+num).toExponential(3).replace("+", "");
	if (str.length > 6) return pre + str.slice(0, -6) + "," + str.slice(-6, -3) + "," + str.slice(-3);
	if (str.length > 3) return pre + str.slice(0, -3) + "," + str.slice(-3);
	return pre + str;
};

/**
 * Returns a number formatted as a string.
 * @param {number} num - the number to format.
 */
function format(num) {
	let mag = Math.abs(num);
	let places = 4 - (mag >= 0.99995 ? 1 : 0) - (mag >= 9.9995 ? 1 : 0) - (mag >= 99.995 ? 1 : 0) - (mag >= 999.95 ? 1 : 0);
	if (places == 0) return formatWhole(num);
	return (+num).toFixed(places);
};

/**
 * Returns a number formatted as a percentage.
 * @param {number} num - the number to format.
 */
function formatPercent(num) {
	let mag = Math.abs(num);
	let places = 2 - (mag >= 9.995 ? 1 : 0) - (mag >= 99.95 ? 1 : 0);
	return (+num).toFixed(places) + "%";
};

/**
 * Returns a string colored with a specified tier's color in HTML format.
 * @param {string} str - the string to color.
 * @param {number} tier - the tier to use for coloring.
 */
function colorText(str, tier = -1) {
	if (tier < 0) return str;
	return "<span style='color: color-mix(in srgb, var(--txt-color), " + COLORS[tier % COLORS.length] + ")'>" + str + "</span>";
};
