//import * as utilFunctions from "../utilityFunctions.js";
// Importing spells

export class TRItemSettings extends FormApplication {
    constructor() {
        super(...arguments);
        this.flags = this.object.data.flags.targetreacts;
        if (this.flags) {
            if (!this.flags.options) {
                this.flags.options = {};
            }
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/targetreacts/scripts/templates/tr-item-settings.html',
            id: 'tr-item-settings',
            title: "Target Reacts Item Settings",
            resizable: true,
            width: "auto",
            height: "auto",
            closeOnSubmit: true
        });
    }

    async getSettings() {

        let hurtSettings = {
            magnitude: this.object.data.flags.targetreacts?.settings?.hurt?.magnitude ?? 0.07,
            duration: this.object.data.flags.targetreacts?.settings?.hurt?.duration ?? 250,
            amount: this.object.data.flags.targetreacts?.settings?.hurt?.amount ?? 2,
            reactDelay: this.object.data.flags.targetreacts?.settings?.hurt?.reactDelay ?? 0,
        };
        let deadSettings = {
            magnitude: this.object.data.flags.targetreacts?.settings?.dead?.magnitude ?? 0.04,
            duration: this.object.data.flags.targetreacts?.settings?.dead?.duration ?? 250,
            amount: this.object.data.flags.targetreacts?.settings?.dead?.amount ?? 4,
            reactDelay: this.object.data.flags.targetreacts?.settings?.dead?.reactDelay ?? 0,
        };

        return {
            hurtSettings: hurtSettings,
            deadSettings: deadSettings
        }
    };


    async getData() {
        let item = this.object;
        let itemName = item.name;
        let enabled = item.data?.flags?.targetreacts?.enableTR ?? true;
        let settings = await this.getSettings();
        return {
            flags: this.object.data.flags,
            itemName: itemName,
            enabled: enabled,
            hurtSettings: settings.hurtSettings,
            deadSettings: settings.deadSettings,
        };

    }
    activateListeners(html) {
        const body = $("#tr-item-settings");
        const deadSettings = $("#tr-dead-settings");
        const deadSettingsButton = $(".tr-dead-settingsButton");
        const hurtSettings = $("#tr-hurt-settings");
        const hurtSettingsButton = $(".tr-hurt-settingsButton");

        let currentTab = hurtSettingsButton;
        let currentBody = hurtSettings;


        super.activateListeners(html);
        $(".nav-tab").click(function () {
            currentBody.toggleClass("hide");
            currentTab.toggleClass("selected");
            if ($(this).hasClass("tr-dead-settingsButton")) {
                //console.log("dead");
                deadSettings.toggleClass("hide");
                currentBody = deadSettings;
                currentTab = deadSettingsButton;
            } else if ($(this).hasClass("tr-sound-settingsButton")) {
                //console.log("sound");
                soundSettings.toggleClass("hide");
                currentBody = soundSettings;
                currentTab = soundSettingsButton;
            } else if ($(this).hasClass("tr-hurt-settingsButton")) {
                //console.log("hurt");
                hurtSettings.toggleClass("hide");
                currentBody = hurtSettings;
                currentTab = hurtSettingsButton;
            }
            currentTab.toggleClass("selected");
            body.height("auto");
            body.width("auto");
        });

        html.find('.tr-enable-checkbox input[type="checkbox"]').click(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
    }

    async _updateObject(event, formData) {
        //console.log(formData);
        console.log("Updating item TR settings...");
        formData = expandObject(formData);
        //console.log(formData);
        if (!formData.changes) formData.changes = [];
        //console.log(formData.changes);
        formData.changes = Object.values(formData.changes);
        for (let c of formData.changes) {
            //@ts-ignore
            if (Number.isNumeric(c.value))
                c.value = parseFloat(c.value);
        }
        return this.object.update(formData);
    }
}
export default TRItemSettings;

Handlebars.registerHelper('ifCondTR', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        case 'includes':
            return (v1.includes(v2)) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


