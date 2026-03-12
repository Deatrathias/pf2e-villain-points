import { MODULE_NAME, LOCALE_ROOT } from "./main.js";

const VILLAIN_POINTS = "villainPoints";

export const HOOK_VILLAIN_POINTS_CHANGED = "villainPointsChanged";

export const SETTINGS = {
	VILLAIN_POINTS_VALUE: "villainPointsValue",
	VILLAIN_POINTS_MAX: "villainPointsMax",
	PLAYER_VISIBLE: "playerVisible"
};

export function getVillainPoints() {
	return game.settings.get(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE);
}

export function getMaxVillainPoints() {
	return game.settings.get(MODULE_NAME, SETTINGS.VILLAIN_POINTS_MAX);
}

export async function addVillainPoints(count = 1) {
	let max = getMaxVillainPoints();
	if (max < 0)
		max = Infinity;
	const points = Math.clamp(getVillainPoints() + count, 0, max);
	return await game.settings.set(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE, points);
}

export function initPoints() {
	game.settings.register(MODULE_NAME, SETTINGS.VILLAIN_POINTS_MAX, {
		scope: "world",
		type: Number,
		default: 3,
		config: true,
		onChange: (args) => Hooks.callAll(HOOK_VILLAIN_POINTS_CHANGED, args[0]),
		name: `${LOCALE_ROOT}.Settings.VillainPointsMaximum`,
		hint: `${LOCALE_ROOT}.Settings.VillainPointsMaximumHint`
	});
	game.settings.register(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE, {
		scope: "world",
		type: Number,
		default: 0,
		onChange: (args) => Hooks.callAll(HOOK_VILLAIN_POINTS_CHANGED, args[0])
	});
	game.settings.register(MODULE_NAME, SETTINGS.PLAYER_VISIBLE, {
		scope: "world",
		type: Boolean,
		default: true,
		config: true,
		requiresReload: true,
		name: `${LOCALE_ROOT}.Settings.PlayerVisible`,
		hint: `${LOCALE_ROOT}.Settings.PlayerVisibleHint`
	});
}