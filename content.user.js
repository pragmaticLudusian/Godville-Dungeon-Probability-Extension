// ==UserScript==
// @name         Godville Dungeon Map Probability
// @namespace    https://godvillegame.com/superhero
// @version      v1.0.1
// @description  Uses Monte Carlo to predict the probability of heroes stepping on a given empty space
// @author       Denis O First
// @match        https://godvillegame.com/superhero
// @icon         https://www.google.com/s2/favicons?sz=64&domain=godvillegame.com
// @updateURL    https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/main/content.user.js
// @downloadURL  https://raw.githubusercontent.com/dinisafonsopinto/Godville-Dungeon-Probability-Extension/main/content.user.js
// @grant        none
// ==/UserScript==

/**
 * Updates a dungeon grid with the probability of each empty space being stepped on.
 * @param {Array<Array<String>>} grid - 2D array with 'Wall', 'Door', 'Treasure', 'Empty'
 * @param {Number} iterations - How many times to simulate the maze (higher = more accurate)
 * @param {Number} maxSteps - Max steps per run to prevent infinite loops if Treasure is unreachable
 */
function calculateSteppingProbabilities(grid, iterations = 10000, maxSteps = 100) {
    const rows = grid.length;
    if (rows === 0) return grid;
    const cols = grid[0].length;

    // Movement vectors: [rowOffset, colOffset]
    // 0: North, 1: East, 2: South, 3: West
    const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    let startR = -1, startC = -1;

    // Track how many times each cell is visited across all runs
    const visitCounts = Array.from({ length: rows }, () => Array(cols).fill(0));

    // 1. Locate the Door
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 'Door') {
                startR = r;
                startC = c;
            }
        }
    }

    if (startR === -1) throw new Error("No 'Door' found in the grid.");

    // Helper to check if a cell is a Wall or out of bounds
    const isWall = (r, c) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return true;
        return grid[r][c] === 'Wall';
    };

    // 2. Determine initial starting direction (face the first non-wall space)
    let availableInitialDirs = [];
    for (let i = 0; i < 4; i++) {
        if (!isWall(startR + DIRS[i][0], startC + DIRS[i][1])) {
            availableInitialDirs.push(i);
        }
    }

    // 3. Run the Monte Carlo Simulation
    for (let i = 0; i < iterations; i++) {
        let r = startR;
        let c = startC;
        let dir = availableInitialDirs[Math.floor(Math.random() * availableInitialDirs.length)];

        // Track visited spaces for THIS specific run
        const visitedThisRun = Array.from({ length: rows }, () => Array(cols).fill(false));

        let steps = 0;

        while (steps < maxSteps) {
            // Mark current cell as visited (ignoring the door itself)
            if (grid[r][c] === 'Empty') {
                visitedThisRun[r][c] = true;
            }

            // Stop if they reached the Door
            if (steps > 0 && r === startR && c === startC) {
                visitedThisRun[r][c] = true;
                break;
            }
            // Stop if they reached the Treasure
            if (grid[r][c] === 'Treasure') {
                visitedThisRun[r][c] = true;
                break;
            }



            // Determine relative cells
            let frontBlocked = isWall(r + DIRS[dir][0], c + DIRS[dir][1]);
            let rightBlocked = isWall(r + DIRS[(dir + 1) % 4][0], c + DIRS[(dir + 1) % 4][1]);
            let leftBlocked  = isWall(r + DIRS[(dir + 3) % 4][0], c + DIRS[(dir + 3) % 4][1]);

            let nextDir = dir;
            let randomValue = Math.random();

            // Cascading rules: Ordered by strictness to handle wall conflicts properly
            if (leftBlocked && frontBlocked && rightBlocked) {
                // Rule 6
                nextDir = (dir + 2) % 4; // Back
            }
            else if (frontBlocked && rightBlocked) {
                // Rule 4 (Left is implicitly open because Rule 6 didn't trigger)
                nextDir = (dir + 3) % 4; // Left
            }
            else if (leftBlocked && frontBlocked) {
                // Rule 5
                if (randomValue < 0.80) nextDir = (dir + 1) % 4; // Right
                else nextDir = (dir + 2) % 4;                    // Back
            }
            else if (frontBlocked) {
                // Rule 3 (Right and Left are open)
                if (randomValue < 0.80) nextDir = (dir + 1) % 4; // Right
                else nextDir = (dir + 3) % 4;                    // Left
            }
            else if (rightBlocked && !frontBlocked) {
                // Rule 2
                nextDir = dir; // Front
            }
            else {
                // Rule 1 (Front and Right are open)
                if (randomValue < 0.15) {
                    nextDir = (dir + 1) % 4; // 15% Right
                } else {
                    nextDir = dir;           // 85% Front
                }
            }

            // Move the heroes
            r += DIRS[nextDir][0];
            c += DIRS[nextDir][1];
            dir = nextDir;
            steps++;
        }

        // Add this run's visits to the global count
        for (let vr = 0; vr < rows; vr++) {
            for (let vc = 0; vc < cols; vc++) {
                if (visitedThisRun[vr][vc]) {
                    visitCounts[vr][vc]++;
                }
            }
        }
    }

    // 4. Update the original grid with probabilities
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 'Empty') {
                // Calculates the % chance this space was stepped on at least once
                let probability = visitCounts[r][c] / iterations;

                // Formats to 2 decimal places (e.g., 0.45), change to string if preferred
                grid[r][c] = parseFloat(probability.toFixed(2));
            } else if (grid[r][c] === 'Wall') {
                // skip specifically the walls, keep everything else
            } else {
                let probability = visitCounts[r][c] / iterations;

                grid[r][c] = [grid[r][c], parseFloat(probability.toFixed(2))];
            }
        }
    }

    console.log("Stepping Probabilities Calculated");
    console.log(grid);

    return grid;
}

