import * as utilFunctions from "./utilityFunctions.js";
export class TargetReaction {
    constructor(damageData, options, casterId) {
        this.damageData = damageData;
        this.options = options;
        this.target = canvas.tokens.get(damageData.tokenId);
        this.caster = canvas.tokens.get(casterId);
        let hitRay = new Ray(this.caster, this.target);
        this.shakeDirection = { x: Math.sign(hitRay.dx), y: Math.sign(hitRay.dy) };
        this.hurtReactDelay = options.hurtReactDelay ?? 0;
        this.deadReactDelay = options.deadReactDelay ?? 0;
        this.reactionEfect = [];


    }

    buildReactionEffect() {
        this.reactionEfect.push({
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
                    val2: this.shakeDirection.x * (-0.07),
                    loops: 2,
                    loopDuration: 250
                },
                translationY:
                {
                    animType: "cosOscillation",
                    val1: 0,
                    val2: this.shakeDirection.y * (-0.07),
                    loops: 2,
                    loopDuration: 250
                }
            }
        });
        //console.log(this);
    }

    async react() {
        console.log("Hurt target detected...");
        console.log('Target Reaction: ', this);
        await utilFunctions.wait(this.hurtReactDelay);
        await TokenMagic.addFilters(this.target, this.reactionEfect);
    }

};