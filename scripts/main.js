import { getVillainPoints, addVillainPoints, initPoints, SETTINGS } from "./points.js";
import { VillainPointsWindow } from "./window.js";

export const MODULE_NAME = "pf2e-villain-points";

export const LOCALE_ROOT = "PF2E-VILLAIN-POINTS";
const LOCALE_REROLLMENU = `${LOCALE_ROOT}.RerollMenu`;

Hooks.on("init", () => {
	libWrapper.register(MODULE_NAME, "CONFIG.ui.chat.prototype._getEntryContextOptions", entryContextOptionsWrapper);
	game.villainPoints = {
		add: addVillainPoints
	};
	initPoints();
});

Hooks.on("setup", () => {
	if (game.user.isGM || game.settings.get(MODULE_NAME, SETTINGS.PLAYER_VISIBLE)) {
		CONFIG.ui.villainPoints = VillainPointsWindow;
		const template = document.createElement("template");
		template.setAttribute("id", VillainPointsWindow.DEFAULT_OPTIONS.id);
		document.getElementById("players").before(template);
	}
});

Hooks.on("ready", async () => {
	ui.villainPoints?.render(true);
});

async function alterMessageFlavor(message, data, options, userId) {
	const flavor = data.flavor.slice(data.flavor.search("</i>") + 4);
	const icon = document.createElement("i");
	icon.classList.add("fa-solid", "fa-eye-evil", "reroll-indicator");
	icon.dataset.tooltip = game.i18n.localize(`${LOCALE_REROLLMENU}.MessageVillainPoints`);

	message.updateSource({ flavor: `${icon.outerHTML}${flavor}` });
	await addVillainPoints(-1);
}

function entryContextOptionsWrapper(wrapped) {
	let options = wrapped();
	const rerollNew = options.findIndex(option => option.name === "PF2E.RerollMenu.KeepNew");
	if (rerollNew < 0) {
		console.log("Reroll New not found");
		return options;
	}
	const canVillainPointReroll = (li) => {
		const message = game.messages.get(li.dataset.messageId, { strict: true });
		return message.isRerollable && game.user.hasPermission("SETTINGS_MODIFY") && getVillainPoints() > 0;
	};
	options.splice(rerollNew - 1, 0, {
		name: `${LOCALE_REROLLMENU}.VillainPoint`,
		icon: foundry.applications.fields.createFontAwesomeIcon("eye-evil").outerHTML,
		condition: canVillainPointReroll,
		callback: async (li) => {
			if (getVillainPoints() == 0) {
				ui.notifications.warn(`${LOCALE_REROLLMENU}.WarnNoVillainPoint`, { localize: true });
				return;
			}
			const message = game.messages.get(li.dataset.messageId, { strict: true });
			const hookId = Hooks.once("preCreateChatMessage", alterMessageFlavor);
			await game.pf2e.Check.rerollFromMessage(message, { keep: "new" });
			Hooks.off("preCreateChatMessage", hookId);
		}
	});
	return options;
}