/**
 * Extracts the dungeon map from the #wrd_map HTML element and converts it into a 2D array.
 * @returns {Array<Array<String>>} 2D array with 'Wall', 'Door', 'Treasure', or 'Empty'
 */
function extractMapFromHTML() {
    const mapContainer = document.getElementById('wrd_map');

    if (!mapContainer) {
        console.error("Could not find the map container with id 'wrd_map'.");
        return [];
    }

    const grid = [];
    // Grab all rows inside the map
    const rows = mapContainer.querySelectorAll('.dml[role="row"]');

    rows.forEach(rowElement => {
        const rowArray = [];
        // Grab all cells within this specific row
        const cells = rowElement.querySelectorAll('.dmc[role="gridcell"]');

        cells.forEach(cellElement => {
            let cellType = 'Empty'; // Default fallback for everything unspecified
            const innerElement = cellElement.querySelector('div');

            if (innerElement) {
                // We use the title attribute to identify the specific cell types
                const title = (innerElement.getAttribute('title') || '').toLowerCase();
                // But content will be used to detect walls where title wouldn't work with putting a hole in a wall
                const content = innerElement.textContent;

                if (content === '#') {
                    cellType = 'Wall';
                } else if (title.includes('exit')) {
                    // "exit from the dungeon" becomes our 'Door'
                    cellType = 'Door';
                } else if (title.includes('treasury')) {
                    cellType = 'Treasure';
                }
                // The boss ('your boss') and stairs ('stairs') fall through and remain 'Empty'
            }

            rowArray.push(cellType);
        });

        grid.push(rowArray);
    });

    return grid;
}

/**
 * Initializes the extension by injecting a trigger link and handling the map duplication/styling.
 */
