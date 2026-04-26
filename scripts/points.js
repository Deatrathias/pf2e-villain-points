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
	if (max === null)
		max = Infinity;
	const points = Math.clamp(getVillainPoints() + count, 0, max);
	return await game.settings.set(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE, points);
}

export function initPoints() {
	game.settings.register(MODULE_NAME, SETTINGS.VILLAIN_POINTS_MAX, {
		scope: "world",
		type: new foundry.data.fields.NumberField({ min: 0, nullable: true }),
		default: 3,
		config: true,
		onChange: (value) => {
			const points = game.settings.get(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE);
			if (value !== null && points > value) 
				game.settings.set(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE, value);
			else
				Hooks.callAll(HOOK_VILLAIN_POINTS_CHANGED, points);

		},
		name: `${LOCALE_ROOT}.Settings.VillainPointsMaximum`,
		hint: `${LOCALE_ROOT}.Settings.VillainPointsMaximumHint`
	});
	game.settings.register(MODULE_NAME, SETTINGS.VILLAIN_POINTS_VALUE, {
		scope: "world",
		type: Number,
		default: 0,
		onChange: (value) => Hooks.callAll(HOOK_VILLAIN_POINTS_CHANGED, value)
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