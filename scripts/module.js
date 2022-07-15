import { targetReacts } from "./targetReacts.js";
import { setupTRSocket } from "./trSockets.js";
const SUB_MODULES = {
    targetReacts
}

Hooks.on(`setup`, () => {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
    setupTRSocket();
    
  });
  