function initializePathPredictor() {
    const wupContent = document.querySelector('.wup-content');

    if (!wupContent) {
        console.error("Path Predictor: Could not find .wup-content in the DOM.");
        return;
    }
    wupContent.style.textAlign = "center";
    wupContent.style.paddingTop = "5px";

    // Create the trigger link
    const predictLink = document.createElement('a');
    predictLink.href = "#";
    predictLink.innerText = "Predict Path Probabilities";
    predictLink.id = "wrd_path_predictor";

    wupContent.insertBefore(predictLink, wupContent.firstChild);

    predictLink.addEventListener('click', (event) => {
        event.preventDefault();

        // Look for our specific wrapper to delete, not the map ID itself
        const existingWrapper = document.getElementById('wrd_map_predicted_wrapper');
        if (existingWrapper) existingWrapper.remove();

        const grid = extractMapFromHTML();
        if (grid.length === 0) return;
        const probabilityGrid = calculateSteppingProbabilities(grid);

        const originalMap = document.getElementById('wrd_map');

        // Grab the raw HTML string
        const rawHTML = originalMap.outerHTML;

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = rawHTML;

        const predictedMap = tempContainer.firstElementChild;

        // WE INTENTIONALLY DO NOT CHANGE THE ID!
        // This forces the game's CSS to style our clone perfectly.

        // Wrap the map in a uniquely identified container so we can isolate it
        const wrapper = document.createElement('div');
        wrapper.id = 'wrd_map_predicted_wrapper';
        wrapper.style.marginTop = "20px";
        wrapper.style.borderTop = "2px dashed #ccc";
        wrapper.style.paddingTop = "10px";
        wrapper.appendChild(predictedMap);

        // Strip active scripts and links so the clone isn't clickable
        predictedMap.querySelectorAll('a, [onclick]').forEach(el => {
            el.removeAttribute('href');
            el.removeAttribute('onclick');
            el.style.cursor = 'crosshair';
        });

        const rows = predictedMap.querySelectorAll('.dml[role="row"]');

        rows.forEach((rowElement, r) => {
            const cells = rowElement.querySelectorAll('.dmc[role="gridcell"]');

            cells.forEach((cellElement, c) => {
                const cellData = probabilityGrid[r][c];

                if (typeof cellData === 'number') {
                    const hue = cellData * 120;
                    const bgColor = `hsl(${hue}, 85%, 60%)`;

                    cellElement.style.backgroundColor = bgColor;
                    cellElement.style.color = '#111111';

                    const innerDiv = cellElement.querySelector('div');
                    if (innerDiv) {
                        const percentString = `${(cellData * 100).toFixed(0)}%`;

                        innerDiv.removeAttribute('aria-label');
                        innerDiv.title = `Probability: ${percentString}`;
                    }
                } else if (Object.prototype.toString.call(cellData) === '[object Array]') {
                    // the title must be in both the background and the inner div because different cells have different weird placements of symbols (e.g. door and treasury)
                    const hue = cellData[1] * 120;
                    const bgColor = `hsl(${hue}, 85%, 60%)`;

                    cellElement.style.backgroundColor = bgColor;
                    cellElement.style.color = '#111111';

                    let title = `${cellData[0]} Probability: ${(cellData[1] * 100).toFixed(0)}%`;

                    cellElement.title = title;

                    const innerDiv = cellElement.querySelector('div');
                    if (innerDiv) {
                        innerDiv.removeAttribute('aria-label');
                        innerDiv.title = title;
                    }
                }
            });
        });

        // Insert the wrapper below the original map
        originalMap.parentNode.insertBefore(wrapper, originalMap.nextSibling);
    });
}

document.addEventListener('click', function(event) {
  // We catch the click in the Capture Phase, but we wrap our logic
  // in a setTimeout(..., 0). This tells the browser: "Wait until
  // ALL other scripts (including Godville's) have finished reacting
  // to this click before you run this code."
  setTimeout(() => {
    const targetLink = event.target.closest('a[data-target="wup2"]');

    if (targetLink) {
      console.log("WUP2 link clicked");
      initializePathPredictor();
    }
  }, 0);
}, true);