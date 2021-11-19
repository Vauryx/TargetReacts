//import * as utilFunctions from "../utilityFunctions.js";
// Importing spells

export class TRActorSettings extends FormApplication {
    constructor() {
        super(...arguments);
        this.flags = this.object.data.flags.targetreacts;
        this.actor = this.object;
        if (this.flags) {
            if (!this.flags.options) {
                this.flags.options = {};
            }
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/targetreacts/scripts/templates/tr-actor-settings.html',
            id: 'tr-actor-settings',
            title: "Target Reacts Actor Settings",
            resizable: true,
            width: "auto",
            height: "auto",
            closeOnSubmit: true
        });
    }

    async getSounds() {
        let hurtSounds = this.object.data.flags.targetreacts?.hurtSounds ?? [{ path: "" }];
        let deadSounds = this.object.data.flags.targetreacts?.deadSounds ?? [{ path: "" }];
        return {
            hurtSounds: hurtSounds,
            deadSounds: deadSounds
        }
    };

    async getData() {
        let actor = this.object;
        let actorName = actor.name;
        let enabled = actor.data?.flags?.targetreacts?.enableTR ?? true;
        const sounds = await this.getSounds();
        //console.log("HURT SOUNDS: ", sounds);
        //console.log("TR ACTOR SETTINGS FORM: ", this);
        return {
            flags: this.object.data.flags,
            actorName: actorName,
            enabled: enabled,
            hurtSounds: sounds.hurtSounds,
            deadSounds: sounds.deadSounds
        };

    }
    activateListeners(html) {
        const body = $("#tr-actor-settings");
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

        html.find('.addHurtSound').click(this._addHurtSound.bind(this));
        html.find('.removeHurtSound').click(this._removeHurtSound.bind(this));

        html.find('.addDeadSound').click(this._addDeadSound.bind(this));
        html.find('.removeDeadSound').click(this._removeDeadSound.bind(this));
    }

    async _addHurtSound(e) {
        let soundsTable = document.getElementById("hurtSoundsTable").getElementsByTagName('tbody')[0];
        //console.log(summonsTable);
        //console.log(this);
        let newSoundRow = soundsTable.insertRow(-1);
        let newLabel = newSoundRow.insertCell(0);
        let newFileInput = newSoundRow.insertCell(1);
        let newBrowseButton = newSoundRow.insertCell(2);

        newLabel.innerHTML = `<label><b>Sound File Path: </b></label>`;
        newFileInput.innerHTML = `<input type="text" class="files" name="flags.targetreacts.hurtSounds.${soundsTable.rows.length - 1}.path"
                                        value=""> </td>`;

        newBrowseButton.innerHTML = `<button type="button" class="file-picker" data-type="audio"
                                                data-target="flags.targetreacts.hurtSounds.${soundsTable.rows.length - 1}.path"
                                                tabindex="-1" title="Browse Files">
                                                <i class="fas fa-music fa-sm"></i>
                                            </button>`;
        //this.submit({ preventClose: true }).then(() => this.render());
        $("#tr-actor-settings").height("auto");
        $("#tr-actor-settings").width("auto");
    }

    async _removeHurtSound(e) {
        //console.log(e);
        let soundsTable = document.getElementById("hurtSoundsTable").getElementsByTagName('tbody')[0];
        let row = soundsTable.rows[soundsTable.rows.length - 1];
        let cells = row.cells;
        //console.log(row, cells);
        let hurtSoundIndex = cells[1].children[0].name.match(/\d+/)[0];
        //console.log(hurtSoundIndex);
        const actor = game.actors.get(this.actor.id);
        soundsTable.rows[soundsTable.rows.length - 1].remove();
        await actor.unsetFlag("targetreacts", `hurtSounds.${hurtSoundIndex}`);
        if (this.flags) {
            delete this.flags.hurtSounds[hurtSoundIndex];
        }
        $("#tr-actor-settings").height("auto");
        $("#tr-actor-settings").width("auto");
        //console.log(this.flags);
        //this.submit({ preventClose: true }).then(() => this.render());

    }

    async _addDeadSound(e) {
        let soundsTable = document.getElementById("deadSoundsTable").getElementsByTagName('tbody')[0];
        //console.log(summonsTable);
        //console.log(this);
        let newSoundRow = soundsTable.insertRow(-1);
        let newLabel = newSoundRow.insertCell(0);
        let newFileInput = newSoundRow.insertCell(1);
        let newBrowseButton = newSoundRow.insertCell(2);

        newLabel.innerHTML = `<label><b>Sound File Path: </b></label>`;
        newFileInput.innerHTML = `<input type="text" class="files" name="flags.targetreacts.deadSounds.${soundsTable.rows.length - 1}.path"
                                        value=""> </td>`;

        newBrowseButton.innerHTML = `<button type="button" class="file-picker" data-type="audio"
                                                data-target="flags.targetreacts.deadSounds.${soundsTable.rows.length - 1}.path"
                                                tabindex="-1" title="Browse Files">
                                                <i class="fas fa-music fa-sm"></i>
                                            </button>`;
        //this.submit({ preventClose: true }).then(() => this.render());
        $("#tr-actor-settings").height("auto");
        $("#tr-actor-settings").width("auto");
    }

    async _removeDeadSound(e) {
        //console.log(e);
        let soundsTable = document.getElementById("deadSoundsTable").getElementsByTagName('tbody')[0];
        let row = soundsTable.rows[soundsTable.rows.length - 1];
        let cells = row.cells;
        //console.log(row, cells);
        let deadSoundIndex = cells[1].children[0].name.match(/\d+/)[0];
        //console.log(deadSoundIndex);
        const actor = game.actors.get(this.actor.id);
        soundsTable.rows[soundsTable.rows.length - 1].remove();
        await actor.unsetFlag("targetreacts", `deadSounds.${deadSoundIndex}`);
        if (this.flags) {
            delete this.flags.deadSounds[deadSoundIndex];
        }

        //console.log(this.flags);
        //this.submit({ preventClose: true }).then(() => this.render());
        $("#tr-actor-settings").height("auto");
        $("#tr-actor-settings").width("auto");

    }

    async _updateObject(event, formData) {
        //console.log(formData);
        console.log("Updating actor TR settings...");
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
export default TRActorSettings;

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


