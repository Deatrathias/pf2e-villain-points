import { HOOK_VILLAIN_POINTS_CHANGED, getVillainPoints, getMaxVillainPoints, addVillainPoints } from "./points.js";

export class VillainPointsWindow extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "villain-points-window",
        classes: ["faded-ui", "flexcol"],
        minimizable: false,
        tag: "aside",
        window: {
            frame: false,
            positioned: false
        },
        actions: {
            onClick: { buttons: [0, 2], handler: VillainPointsWindow._onClick }
        }
    };

    static PARTS = {
        points: {
            template: "./modules/pf2e-villain-points/templates/points.hbs"
        }
    };

    constructor(options) {
        super(options);

        Hooks.on(HOOK_VILLAIN_POINTS_CHANGED, (villainPoints) => this.render(true));
    }

    async _prepareContext(options) {
        const value = getVillainPoints();
        const max = getMaxVillainPoints();

        return {
            villainPoints: { value, max: max !== null ? max : value }
        };
    }

    static async _onClick(event, target) {
        if (!game.user.hasPermission("SETTINGS_MODIFY"))
            return;

        if (event.button == 0)
            await addVillainPoints(1);
        else if (event.button == 2)
            await addVillainPoints(-1);
    }
}