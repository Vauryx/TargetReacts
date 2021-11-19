import * as utilFunctions from "./utilityFunctions.js";
export class TargetReaction {
    constructor(options) {
        //console.log("Target Reaction: ", options);
        this.damageData = options.damageData;
        this.target = canvas.tokens.get(options.damageData.tokenId);
        this.caster = canvas.tokens.get(options.casterId);

        let hitRay = new Ray(this.caster, this.target);
        this.shakeDirection = { x: Math.sign(hitRay.dx), y: Math.sign(hitRay.dy) };

        this.itemSettings = options.itemSettings;
        this.actorSettings = options.actorSettings;
        this.targetHurtSounds = options.actorSettings.hurtSounds ?? [];
        this.targetDeadSounds = options.actorSettings.deadSounds ?? [];

        this.alive = options.damageData.newHP > 0;

        this.reactionEffect = [];
        this.reactionSequence = new Sequence();


        if (options.itemReactionEnabled) {
            this.buildShake();
            if (options.actorReactionEnabled) {
                this.buildSound();
            }
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

        const shakeMagnitude = this.alive ? this.itemSettings.hurt.magnitude : this.itemSettings.dead.magnitude;
        const shakeDuration = this.alive ? this.itemSettings.hurt.duration : this.itemSettings.dead.duration;
        const shakeAmount = this.alive ? this.itemSettings.hurt.amount : this.itemSettings.dead.amount;

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
        await utilFunctions.wait(this.alive ? this.itemSettings.hurt.reactDelay : this.itemSettings.dead.reactDelay);
        if (this.alive) {
            await TokenMagic.addFilters(this.target, this.reactionEffect);
        } else if (!this.alive) {
            if (this.actorSettings.deadSettings.blood) {
                await this.target.TMFXdeleteFilters("trWoundSplash");
            }
            await TokenMagic.addFilters(this.target, this.reactionEffect);
        }
        await this.reactionSequence.play();
    }

};