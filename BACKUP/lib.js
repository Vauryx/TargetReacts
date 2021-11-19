async function HurtShake(target, shakeDelay, bloodOnHurt, woundSize, shakeLoops, shakeLoopDuration, targetName, targetReactionAudioVolume) {
  console.log("Hurt Shaking");
  console.log("sent shakeDelay to setTiemout: ", shakeDelay);
  let bloodEffect =
  {
    filterType: "splash",
    filterId: "targetReactsWound",
    rank: 5,
    color: 0x990505,
    padding: 80,
    time: Math.random() * 1000,
    seed: Math.random(),
    splashFactor: 1,
    spread: woundSize,
    blend: 1,
    dimX: 1,
    dimY: 1,
    cut: false,
    textureAlphaBlend: true,
    anchorX: 0.32 + (Math.random() * 0.36),
    anchorY: 0.32 + (Math.random() * 0.36)
  }
  let hurtEffect =
    [{
      filterType: "transform",
      filterId: "hurtShake",
      autoDestroy: true,
      padding: 80,
      animated:
      {
        translationX:
        {
          animType: "cosOscillation",
          val1: 0,
          val2: -0.05,
          loops: shakeLoops,
          loopDuration: shakeLoopDuration
        }
      }
    }];
  if (bloodOnHurt) {
    hurtEffect.push(bloodEffect);
  }
  setTimeout(async function () {
    let sameSoundForTargets = game.settings.get("targetreacts", "sameSoundForTargets");
    let NPCAudio = game.settings.get("targetreacts", "audioDB");
    let NPCAudioFile;
    let targetReactsSequence;
    if (NPCAudio != "") {
      if (sameSoundForTargets) {
        NPCAudioFile = NPCAudio;
        targetReactsSequence = new Sequence()
          .sound()
          .file(NPCAudioFile)
          .volume(targetReactionAudioVolume)
        targetReactsSequence.play();
      }
      else {
        NPCAudioFile = `TargetReactsAudioDB.${targetName}.hurt` ?? "";
        if (SequencerDatabase.entryExists(`TargetReactsAudioDB.${targetName}.hurt`)) {
          targetReactsSequence = new Sequence()
            .sound()
            .file(NPCAudioFile)
            .volume(targetReactionAudioVolume)
          targetReactsSequence.play();
        }
      }
    }
    TokenMagic.addFilters(target, hurtEffect)
  }, shakeDelay);
}

async function DeathShake(target, shakeDelay, bloodOnDeath, shakeLoops, shakeLoopDuration, bloodEffectDelay, targetName, targetReactionAudioVolume) {
  console.log("Death Shaking");
  let deathEffect =
    [{
      filterType: "transform",
      filterId: "hurtShake",
      autoDestroy: true,
      padding: 80,
      animated:
      {
        translationX:
        {
          animType: "cosOscillation",
          val1: 0,
          val2: -0.05,
          loops: shakeLoops,
          loopDuration: shakeLoopDuration
        }
      }
    }];
  let bloodEffect =
    [{
      filterType: "splash",
      filterId: "targetReactsDeath",
      color: 0x900505,
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
    }];
  setTimeout(function () {
    let sameSoundForTargets = game.settings.get("targetreacts", "sameSoundForTargets");
    let NPCAudio = game.settings.get("targetreacts", "audioDB");
    let NPCAudioFile;
    let targetReactsSequence;
    if (NPCAudio != "") {
      if (sameSoundForTargets) {
        NPCAudioFile = NPCAudio;
        targetReactsSequence = new Sequence()
          .sound()
          .file(NPCAudioFile)
          .volume(targetReactionAudioVolume)
        targetReactsSequence.play();
      }
      else {
        NPCAudioFile = `TargetReactsAudioDB.${targetName}.dead` ?? "";
        if (SequencerDatabase.entryExists(`TargetReactsAudioDB.${targetName}.dead`)) {
          targetReactsSequence = new Sequence()
            .sound()
            .file(NPCAudioFile)
            .volume(targetReactionAudioVolume)
          targetReactsSequence.play();
        }
      }
    }
    TokenMagic.addFilters(target, deathEffect);
    if (bloodOnDeath) {
      setTimeout(function () {
        TokenMagic.addFilters(target, bloodEffect, true)
      }, bloodEffectDelay);
    }
  }, shakeDelay);
}

Hooks.on("midi-qol.RollComplete", function (data) {
  if (data.hitTargets.size > 0) {
    let targetHurtAudioVolume = game.settings.get("targetreacts", "targetHurtAudioVolume");
    let targetDeathAudioVolume = game.settings.get("targetreacts", "targetDeathAudioVolume");
    let defaultDelay = game.settings.get("targetreacts", "defaultShakeDelay");
    let bloodOnHurt = game.settings.get("targetreacts", "bloodOnHurt");
    let bloodOnDeath = game.settings.get("targetreacts", "bloodOnDeath");
    let shakeDelay = getProperty(data.item, "data.flags.targetreacts.shakeDelay") ?? "";
    console.log("Detected shake delay on item: ", shakeDelay);
    let hurtShakeLoops = game.settings.get("targetreacts", "hurtShakeLoops");
    let hurtShakeLoopTime = game.settings.get("targetreacts", "hurtShakeLoopTime");
    let deathShakeLoops = game.settings.get("targetreacts", "deathShakeLoops");
    let deathShakeLoopTime = game.settings.get("targetreacts", "deathShakeLoopTime");
    let bloodEffectDelay = game.settings.get("targetreacts", "deathBloodDelay");
    let woundSizeScalar = game.settings.get("targetreacts", "woundSizeScalar");

    let target = [...data.hitTargets][0];
    let targetToken = canvas.tokens.get(target?._id);
    if (targetToken == undefined) {
      targetToken = target;
    }
    let targetName = target.data.name;
    let hpDamage = 0;
    let newHP = 0;
    let targetMaxHP = 1;
    let damageTotal = data.damageTotal;
    let HpLost = 0;
    let woundSize = 0.5;

    if (data.damageList) {
      hpDamage = data.damageList[0].hpDamage;
      newHP = data.damageList[0].newHP;
    }

    if (target.document != undefined) {
      targetMaxHP = target.document._actor.data.data.attributes.hp.max;
    }
    else {
      targetMaxHP = target._actor.data.data.attributes.hp.max;
    }

    HpLost = (damageTotal / targetMaxHP) * 100;
    woundSize = Math.abs((0.02 * HpLost) + woundSizeScalar);

    if (shakeDelay == "" || shakeDelay == undefined) {
      shakeDelay = defaultDelay;
    }
    if (hpDamage > 0 && newHP > 0) {
      HurtShake(targetToken, shakeDelay, bloodOnHurt, woundSize, hurtShakeLoops, hurtShakeLoopTime, targetName, targetHurtAudioVolume);
    }
    else if (hpDamage > 0 && newHP <= 0) {
      DeathShake(targetToken, shakeDelay, bloodOnDeath, deathShakeLoops, deathShakeLoopTime, bloodEffectDelay, targetName, targetDeathAudioVolume);
    }
  }
});
