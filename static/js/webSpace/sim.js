/*
    Data used from 
        https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
        https://nssdc.gsfc.nasa.gov/planetary/factsheet/
*/
config = {
    // UI
    "advLabels": false,                     // Toggle advanced labels
    "labels": true,                         // Toggle lables on or off
    "labelOffsetX": 10,                     // Offsets the labels by X amount from the planet it's labelling
    "labelOffsetY": 20,                     // Offsets the labels by Y amount from the planet it's labelling
    "drawVelocities": false,                // Draws the position of the planets velocity
    "drawLines": true,                      // Draws lines between two planets every nth frame in order to make pretty art
    "drawLinesNth": 0.2,                    // How many steps should go by before the next line is drawn between two planets        Todo: Make it better.
    "drawLinesMax": 2000,                   // How many lines should be on the screen at a given time -1 for infinite, may can extreme lag
    "drawLinesRGBA": [255, 255, 0, 0.1],    // RGBA values of the lines, note that the alpha is also the max opacity used in drawLinesFOT
    "drawLinesFOT": true,                   // Have the lines opacity slowly Fade Over Time (FOT) of the maximum amount of lines
    "drawLinesFromPID": 0,                  // The planet ID in which the line should originate from
    "drawLinesToPID": 0,                    // The planet ID in which the line should go to-wards
    "drawLinesFilterAB": true,              // Todo: Filter the view so that only the origin and target planets are shown, aswell as the root planet (i.e, the sun)
    "centerDot": false,                     // Places a dot in the very center of the screen to ensure trajectories are correct
    "centerDotSize": 3,                     // Size of the center dot
    "centerDorColor": "red",                // Color of center dot
    "trails": true,                         // Should we show trails?
    "trailLength": 100,                     // How many previous frame positions should be store to be shown as a trail?
    "trailType": 2,                         // Type of trails:  1=Orbital, 2=Flying, 3=Void/Flare
    "trailTypePower": 0.995,                // How effected the trails become, only limited to types 2 and 3
    "canvasOffsetX": 0,                     // How much the entire canvas should be offset in the X direction
    "canvasOffsetY": -120,                     // How much the entire canvas should be offset in the Y direction
    // Sim
    "simUseLength": false,                  // Run for x steps or "To infinitly; and beyond!"
    "simLength": 30000,                     // How long the sim should run for in steps before stopping, 30,000 is a decent runtime
    "simPause": false,                      // Continue to next step or nah
    "simStartVal": null,                    // Stores step start value
    "simSpeed": 0.1,                        // Default sim speed, referred to as 'dt' in code and forumlas
    "simFlipOrbit": false,                  // Flips the velocities and thus flips the orbit direction
    "systemPreset": 0,                      // Default preset to choose from in presets.js
    "customPlanets": false,                 // If the user is using a custom planet dat a set, dont choose a preset on init
    "customPlanetsData": [],                // Stores user planet data, grabbed on init()
    // Scales
    "kgScaleMass": 10000000000000,          // Divides the mass(kg) by this amount. You'll may want to also change the gravityPower if you change this.
    "kgZoom": 1,                            // Offcenters canvas positions to give a zoom effect
    "gravityPower": 11,                     // Power of newtons gravitational equation. You'll may want to also change the kgScaleMass if you change this.
    // Debug
    "showDebug": false,                     // Should the debug be displayed in the draw() function?
    "showDebugID": 4,                       // Which ID in the array we should show the debug information for
    "countdown": false,                     // Should there be a countdown before simulation begins? Useful for seeing initial planet positions
    "countdownTimer": 3,                    // How long from placing the planets should we wait before simulating, in seconds.
    // Updates for javascript being sucky
    "canvasResizing": false,                // If the canvas is currently being resized, dont bother spawning a new one
    "aliveUI": false,                       // is the ui already running?
};

// Stuff we want to initialize everywhere
var animRequestId = null;

// Populate page ready variables, create all planets
function init() {

    // Delete old stuff
    window.cancelAnimationFrame(animRequestId); // Kill the previous animation request, very important!
    canvas = null;          // Populated when page ready by init()
    ctx = null;             // Populated when page ready by init()
    sliderSimSpeed = null;  // Populated when page ready by init() - Changes the config.simSpeed (aka, dt)
    drawLinesArr = [];      // Populated with draw line vectors
    drawLinesNth = 0;       // Counts up in drawLines(); and resets every config.drawLinesNth
    planets = null;         // Gets populated on init

    // Create stuff
    config.simStartVal = null;
    config.drawLinesNthScaled = config.drawLinesNth / config.simSpeed; // Init Speed up line draws with dt
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    if (!config.customPlanets) {
        planets = presets[config.systemPreset].slice(); // Get a preset if not custom
    } else {
        planets = config.customPlanetsData;
    };

    // Setup listener events and UI
    if (!config.aliveUI) {
        ui.init();
    };
    
    for (var pid = 0; pid < planets.length; pid++) {
        // Create the planets
        var p = planet.create(
            planets[pid].Name,                          // name
            planets[pid].Pos[0],                        // posX (Can use config.scalePosition here)
            planets[pid].Pos[1],                        // posY (Can use config.scalePosition here)
            planets[pid].Radius,                        // radius
            planets[pid].Velocity[0],                   // velocityX (Can use config.scaleVelocity here)
            planets[pid].Velocity[1],                   // velocityY (Can use config.scaleVelocity here)
            planets[pid].Mass / config.kgScaleMass,     // mass
            planets[pid].Color                          // color
        );

        // Store planet objects in the planets array for simplicity
        planets[pid]['planetObject'] = p;
        
    };

    // Spawn a canvas height listener
    if (!config.canvasResizing) {
        updateCanvas();
    };

    // Display planet positions before beginning
    draw();

    // Debug countdown?
    if (config.countdown) {
        debug.countdown();
    };

    // Begin steps
    window.requestAnimationFrame(simstep);
   
};


