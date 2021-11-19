import * as utilFunctions from "./utilityFunctions.js";
export class TargetReaction {
    constructor(options) {
        this.damageData = options.damageData;
        this.target = canvas.tokens.get(options.damageData.tokenId);
        this.caster = canvas.tokens.get(options.casterId);
        let hitRay = new Ray(this.caster, this.target);
        this.shakeDirection = { x: Math.sign(hitRay.dx), y: Math.sign(hitRay.dy) };
        this.hurtReactDelay = options.itemSettings.hurtReactDelay ?? 0;
        this.deadReactDelay = options.itemSettings.deadReactDelay ?? 0;
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
        }

    }

    buildShake() {

        const shakeMagnitude = this.alive ? 0.07 : 0.1;
        const shakeDuration = this.alive ? 250 : 250;
        const shakeAmount = this.alive ? 2 : 4;

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
        let validatedSounds = [];
        for (const [key, value] of Object.entries(sounds)) {

            if (value.path != "" && value.path != null && value.path != undefined) {
                validatedSounds.push(value.path);
            }
        }

        this.reactionSequence.sound()
            .file(validatedSounds)
            .playIf(validatedSounds.length > 0)
            .volume(1)

    }

    async react() {
        console.log("Hurt target detected...");
        console.log('Target Reaction: ', this);
        await utilFunctions.wait(this.alive ? this.hurtReactDelay : this.deadReactDelay);
        await TokenMagic.addFilters(this.target, this.reactionEffect);
        await this.reactionSequence.play();
    }

};