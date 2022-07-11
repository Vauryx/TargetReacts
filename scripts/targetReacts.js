
import { TargetReaction } from "./targetReaction.js"
import { TRItemSettings } from "./apps/tr-item-settings.js";
import { TRActorSettings } from "./apps/tr-actor-settings.js";
import * as utilFunctions from "./utilityFunctions.js";

const NAME = "targetreacts";

export class targetReacts {
    static async register() {
        targetReacts.settings();
        targetReacts.registerHooks();
    }

    static settings() {
        console.log("Registering TargetReacts game settings...");
        game.settings.register("targetreacts", "itemReactDefault", {
            name: "Item Default TR Behaviour",
            hint: "Item Target Reactions enabled by default?",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

    }

    static registerHooks() {
        Hooks.on("getSceneControlButtons", targetReacts._setSceneMenu);
        Hooks.on("renderItemSheet", targetReacts._renderItemSheet);
        Hooks.on(`renderActorSheet5e`, targetReacts._renderActorSheet);
        if (utilFunctions.isMidiActive()) {
            Hooks.on("midi-qol.RollComplete", targetReacts._midiDamageRollComplete);
        } else {
            Hooks.on("preCreateChatMessage", targetReacts._preCreateChatMessage);
            Hooks.on("createChatMessage", targetReacts._postCreateChatMessage);
        }
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
                    title: "Clear TR Blood Effects",
                    icon: "fas fa-band-aid",
                    button: true,
                    visible: true,
                    onClick: async () => {
                        for await (const selectedToken of canvas.tokens.controlled) {
                            if (TokenMagic.hasFilterId(selectedToken, "trWoundSplash")) {
                                await TokenMagic.deleteFiltersOnSelected("trWoundSplash");

                            }
                            if (TokenMagic.hasFilterId(selectedToken, "trDeadSplash")) {
                                await TokenMagic.deleteFiltersOnSelected("trDeadSplash");
                            }
                        }
                    },
                }
            );

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

    static async _midiDamageRollComplete(data) {
        console.log("-----------------Processing Target Reaction--------------------");

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
        const itemTREnabled = item.getFlag("targetreacts", "enableTR") ?? game.settings.get("targetreacts", "itemReactDefault");
        const itemTROptions = data.item.getFlag("targetreacts", "settings") ?? {
            hurt: {
                reactDelay: 0,
                magnitude: 0.07,
                amount: 2,
                duration: 250
            }, dead: {
                reactDelay: 0,
                magnitude: 0.04,
                amount: 4,
                duration: 250
            }
        };
        const casterId = data.tokenId;

        const targetReactionSettings = {
            itemSettings: itemTROptions,
            actorSettings: {},
            itemReactionEnabled: itemTREnabled,
            actorReactionEnabled: false,
            casterId: casterId,
            damageData: {}
        };
        //console.log("Item TR Options: ", itemTROptions);

        for (const damageData of damageList) {
            let targetActor = canvas.tokens.get(damageData.tokenId).actor;
            let actorTREnabled = targetActor.getFlag("targetreacts", "enableTR") ?? false;
            let actorTROptions = {
                hurtSettings: targetActor.getFlag("targetreacts", "hurtSettings") ?? { blood: false, volume: 1, bloodColor: "#990505" },
                hurtSounds: targetActor.getFlag("targetreacts", "hurtSounds") ?? {},
                deadSounds: targetActor.getFlag("targetreacts", "deadSounds") ?? {},
                deadSettings: targetActor.getFlag("targetreacts", "deadSettings") ?? { blood: false, volume: 1, bloodColor: "#990505" },
            };
            // if either deadSettings bloodColor or hurtSettings bloodColor starts with a '#' then change it to start with '0x' instead
            if (actorTROptions.deadSettings?.bloodColor?.startsWith("#")) {
                actorTROptions.deadSettings.bloodColor = "0x" + actorTROptions.deadSettings.bloodColor.substring(1);
            }
            if (actorTROptions.hurtSettings?.bloodColor?.startsWith("#")) {
                actorTROptions.hurtSettings.bloodColor = "0x" + actorTROptions.hurtSettings.bloodColor.substring(1);
            }
            targetReactionSettings.damageData = damageData;
            targetReactionSettings.actorSettings = actorTROptions;
            targetReactionSettings.actorReactionEnabled = actorTREnabled;
            let reaction = new TargetReaction(targetReactionSettings);
            reaction.react();
        }
        console.log("----------------------------------------------------------------");
    }

    static async _preCreateChatMessage(msg) {
        console.log('Pre Chat Message: ', msg);
        const tokenId = msg.data.speaker.token;
        const caster = canvas.tokens.get(tokenId);
        const casterActor = caster?.actor;
        const item = casterActor?.items?.getName(msg.data.flavor);
        //if (!caster || !item) return;

        const chatContent = msg.data.content;
        const targets = Array.from(game.user.targets);

        let data = {
            actor: casterActor,
            token: caster,
            tokenId: tokenId,
            item: item,
            targets: targets,
            itemCardId: msg.id,
            chatContent: chatContent
        }
        console.log("Pre-Create Chat Message Data: ", data);
    }

    static async _postCreateChatMessage(msg) {
        console.log('Post Chat Message: ', msg);
        const tokenId = msg.data.speaker.token;
        const caster = canvas.tokens.get(tokenId);
        const casterActor = caster?.actor;
        const item = casterActor?.items?.getName(msg.data.flavor);
        //if (!caster || !item) return;

        const chatContent = msg.data.content;
        const targets = Array.from(game.user.targets);

        let data = {
            actor: casterActor,
            token: caster,
            tokenId: tokenId,
            item: item,
            targets: targets,
            itemCardId: msg.id,
            chatContent: chatContent
        }
        console.log("Post-Create Chat Message Data: ", data);
    }
}





