import TRActorSettings from "./lib/targetReactPage.js";

Hooks.once('init', async function() {
    console.log("Registering TargetReacts game settings...");
    game.settings.register("targetreacts", "sameSoundForTargets", {  
        name: "Use same sound for all target reactions?",                  
        hint: "Will use the sound file provided below for all target reactions",               
        scope: "world",                                     
        config: true,                                      
        type: Boolean,
        default: false                                    
    });
    game.settings.register("targetreacts", "audioDB", {
        name: "Audio JSON File",
        hint: "Please provide a JSON file if not using the same sound for all enemies, otherwise provide the sound file",
        scope: 'world',
        type: String,
        default: "",
        filePicker: true,
        config: true,
        onChange: value => 
        { // A callback function which triggers when the setting is changed
            console.log(value);
            window.location.reload();
            if (value != "")
            {
                async function getJSON(path){
                    const response = await fetch(path);
                    const json = await response.json();
                    return json;
                }
                let NPCAudioDB = getJSON(value);
                SequencerDatabase.registerEntries("TargetReactsAudioDB", NPCAudioDB);
            }
        }
    });
    game.settings.register("targetreacts", "targetHurtAudioVolume", {  
        name: "Target Reaction Audio On Hurt Volume",                  
        hint: "Set how loudly the target reaction sound when hurt will play",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 0,
        max: 1,
        step: 0.05,
        },
        default: 0.5                                  
    });
    game.settings.register("targetreacts", "targetDeathAudioVolume", {  
        name: "Target Reaction Audio On Death Volume",                  
        hint: "Set how loudly the target reaction sound when dying will play",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 0,
        max: 1,
        step: 0.05,
        },
        default: 0.5                                  
    });
    game.settings.register("targetreacts", "defaultShakeDelay", {  
        name: "Default Shake/Audio Delay",                  
        hint: "Set default delay for target reaction shake and audio",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 0,
        max: 5000,
        step: 25,
        },
        default: 1750                                  
    });
    game.settings.register("targetreacts", "bloodOnHurt", {  
        name: "Blood when hurt?",                  
        hint: "Apply the hurt blood splatter when target loses hp on hit?",               
        scope: "world",                                     
        config: true,                                      
        type: Boolean,
        default: true                                    
    });
    game.settings.register("targetreacts", "woundSizeScalar", {  
        name: "Minimum wound size",                  
        hint: "Set the blood splatter, when hurt, effect minimum size. Splatter will scale up based on percentage of health lost",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 0.1,
        max: 1,
        step: 0.05,
        },
        default: 0.1                                   
    });
    game.settings.register("targetreacts", "bloodOnDeath", {  
        name: "Blood when death?",                  
        hint: "Apply the death blood splatter when target dies on hit?",               
        scope: "world",                                     
        config: true,                                      
        type: Boolean,
        default: true                                    
    });
    game.settings.register("targetreacts", "hurtShakeLoops", {  
        name: "Hurt Shake Loops",                  
        hint: "Set how many times to shake when hurt",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 1,
        max: 5,
        step: 1,
        },
        default: 2                                    
    });
    game.settings.register("targetreacts", "hurtShakeLoopTime", {  
        name: "Hurt Shake Loop Time",                  
        hint: "Set how long the shakes when hurt should take",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 50,
        max: 1000,
        step: 25,
        },
        default: 150                                    
    });
    game.settings.register("targetreacts", "deathShakeLoops", {  
        name: "Death Shake Loops",                  
        hint: "Set how many times to shake on death",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 1,
        max: 5,
        step: 1,
        },
        default: 4                                    
    });
    game.settings.register("targetreacts", "deathShakeLoopTime", {  
        name: "Death Shake Loop Time",                  
        hint: "Set how long the shakes on death should take",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 50,
        max: 1000,
        step: 25,
        },
        default: 150                                    
    });
    game.settings.register("targetreacts", "deathBloodDelay", {  
        name: "Death Blood Effect Delay",                  
        hint: "Set how long to delay the blood splat on death",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 0,
        max: 5000,
        step: 50,
        },
        default: 400                                   
    });
});

Hooks.on("getSceneControlButtons", (controls, b, c) => {
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
            if(TokenMagic.hasFilterId(selectedToken,"targetReactsWound"))
            {
                TokenMagic.deleteFiltersOnSelected("targetReactsWound");
                
            }
            if (TokenMagic.hasFilterId(selectedToken,"targetReactsDeath"))
            {
                TokenMagic.deleteFiltersOnSelected("targetReactsDeath");
            }
          },
        }
      );
  });


Hooks.on("sequencer.ready", async () => {
    async function getJSON(path){
        const response = await fetch(path);
        const json = await response.json();
        return json;
      }
    let sameSoundForTargets = game.settings.get("targetreacts", "sameSoundForTargets")
    if(!sameSoundForTargets)
    {
        let NPCAudio = game.settings.get("targetreacts","audioDB");
        if (NPCAudio != "")
        {
            let NPCAudioDB = await getJSON(NPCAudio);
            SequencerDatabase.registerEntries("TargetReactsAudioDB", NPCAudioDB);
        }
    }
});

/*Hooks.on(`renderActorSheet5eNPC`, async (app, html, data) => {
  
    console.log("Caught actor sheet render hook!");
    const trBtn = $(`<a class="tr-actor-settings" title="T-R"><i class="fas fa-biohazard"></i>Target Reacts</a>`);
    trBtn.click(ev => {
      new TRActorSettings(app.entity, {}).render(true);
    });
      html.closest('.app').find('.tr-actor-settings').remove();
      let titleElement = html.closest('.app').find('.window-title');
      trBtn.insertAfter(titleElement);
  });*/