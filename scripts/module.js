import { targetReacts } from "./targetReacts.js";
const SUB_MODULES = {
    targetReacts
}

Hooks.on(`setup`, () => {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
  });
  