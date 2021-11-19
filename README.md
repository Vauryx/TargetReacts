# Target Reacts
## This module requires the following modules
- Sequencer
- Token Magic Fx
- MIDI-QOL

## Overview
- This module works in conjunction with MIDI-QOL to add certain effects to the target when they are hit by a roll. 
- Reactions can be set up and customzied for each item, as well as each target individually
- Sounds can be added to targets to be played at random when they are hit

## Usage Instructions

# Item Settings
- These are the item specific settings. The first tab controlls settings for when the target is hit, but does not die from the hit
- The second tab controlls settings for when the target dies from the hit 

![target-reacts-item-settings](https://user-images.githubusercontent.com/32877348/142693460-f01692ab-0783-4fed-b889-89c407a7a74e.png)
- **Reaction Delay:** Delay on the target's reaction caused by this item 
- **Shake Magnitude:** How far from the initial spot the target will move
- **Shake Amount:** How many times to shake the target
- **Shake Duration:** How long each (singular) shake animation will take in ms
- 
# Actor Settings
- These are the actor specific settings. Similarly to the item settings, the first tab controlls settings for when the target is hit, but does not die from the hit
- The second tab controlls settings for when the target dies from the hit 

![target-reacts-actor-settings](https://user-images.githubusercontent.com/32877348/142693877-d37d92c6-fc0d-4705-bc48-2c4330d8e5e9.png)
- **Sound File Path:** Path to the sound file 
- **Add Sound:** Add a new row to be assign another sound
- **Remove Sound:** Remove the bottom sound file row
- **Target Volume:** Volume of the sound effect played
- **Enable Blood:** Put a blood splash on the target when it is hit
- **Blood Color:** The color of the blood splash to be put on the target

# Scene Controls
- A new button in the token scene control can be used to remove any TargetReacts blood effects on a token. The token must be selected before the button is pressed. 

![target-reacts-scene-menu](https://user-images.githubusercontent.com/32877348/142694361-f842cf86-d0f6-4235-b5ba-881ef0a54a97.png)
