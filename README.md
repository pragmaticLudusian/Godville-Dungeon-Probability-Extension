# Godville Dungeon Probability Extension

Godville Dungeon Probability Extension is an extension that allows the user to generate a probability map detailing how likely a purely AFK dungeon exploration is to reach any given non-wall room. Only available for Dungeon Forge

[imagens a demonstrar extensão aqui]

## Installation

You can use [Tampermonkey](https://www.tampermonkey.net) to run the userscript located [here](https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/refs/heads/main/tampermonkey.fetcher.js).

After installing Tampermonkey, click on the extension from your extension list and click "Create a new script...". Afterwards, import the [tampermonkey fetcher](https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/refs/heads/main/tampermonkey.fetcher.js) to the new file and save it.

## Usage

A new button is added in the Dungeon Forge pop-up called "Predict Path Probabilities". When clicked, it extracts the currently selected dungeon map in the Dungeon Forge, creating a duplicate map where each non-wall room is colored between red and green depending on the calculated probability. Hovering over any room will display the concrete probability value. 

## Notes

As of 14th of September 2025, an [equivalent extension for a savings graph](https://github.com/dinisafonsopinto/Godville-Graph-Extension) has approval from the Godville developers to be used and distributed between players. This extension hasn't explicitly been requested, due to the small amount of players that can use this extension.
