
import { TargetReaction } from "./targetReaction.js"
import { TRItemSettings } from "./apps/tr-item-settings.js";
import { TRActorSettings } from "./apps/tr-actor-settings.js";

const NAME = "targetreacts";

export class targetReacts {
    static async register() {
        targetReacts.settings();
        targetReacts.registerHooks();
    }

    static settings() {
        console.log("Registering TargetReacts game settings...");
        game.settings.register("targetreacts", "hitShake", {
            name: "Shake on hit: ",
            hint: "Shake the target when it hit",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });
        game.settings.register("targetreacts", "deathShake", {
            name: "Shake on Death: ",
            hint: "Shake the target when it dies from the hit",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

    }

    static registerHooks() {
        //Hooks.on("getSceneControlButtons", targetReacts._setSceneMenu);
        //Hooks.on("sequencer.ready", targetReacts._registerSequencerDB);
        Hooks.on("renderItemSheet", targetReacts._renderItemSheet);
        Hooks.on(`renderActorSheet5e`, targetReacts._renderActorSheet);
        Hooks.on("midi-qol.RollComplete", targetReacts._midiDamageRollComplete);
    }

    static _renderItemSheet(app, html, data) {
        const trBtn = $(`<a class="tr-item-settings" title="Target Reacts"><i class="fab fa-react"></i>TR</a>`);
        trBtn.click(ev => {
            new TRItemSettings(app.document, {}).render(true);
        });
        html.closest('.app').find('.tr-item-settings').remove();
        let titleElement = html.closest('.app').find('.window-title');
        trBtn.insertAfter(titleElement);
    }


    static _setSceneMenu(controls, b, c) {
        controls
            .find((c) => c.name == "token")
            .tools.push(
                {
                    name: "clearTargetReactsBloodSplatter",
                    title: "Bandage Wounds",
                    icon: "fas fa-band-aid",
                    button: true,
                    visible: true,
                    onClick: () => {
                        let selectedToken = canvas.tokens.controlled[0];
                        if (TokenMagic.hasFilterId(selectedToken, "targetReactsWound")) {
                            TokenMagic.deleteFiltersOnSelected("targetReactsWound");

                        }
                        if (TokenMagic.hasFilterId(selectedToken, "targetReactsDeath")) {
                            TokenMagic.deleteFiltersOnSelected("targetReactsDeath");
                        }
                    },
                }
            );

    }

    static async _registerSequencerDB() {
        let sameSoundForTargets = game.settings.get("targetreacts", "sameSoundForTargets")
        if (!sameSoundForTargets) {
            let NPCAudio = game.settings.get("targetreacts", "audioDB");
            if (NPCAudio != "") {
                let NPCAudioDB = await getJSON(NPCAudio);
                SequencerDatabase.registerEntries("TargetReactsAudioDB", NPCAudioDB);
            }
        }
    }


    static _renderActorSheet(app, html, data) {
        console.log("Caught actor sheet render hook!");
        const trBtn = $(`<a class="tr-actor-settings" title="Target Reacts"><i class="fab fa-react"></i>TR</a>`);
        trBtn.click(ev => {
            new TRActorSettings(app.document, {}).render(true);
        });
        html.closest('.app').find('.tr-actor-settings').remove();
        let titleElement = html.closest('.app').find('.window-title');
        trBtn.insertAfter(titleElement);
    }

    static async getJSON(path) {
        const response = await fetch(path);
        const json = await response.json();
        return json;
    }

    static async _midiDamageRollComplete(data) {
        console.log("-----------------Processing Target Reaction--------------------");
        console.log("----------------------------------------------------------------");
        //console.log("Target Reacts MIDI Data: ", data);
        //console.log("Hit targets: ", data.hitTargets);
        //console.log("Failed Saves: ", data.failedSaves);

        let targets = data.hitTargets ?? [];
        targets = Array.from(targets);

        const damageList = data.damageList ?? [];
        // console.log("Damage List: ", data.damageList);

        if (targets.length == 0) {
            return;
        }
        const item = data.item;
        //console.log("Target Reacts Flags: ", item.data.flags.targetreacts);
        const trEnabled = item.getFlag("targetreacts", "enableTR") ?? true;
        if (!trEnabled) return;
        const itemTROptions = data.item.getFlag("targetreacts", "options") ?? {};
        const casterId = data.tokenId;
        //console.log("Item TR Options: ", itemTROptions);

        for (const damageData of damageList) {
            // console.log("Damage Data: ", damageData);
            if (damageData.newHP > 0) {
                //console.log("Target is alive!");
                if (game.settings.get("targetreacts", "hitShake")) {
                    console.log("Shaking target from hit!");
                    //await targetHurt(damageData, itemTROptions, casterId);
                    let reaction = new TargetReaction(damageData, itemTROptions, casterId);
                    reaction.buildReactionEffect();
                    console.log("Reaction: ", reaction);
                    await reaction.react();
                }
            }
            else {
                //console.log("Target is dead!");
                if (game.settings.get("targetreacts", "deathShake")) {
                    console.log("Shaking target from death!");
                    // targetHurt(damageData, itemTROptions);
                }
            }
        }

    }
}





