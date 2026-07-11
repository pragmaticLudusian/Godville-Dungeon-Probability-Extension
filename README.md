# Godville Dungeon Probability Extension

Godville Dungeon Probability Extension is an extension that allows the user to generate a probability map detailing how likely a purely AFK dungeon exploration is to reach any given non-wall room. Only available for Dungeon Forge

<img width="440" height="666" alt="image" src="https://github.com/user-attachments/assets/41b61da5-3a00-4f30-9d24-5d43f215a64f" />
<img width="443" height="667" alt="image" src="https://github.com/user-attachments/assets/bd16f517-3bf3-4f44-b9d9-3ef4fecb11c6" />

## Installation

You can use [Tampermonkey](https://www.tampermonkey.net) to run the userscript located [here](https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/refs/heads/main/tampermonkey.fetcher.js).

After installing Tampermonkey, click on the extension from your extension list and click "Create a new script...". Afterwards, import the [tampermonkey fetcher](https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/refs/heads/main/tampermonkey.fetcher.js) to the new file and save it.

## Usage

A new button is added in the Dungeon Forge pop-up called "Predict Path Probabilities". When clicked, it extracts the currently selected dungeon map in the Dungeon Forge, creating a duplicate map where each non-wall room is colored between red and green depending on the calculated probability. Hovering over any room will display the concrete probability value. 

## Notes

As of 14th of September 2025, an [equivalent extension for a savings graph](https://github.com/dinisafonsopinto/Godville-Graph-Extension) has approval from the Godville developers to be used and distributed between players. This extension hasn't explicitly been requested, due to the small amount of players that can use this extension.
