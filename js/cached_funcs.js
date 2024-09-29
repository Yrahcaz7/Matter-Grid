const POWER = function() {
	/**
	 * The `POWER` cache.
	 */
	let cache = {f: {}};
	/**
	 * Caches a value in the `POWER` cache.
	 * @param {string} key - the key of the value to cache.
	 * @param {number} tier - the tier of the value to cache.
	 * @param {number} val - the value to cache.
	 * @param {boolean} factor - if true, the value is a factor.
	 * @returns {number} the `val` that was cached.
	 */
	function cacheValue(key, tier, val, factor = false) {
		if (factor) {
			if (!cache.f[key]?.length) cache.f[key] = [];
			cache.f[key][tier] = val;
		} else {
			if (!cache[key]?.length) cache[key] = [];
			cache[key][tier] = val;
		};
		return val;
	};
	return {
		/**
		 * Clears the `POWER` cache.
		 */
		clearCache() {
			cache = {f: {}};
		},
		/**
		 * Gets the player's click power factor of a specified tier.
		 * @param {number} tier - the tier of the click power factor.
		 * @returns {number}
		 */
		getClickFactor(tier) {
			if (cache.f.click && cache.f.click[tier]) return cache.f.click[tier];
			if (tier > 0) {
				let factor = 0;
				if (tier == 1 && hasMilestone(1)) factor += getMilestoneEffect(1);
				return cacheValue("click", tier, factor, true);
			} else {
				let factor = 1;
				if (hasSkill("raw", 0)) factor += 0.1;
				if (hasSkill("raw", 1)) factor += 0.15;
				if (hasSkill("raw", 2)) factor += 0.2;
				if (hasSkill("raw", 3)) factor += 0.25;
				if (hasSkill("rawsp", 0)) {
					let SPfactor = Math.log(SP.getTotal() + 1);
					factor += 0.03 * SPfactor;
					if (hasSkill("rawsp", 1)) factor += 0.03 * SPfactor;
					if (hasSkill("rawsp", 2)) factor += 0.03 * SPfactor;
				};
				if (BAND.hasEffect(0)) factor *= BAND.getEffect(0);
				if (game.resetPoints > 0) factor *= RP.getEff();
				return cacheValue("click", 0, factor, true);
			};
		},
		/**
		 * Gets the player's click power of a specified tier.
		 * @param {number} tier - the tier of the click power.
		 * @returns {number}
		 */
		getClick(tier) {
			if (cache.click && cache.click[tier]) return cache.click[tier];
			if (tier > 0) return cacheValue("click", tier, this.getLevel(tier - 1) * this.getClickFactor(tier));
			else return cacheValue("click", 0, 0.1 * this.getClickFactor(0));
		},
		/**
		 * Gets the player's adjacent power factor of a specified tier.
		 * @param {number} tier - the tier of the adjacent power factor.
		 * @returns {number}
		 */
		getAdjacentFactor(tier) {
			if (cache.f.adjacent && cache.f.adjacent[tier]) return cache.f.adjacent[tier];
			if (tier > 0) {
				let factor = 0;
				if (tier == 1 && hasMilestone(3)) factor += getMilestoneEffect(3);
				return cacheValue("adjacent", tier, factor, true);
			} else {
				let factor = 0;
				if (hasSkill("adj", 0)) factor += 0.05;
				if (hasSkill("adj", 1)) factor += 0.1;
				if (hasSkill("adj", 2)) factor += 0.15;
				if (hasSkill("adj", 3)) factor += 0.2;
				if (hasSkill("adjsp", 0)) {
					let SPfactor = Math.log(SP.getTotal() + 1);
					factor += 0.02 * SPfactor;
					if (hasSkill("adjsp", 1)) factor += 0.02 * SPfactor;
					if (hasSkill("adjsp", 2)) factor += 0.02 * SPfactor;
				};
				if (BAND.hasEffect(1)) factor *= BAND.getEffect(1);
				if (game.resetPoints > 0) factor *= RP.getEff();
				return cacheValue("adjacent", 0, factor, true);
			};
		},
		/**
		 * Gets the player's adjacent power of a specified tier.
		 * @param {number} tier - the tier of the adjacent power.
		 * @returns {number}
		 */
		getAdjacent(tier) {
			if (cache.adjacent && cache.adjacent[tier]) return cache.adjacent[tier];
			if (tier > 0) return cacheValue("adjacent", tier, this.getAdjacent(tier - 1) * this.getAdjacentFactor(tier));
			else return cacheValue("adjacent", 0, this.getClick(0) * this.getAdjacentFactor(0));
		},
		/**
		 * Gets the player's rhombus power factor of a specified tier.
		 * @param {number} tier - the tier of the rhombus power factor.
		 * @returns {number}
		 */
		getRhombusFactor(tier) {
			if (cache.f.rhombus && cache.f.rhombus[tier]) return cache.f.rhombus[tier];
			if (tier > 0) {
				return 0;
			} else {
				let factor = 0;
				if (hasSkill("rhom", 0)) factor += 0.05;
				if (hasSkill("rhom", 1)) factor += 0.1;
				if (hasSkill("rhom", 1)) factor += 0.15;
				return cacheValue("rhombus", 0, factor, true);
			};
		},
		/**
		 * Gets the player's rhombus power of a specified tier.
		 * @param {number} tier - the tier of the rhombus power.
		 * @returns {number}
		 */
		getRhombus(tier) {
			if (cache.rhombus && cache.rhombus[tier]) return cache.rhombus[tier];
			if (tier > 0) return cacheValue("rhombus", tier, this.getRhombus(tier - 1) * this.getRhombusFactor(tier));
			else return cacheValue("rhombus", 0, this.getAdjacent(0) * this.getRhombusFactor(0));
		},
		/**
		 * Gets the player's mirror power factor of a specified tier.
		 * @param {number} tier - the tier of the mirror power factor.
		 * @returns {number}
		 */
		getMirrorFactor(tier) {
			if (cache.f.mirror && cache.f.mirror[tier]) return cache.f.mirror[tier];
			if (tier > 0) {
				return 0;
			} else {
				let factor = 0;
				if (hasSkill("mir", 0)) factor += 0.05;
				if (hasSkill("mir", 1)) factor += 0.1;
				if (hasSkill("mir", 2)) factor += 0.15;
				return cacheValue("mirror", 0, factor, true);
			};
		},
		/**
		 * Gets the player's mirror power of a specified tier.
		 * @param {number} tier - the tier of the mirror power.
		 * @returns {number}
		 */
		getMirror(tier) {
			if (cache.mirror && cache.mirror[tier]) return cache.mirror[tier];
			if (tier > 0) return cacheValue("mirror", tier, this.getMirror(tier - 1) * this.getMirrorFactor(tier));
			else return cacheValue("mirror", 0, this.getMirrorFactor(0));
		},
		/**
		 * Gets the player's power level of a specified tier.
		 * @param {number} tier - the tier of the power level.
		 * @returns {number}
		 */
		getLevel(tier) {
			if (cache.level && cache.level[tier]) return cache.level[tier];
			return cacheValue("level", tier, (this.getClick(tier) + this.getAdjacent(tier) * 4 + this.getRhombus(tier) * 8) * (1 + this.getMirror(tier)));
		},
	};
}();
