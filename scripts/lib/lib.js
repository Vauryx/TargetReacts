function HurtShake(shakeDelay, bloodOnHurt, woundSize, shakeLoops, shakeLoopDuration)
{
  console.log("Hurt Shaking");
  let bloodEffect = 
  {
    filterType: "splash",
    filterId: "wound",
    rank:5,
    color: 0x990505,
    padding: 80,
    time: Math.random()*1000,
    seed: Math.random(),
    splashFactor: 1,
    spread: woundSize,
    blend: 1,
    dimX: 1,
    dimY: 1,
    cut: false,
    textureAlphaBlend: true,
    anchorX: 0.32+(Math.random()*0.36),
    anchorY: 0.32+(Math.random()*0.36)
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
  if (bloodOnHurt)
  {
    hurtEffect.push(bloodEffect);
  }
  setTimeout(function(){
    TokenMagic.addFiltersOnTargeted(hurtEffect);
  },shakeDelay);
}

function DeathShake(shakeDelay, bloodOnDeath, shakeLoops, shakeLoopDuration, bloodEffectDelay)
{
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
      filterId: "death",
      color: 0x900505,
      padding: 30,
      time: Math.random()*1000,
      seed: Math.random()/100,
      splashFactor: 2,
      spread: 7,
      blend: 1,
      dimX: 1,
      dimY: 1,
      cut: true,
      textureAlphaBlend: false
  }];
  setTimeout(function(){
    TokenMagic.addFiltersOnTargeted(deathEffect);
    if(bloodOnDeath)
    {
      setTimeout(function(){
        TokenMagic.addFiltersOnTargeted(bloodEffect, true);
      },bloodEffectDelay);
    }   
  },shakeDelay);
}

Hooks.on("midi-qol.RollComplete", function(data){
  if(data.hitTargets.size > 0)
  {
    let defaultDelay = game.settings.get("TargetReacts","defaultShakeDelay");
    let bloodOnHurt = game.settings.get("TargetReacts","bloodOnHurt");
    let bloodOnDeath = game.settings.get("TargetReacts","bloodOnDeath");
    let shakeDelay = getProperty(data.item, "data.flags.TargetReacts.shakeDelay");
    let hurtShakeLoops = game.settings.get("TargetReacts","hurtShakeLoops");
    let hurtShakeLoopTime = game.settings.get("TargetReacts","hurtShakeLoopTime");
    let deathShakeLoops = game.settings.get("TargetReacts","deathShakeLoops");
    let deathShakeLoopTime = game.settings.get("TargetReacts","deathShakeLoopTime");
    let bloodEffectDelay = game.settings.get("TargetReacts","deathBloodDelay");
    let woundSizeScalar =  game.settings.get("TargetReacts","woundSizeScalar");
    
    let hpDamage = data.damageList[0].hpDamage;
    let newHP = data.damageList[0].newHP;
    let targetMaxHP = [...data.hitTargets][0].document._actor.data.data.attributes.hp.max;
    let damageTotal = data.damageTotal;
    let HpLost = (damageTotal/targetMaxHP) * 100;
    let woundSize = Math.abs((0.02*HpLost) + woundSizeScalar);
    if (shakeDelay == "")
    {
      shakeDelay = defaultDelay;
    }
    if (hpDamage > 0 && newHP > 0)
    {
      HurtShake(shakeDelay, bloodOnHurt, woundSize, hurtShakeLoops, hurtShakeLoopTime);
    }
    else if (hpDamage > 0 && newHP <= 0)
    {
      DeathShake(shakeDelay, bloodOnDeath, deathShakeLoops, deathShakeLoopTime, bloodEffectDelay);
    }
  }
});

Hooks.on("renderItemSheet", (app, html, data) => {
  const element = html.find('input[name="data.chatFlavor"]').parent().parent();
  const labelText = "Target Shake Delay";
  const shakeDelay = getProperty(app.object.data, "flags.TargetReacts.shakeDelay") ?? "";
  const shakeDelayField = `<div class="form-group"><label>${labelText}</label><input type="text" name="flags.TargetReacts.shakeDelay" value="${shakeDelay}"/> </div>`;
  element.append(shakeDelayField); 
});