// Converts 0-255 arrays into rgba strings, defaults alpha to 1
function rgba(rgba_array, alpha = true) { 
    r = Math.floor(rgba_array[0]);
    g = Math.floor(rgba_array[1]);
    b = Math.floor(rgba_array[2]);
    if (rgba_array.length >= 4 && alpha) {
        a = rgba_array[3];
    } else {
        a = 1;
    };
    return ["rgba(", r, ",", g, ",", b, ",", a, ")"].join("");
};

// Keep the canvas at fullsize
function updateCanvas() {
    config.canvasResizing = true;
    // Limit this to run once every 300ms
    setInterval(function () {
        console.log('Resize check');
        if (window.innerHeight !== canvas.height || window.innerWidth !== canvas.width) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }, 60);
};

// Searches an array of dicts for a a key with a speicifc value, and returns the array number
function searchDictArray(Array, Key, Value) {
    for (var x = 0; x < Array.length; x++) {
        if (Array[x][Key] == Value) {
            return x;
        };
    };
};

// Update the config, by key and value
function updateConfig(key, value) {
    // If boolean, toggle, if not, and no value given, warn, else update the key with value
    if (typeof (config[key]) == 'boolean') {
        config[key] = !config[key]; // Flips the boolean
    } else if (!value) {
        console.log('Warning! updateConfig() issued but it was not a boolean key, and has no value!')
    } else {
        config[key] = value; // Might want to add checks for saftey
    };
};

// Update all the planets with planet.attraction()
function calculate() {
    for (var pid = 0; pid < planets.length; pid++) {
        var p = planets[pid].planetObject;
        var rootPlanet = planets[0].planetObject;
        if (p.name != rootPlanet.name) {  // The rootPlanet doesn't move for our purpose
            p.attraction(rootPlanet);
        };
    };
};

// Draw lines from a planet to another one using config
function drawLines(from, to) {
    config.drawLinesNthScaled = config.drawLinesNth / config.simSpeed; // Init Speed up line draws with dt, seems to be incorrect though, hm?

    if (from && to && from != 'null' && to != 'null' && from != to) {
        var pf = planets[from].planetObject;
        var pt = planets[to].planetObject;

        drawLinesNth++; // Add 1 every simstep

        if (drawLinesArr.length >= config.drawLinesMax) {
            drawLinesArr.shift();
        };

        if (drawLinesNth >= config.drawLinesNthScaled && !config.simPause) {
            drawLinesNth = 0; // Reset nth counter
            // Log the position (absolute) & append an array of vectors, for from[0] and to[1]
            drawLinesArr.push([vector.create(pf.position.x, pf.position.y), vector.create(pt.position.x, pt.position.y)]);
        };

        // Draw the lines
        for (var lid = 0; lid < drawLinesArr.length; lid++) {
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 + drawLinesArr[lid][0].x * config.kgZoom + config.canvasOffsetX, canvas.height / 2 + drawLinesArr[lid][0].y * config.kgZoom + config.canvasOffsetY);
            ctx.lineTo(canvas.width / 2 + drawLinesArr[lid][1].x * config.kgZoom + config.canvasOffsetX, canvas.height / 2 + drawLinesArr[lid][1].y * config.kgZoom + config.canvasOffsetY);

            if (config.drawLinesFOT) {
                subRGBA = [config.drawLinesRGBA[0], config.drawLinesRGBA[1], config.drawLinesRGBA[2], config.drawLinesRGBA[3]];
                subRGBA[3] = lid / drawLinesArr.length * config.drawLinesRGBA[3];
                ctx.strokeStyle = rgba(subRGBA);
            } else {
                ctx.strokeStyle = rgba(config.drawLinesRGBA);
            };
            ctx.stroke();
        };
    };
};

