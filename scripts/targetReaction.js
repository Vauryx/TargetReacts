import * as utilFunctions from "./utilityFunctions.js";
import { trSocket } from "./trSockets.js";
export class TargetReaction {
    constructor(options) {
        //console.log("Target Reaction: ", options);
        this.damageData = options.damageData;
        this.targetId = options.damageData.tokenId;
        this.target = canvas.tokens.get(options.damageData.tokenId);
        this.caster = canvas.tokens.get(options.casterId);

        let hitRay = new Ray(this.caster, this.target);
        this.shakeDirection = { x: Math.sign(hitRay.dx), y: Math.sign(hitRay.dy) };

        this.itemReactionEnabled = options.itemReactionEnabled;
        this.actorReactionEnabled = options.actorReactionEnabled;
        this.itemSettings = options.itemSettings;
        this.actorSettings = options.actorSettings;
        this.targetHurtSounds = options.actorSettings.hurtSounds ?? [];
        this.targetDeadSounds = options.actorSettings.deadSounds ?? [];

        this.alive = options.damageData.newHP > 0;

        this.reactionEffect = [];
        this.reactionSequence = new Sequence();

        if (options.actorReactionEnabled) {
            this.buildSound();
        }
        if (options.itemReactionEnabled) {
            this.buildShake();
            if (options.actorSettings.hurtSettings.blood || options.actorSettings.deadSettings.blood) {
                this.buildBlood();
            }
        }

    }

    buildBlood() {
        if (this.alive && this.actorSettings.hurtSettings.blood) {
            this.reactionEffect.push({
                filterType: "splash",
                filterId: "trWoundSplash",
                rank: 5,
                color: this.actorSettings.hurtSettings.bloodColor,
                padding: 80,
                time: Math.random() * 1000,
                seed: Math.random(),
                splashFactor: 1,
                spread: 0.4,
                blend: 1,
                dimX: 1,
                dimY: 1,
                cut: false,
                textureAlphaBlend: true,
                anchorX: 0.32 + (Math.random() * 0.36),
                anchorY: 0.32 + (Math.random() * 0.36)
            });
        } else if (!this.alive && this.actorSettings.deadSettings.blood) {
            this.reactionEffect.push({
                filterType: "splash",
                filterId: "trDeadSplash",
                color: this.actorSettings.deadSettings.bloodColor,
                padding: 30,
                time: Math.random() * 1000,
                seed: Math.random() / 100,
                splashFactor: 2,
                spread: 7,
                blend: 1,
                dimX: 1,
                dimY: 1,
                cut: true,
                textureAlphaBlend: false
            });
        }
    }

    buildShake() {

        const shakeMagnitude = this.alive ? this.itemSettings.hurt?.magnitude : this.itemSettings.dead?.magnitude ?? 0.07;
        const shakeDuration = this.alive ? this.itemSettings.hurt?.duration : this.itemSettings.dead?.duration ?? 250;
        const shakeAmount = this.alive ? this.itemSettings.hurt?.amount : this.itemSettings.dead?.amount ?? 2;

        this.reactionEffect.push({
            filterType: "transform",
            filterId: "trShake",
            autoDestroy: true,
            padding: 80,
            animated:
            {
                translationX:
                {
                    animType: "cosOscillation",
                    val1: 0,
                    val2: this.shakeDirection.x * (-shakeMagnitude),
                    loops: shakeAmount,
                    loopDuration: shakeDuration
                },
                translationY:
                {
                    animType: "cosOscillation",
                    val1: 0,
                    val2: this.shakeDirection.y * (-shakeMagnitude),
                    loops: shakeAmount,
                    loopDuration: shakeDuration
                }
            }
        });
        //console.log(this);
    }

    buildSound() {

        let sounds = this.alive ? this.targetHurtSounds : this.targetDeadSounds;
        const volume = this.alive ? this.actorSettings.hurtSettings.volume : this.actorSettings.deadSettings.volume;
        let validatedSounds = [];
        for (const [key, value] of Object.entries(sounds)) {

            if (value.path != "" && value.path != null && value.path != undefined) {
                validatedSounds.push(value.path);
            }
        }

        this.reactionSequence.sound()
            .file(validatedSounds)
            .playIf(validatedSounds.length > 0)
            .volume(volume)

    }

    async react() {
        console.log("Hurt target detected...");
        console.log('Target Reaction: ', this);
        if (this.itemReactionEnabled) {
            await utilFunctions.wait(this.alive ? this.itemSettings.hurt?.reactDelay : this.itemSettings.dead?.reactDelay ?? 0);
        }
        if (this.alive) {
            console.log("Adding TMFX filters: ", this.targetId, this.reactionEffect);
            //await TokenMagic.addFilters(this.target, this.reactionEffect);
            await trSocket.executeAsGM("tmfxAddFilters", this.targetId, this.reactionEffect);
        } else if (!this.alive) {
            if (this.actorSettings.deadSettings.blood) {
                //await this.target.TMFXdeleteFilters("trWoundSplash");
                await trSocket.executeAsGM("tmfxDeleteFiltersByName", this.targetId, "trWoundSplash");
            }
            //await TokenMagic.addFilters(this.target, this.reactionEffect);
            await trSocket.executeAsGM("tmfxAddFilters", this.targetId, this.reactionEffect);
        }
        await this.reactionSequence.play();
    }

};