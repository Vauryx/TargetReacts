export class TRActorSettings extends FormApplication {
    constructor() {
        super(...arguments);
        this.flags = this.object.data.flags.targetreacts
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/TargetReacts/scripts/lib/tr-actor-settings.html',
            id: 'TR-item-settings',
            title: "Target Reacts Actor Settings",
            resizable: true,
            width: 600,
            height: "auto",
            closeOnSubmit: true,
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "audio-override" }]
        });
    }
    getData() {
        let flags = this.object.data.flags;
        console.log(flags);
        let content = "";
        return {
            actorAudio: flags.targetreacts?.allSounds?.actor?.file || "",
            delayAudio: flags.targetreacts?.allSounds?.actor?.delay || 0,
            volumeAudio: flags.targetreacts?.allSounds?.actor?.volume || 0.25,
            flags: this.object.data.flags,
            content: content,
        };

    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.files').change(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
        html.find('.tr-audio-checkbox input[type="checkbox"]').click(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
        html.find('.tr-audio-checkbox input[type="Number"]').change(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
    }

    async _updateObject(event, formData) {
        //console.log(formData);
        formData = expandObject(formData);
        if (!formData.changes)
            formData.changes = [];
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