// Updates frame, renders planet objects
function draw() {
    // Clear the canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var pid = 0; pid < planets.length; pid++) {
        var p = planets[pid].planetObject;
        p.canvasUpdate(); // Update their canvas positions to the center

        // Track planet movements every nth frame into an array, draw a line between each position first so the planets are kept on top.
        // This code is a mess and REALLY needs optimizing...
        if (config.trails == true) {
            if (config.trailType == 2) p.positionHistory.push(vector.create(p.canvasPosition.x, p.canvasPosition.y));
            if (config.trailType == 1 || config.trailType == 3) p.positionHistory.push(vector.create(p.position.x, p.position.y));
            if (p.positionHistory.length >= (config.trailLength)) {
                p.positionHistory.shift(); // Delete first item if max length met or exceeded
            };
            for (var xpos = 0; xpos < p.positionHistory.length - 1; xpos++) {
                ctx.beginPath();
                if (config.trailType == 2) {
                    ctx.moveTo(p.positionHistory[xpos].x, p.positionHistory[xpos].y);
                    ctx.lineTo(p.positionHistory[xpos + 1].x, p.positionHistory[xpos + 1].y);
                } else {
                    ctx.moveTo(canvas.width / 2 + p.positionHistory[xpos].x * config.kgZoom + config.canvasOffsetX, canvas.height / 2 + p.positionHistory[xpos].y * config.kgZoom + config.canvasOffsetY);
                    ctx.lineTo(canvas.width / 2 + p.positionHistory[xpos + 1].x * config.kgZoom + config.canvasOffsetX, canvas.height / 2 + p.positionHistory[xpos + 1].y * config.kgZoom + config.canvasOffsetY);
                }

                p.color[3] = xpos / p.positionHistory.length; // Update the alpha
                ctx.strokeStyle = rgba(p.color);
                ctx.stroke();
            };
        };
        
        // Draw planets
        ctx.beginPath();
        ctx.arc(p.canvasPosition.x, p.canvasPosition.y, p.radius, 0, 10);
        ctx.fillStyle = rgba(p.color, alpha = false);
        ctx.fill();

        // Draw velocity lines
        if (config.drawVelocities) {
            // Gravitational Pull Line
            ctx.beginPath();
            ctx.moveTo(p.canvasPosition.x, p.canvasPosition.y);
            ctx.lineTo(p.canvasVelocity.x + config.canvasOffsetX, p.canvasVelocity.y + config.canvasOffsetY);
            ctx.strokeStyle = 'lime';
            ctx.stroke();

            // Gravitational X pull line
            ctx.beginPath();
            ctx.moveTo(p.canvasPosition.x, p.canvasPosition.y);
            ctx.lineTo(p.canvasVelocity.x + config.canvasOffsetX, p.canvasPosition.y);
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Gravitiaonal Y pull line
            ctx.beginPath();
            ctx.moveTo(p.canvasPosition.x, p.canvasPosition.y);
            ctx.lineTo(p.canvasPosition.x, p.canvasVelocity.y + config.canvasOffsetY);
            ctx.strokeStyle = 'cyan';
            ctx.stroke();
        };

        // Add some labels, I may need to make a formatter for this...
        if (config.labels) {
            ctx.fillText(p.name, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY);
            if (config.advLabels) {
                ctx.fillText(`PositionX ${p.position.x}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 10);
                ctx.fillText(`PositionY ${p.position.y}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 20);
                ctx.fillText(`VelocityX: ${p.velocity.x}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 30);
                ctx.fillText(`VelocityY: ${p.velocity.y}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 40);

                ctx.fillText(`CPositionX ${p.canvasPosition.x}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 50);
                ctx.fillText(`CPositionY ${p.canvasPosition.y}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 60);
                ctx.fillText(`CVelocityX: ${p.canvasVelocity.x}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 70);
                ctx.fillText(`CVelocityY: ${p.canvasVelocity.y}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 80);
                ctx.fillText(`Attraction: ${p.a}`, p.canvasPosition.x + config.labelOffsetX, p.canvasPosition.y + config.labelOffsetY + 90);
            };
        };
    };

    // Draw lines to and from planets
    if (config.drawLines) drawLines(config.drawLinesFromPID, config.drawLinesToPID);

    // Place a center dot with labels
    if (config.centerDot) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, config.centerDotSize, 0, 10);
        ctx.fillStyle = config.centerDorColor;
        ctx.fill();
        ctx.fillText(`Canvas Width: ${canvas.width}`, canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText(`Canvas Height: ${canvas.height}`, canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`Canvas Center X: ${canvas.width / 2}`, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`Canvas Center Y: ${canvas.height / 2}`, canvas.width / 2, canvas.height / 2 - 40);
    };

    // Update the UI information
    ui.update();
};


function simstep(timestamp, frame) {

    if (!config.simPause) calculate();  // Calculates actual sim stuff
    //updateCanvas();                     // Keep canvas fullsize Todo: ADD A JS LISTENER FOR THIS INSTEAD!!!!! CAUSES LAG!!!
    draw();                             // Renders
    
    // Should we continue to the next step? 
    if (!config.simStartVal) config.simStartVal = timestamp;    // Set initial starting timestamp if none
    if (config.simUseLength) {                                  // If we have a length set
        var progress = timestamp - config.simStartVal;          // Progress/duration of sim
        if (progress < config.simLength) {                      // Continue until length
            animRequestId = window.requestAnimationFrame(simstep);
        };
    } else {                                                    // No length set, go forever
        animRequestId = window.requestAnimationFrame(simstep);
    };
};
