export var trSocket = undefined;

export function setupTRSocket(){
    if(game.modules.get("socketlib")?.active){
        trSocket = window.socketlib.registerModule("targetreacts");
        trSocket.register("tmfxAddFilters", tmfxAddFilters);
        trSocket.register("tmfxDeleteFiltersByName", tmfxDeleteFiltersByName);
    }
};

async function tmfxAddFilters(targetId, effect){
    const target = canvas.tokens.get(targetId);
    await TokenMagic.addFilters(target, effect);
    console.log("Done adding TMFX filters");
}

async function tmfxDeleteFiltersByName(targetId, filterName){
    const target = canvas.tokens.get(targetId);
    await target.TMFXdeleteFilters(filterName);
}