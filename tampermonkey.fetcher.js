// ==UserScript==
// @name         Godville Dungeon Map Probability
// @namespace    https://godvillegame.com/superhero
// @version      2026-07-09
// @description  Uses Monte Carlo to predict the probability of heroes stepping on a given empty space
// @author       Denis O First
// @match        https://godvillegame.com/superhero
// @icon         https://secure.gravatar.com/avatar/42271c5418d5d2853f5579b9f2d51fad?rating=PG&size=200
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	// Bypass CSP restrictions, introduced by the latest Chrome updates
	if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
		window.trustedTypes.createPolicy('default', {
			createHTML: string => string,
			createScriptURL: string => string,
			createScript: string => string
		});
	}

	function load(loadAttempts, link) {
		if (loadAttempts === 0) {
			if (window.top === window.self) {
				console.log('Initiating...');
			}
		}

		if (loadAttempts >= 9) {
			if (window.top === window.self) {
				console.log('Could not load');
				alert('Could not load! Please refresh the page to try again.');
			}

			return;
		}

		loadAttempts++;

		fetch(link)
			.then(response => response.text())
			.then(data => {
				let element = document.createElement('script');
				element.innerHTML = data;
				document.head.appendChild(element);
			})
			.catch((error) => {
				setTimeout(function () {
					load(loadAttempts, link);
				}, 500);
			});
	}

	load(0, 'https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/refs/heads/main/content.js');
})();
