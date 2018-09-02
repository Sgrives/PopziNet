var ui = {

    init: function () {
        config.aliveUI = true;

        // Get UI elements
        uiSliderSimSpeed = document.getElementById('dt');
        uiSliderZoom = document.getElementById('zoom');
        uiDomDrawLinesFrom = document.getElementById('drawLinesFrom');
        uiDomDrawLinesTo = document.getElementById('drawLinesTo');
        uiCanvasOffsetX = document.getElementById('canvasOffsetX');
        uiCanvasOffsetY = document.getElementById('canvasOffsetY');
        uiTrailType = document.getElementById('trailType');
        uiTrailTypePower = document.getElementById('trailTypePower');
        uiTrailLength = document.getElementById('trailLength');
        uiCustomPlanets = document.getElementById('customPlanets');
        uiLabelOffsetX = document.getElementById('labelOffsetX');
        uiLabelOffsetY = document.getElementById('labelOffsetY');
        uiUseSimLength = document.getElementById('simUseLength');
        uiSimLength = document.getElementById('simLength');
        uiCountdown = document.getElementById('countdown');
        uiCountdownTimer = document.getElementById('countdownTimer');
        uiDrawLinesMax = document.getElementById('drawLinesMax');
        uiDrawLinesNth = document.getElementById('drawLinesNth');
        uiDrawLinesFOT = document.getElementById('drawLinesFOT');
        uiDrawLinesRGBA = document.getElementById('drawLinesRGBA');
        uiDrawLinesPreview = document.getElementById('drawLinesPreview');
        uiSystemPreset = document.getElementById('systemPreset');
        uiKgScaleMass = document.getElementById('kgScaleMass');
        uiGravityPower = document.getElementById('gravityPower');
        uiBgColor = document.getElementById('bgColor');
        uiBgColorPointlessPreview = document.getElementById('bgColorPointlessPreview');
        uiDebugWindow = document.getElementById('debugWindow');
        uiSimFlipOrbit = document.getElementById('simFlipOrbit');

        // Get FeedBack (fb) elements, do it on init as opposed to looking for them every frame
        fbSpeed = document.getElementById('fbSpeed');

        // Setup Listeners
        uiSliderSimSpeed.oninput = function () {
            config.simSpeed = this.value / 2000;
        };
        uiSliderZoom.oninput = function () {
            config.kgZoom = this.value / 1000;
        };
        uiDomDrawLinesFrom.onchange = function () {
            config.drawLinesFromPID = this.value;
            config.drawLines = true;
        };
        uiDomDrawLinesTo.onchange = function () {
            config.drawLinesToPID = this.value;
            config.drawLines = true;
        };
        uiCanvasOffsetX.oninput = function () {
            config.canvasOffsetX = (this.value - 500) * 2
        };
        uiCanvasOffsetY.oninput = function () {
            config.canvasOffsetY = (this.value - 500) * 2
        };
        uiTrailType.onchange = function () {
            config.trailType = this.value;
            for (var pid = 0; pid < planets.length; pid++) {
                planets[pid].planetObject.positionHistory = [];
            };
        };
        uiTrailTypePower.oninput = function () {
            config.trailTypePower = this.value / 5000 + 0.9;
        };
        uiTrailLength.onchange = function () {
            config.trailLength = this.value;
            for (var pid = 0; pid < planets.length; pid++) {
                planets[pid].planetObject.positionHistory = [];
            };
        };
        uiCustomPlanets.onchange = function () {
            config.customPlanets = true;
            config.customPlanetsData = JSON.parse(this.value);
            init();
            ui.updateDropdowns();
        };
        uiLabelOffsetX.oninput = function () {
            config.labelOffsetX = this.value / 2 - 250;
        };
        uiLabelOffsetY.oninput = function () {
            config.labelOffsetY = this.value / 2 - 250;
        };
        uiUseSimLength.onchange = function () {
            config.simUseLength = JSON.parse(this.value);
            init();
        };
        uiSimLength.onchange = function () {
            config.simLength = this.value;
            uiUseSimLength.selectedIndex = 0;
            config.simUseLength = true;
            init();
        };
        uiCountdown.onchange = function () {
            config.countdown = JSON.parse(this.value);
            init();
        };
        uiCountdownTimer.onchange = function () {
            uiCountdown.selectedIndex = 0;
            config.countdown = true;
            config.countdownTimer = this.value;
            init();
        };
        uiDrawLinesMax.onchange = function () {
            config.drawLinesMax = this.value;
        };
        uiDrawLinesNth.onchange = function () {
            config.drawLinesNth = this.value;
            console.log(config.drawLinesNth);
        };
        uiDrawLinesFOT.onchange = function () {
            config.drawLinesFOT = JSON.parse(this.value);
        };
        uiSystemPreset.onchange = function () {
            config.systemPreset = this.value;
            config.drawLines = false; // Turn off line drawing
            config.drawLinesFromPID = 0;
            config.drawLinesToPID = 0;
            init();
            uiCustomPlanets.innerHTML = JSON.stringify(presets[this.value], null, 4);
            ui.updateDropdowns();
        };
        uiKgScaleMass.onchange = function () {
            config.kgScaleMass = this.value;
            init();
        };
        uiGravityPower.onchange = function () {
            config.gravityPower = this.value;
            init();
        };
        uiDrawLinesRGBA.oninput = function () {
            var input = this.value.split(',');
            if (input.length == 4) {
                for (var x = 0; x < input.length; x++) {
                    input[x] = Number(input[x]); // Check each segment is a number
                };
                config.drawLinesRGBA = input;
                uiDrawLinesPreview.style.background = rgba(config.drawLinesRGBA);
            };
        };
        uiBgColor.oninput = function () {
            var input = this.value.split(',');
            if (input.length == 4) {
                for (var x = 0; x < input.length; x++) {
                    input[x] = Number(input[x]); // Check each segment is a number
                };
                canvas.style.background = rgba(input);
                uiBgColorPointlessPreview.style.background = rgba(input);
            };
        };
        uiSimFlipOrbit.onchange = function () {
            config.simFlipOrbit = JSON.parse(this.value);
            init();
        };

        // Insert the current planet config into the ui
        uiCustomPlanets.innerHTML = JSON.stringify(planets, null, 4);

        // Setup the dropdowns
        ui.updateDropdowns();
    },

    // Updates certain bits of the UI like speed Todo: Debug here
    update: function () {
        fbSpeed.innerHTML = config.simSpeed;
        // Update debug
        if (config.showDebug) {
            var p = planets[config.showDebugID].planetObject;
            uiDebugWindow.innerHTML = `Debug Info For ${p.name}<br/>`;
            uiDebugWindow.innerHTML += `Attraction: ${p.a}<br/>`;
            uiDebugWindow.innerHTML += `PositionHistory: ${p.positionHistory.length}<br/>`;

            uiDebugWindow.innerHTML += `dt: ${config.simSpeed}<br/>`;
            uiDebugWindow.innerHTML += `Velocity: ${Math.round(p.velocity.x)}, ${Math.round(p.velocity.y)}<br/>`;
            uiDebugWindow.innerHTML += `Acceleration Vector ${Math.round(p.ax)}, ${Math.round(p.ay)}<br/>`;
            uiDebugWindow.innerHTML += `Planet Length: ${planets.length}<br/>`;
            if (drawLinesArr.length < (config.drawLinesMax - 2)) {
                var linesVal = `${drawLinesArr.length} / ${config.drawLinesMax}`;
            } else {
                var linesVal = 'Max';
            };
            uiDebugWindow.innerHTML += `Drawn Lines: ${linesVal}<br/>`;
            uiDebugWindow.innerHTML += `Trails: ${config.trails}`;
        } else {
            uiDebugWindow.innerHTML = 'Debug Ready';
        }
    },


    // Updater for updating the drop down menus
    updateDropdowns: function () {
        // INITIALZIE the drop down menus
        uiDomDrawLinesFrom.innerHTML = '<option selected="selected" value="null">-- Draw Lines From --</option>';
        uiDomDrawLinesTo.innerHTML = '<option selected="selected" value="null">-- Draw Lines To --</option>';
        for (var pid = 0; pid < planets.length; pid++) {
            option = document.createElement('option');
            option.value = pid;
            option.innerHTML = planets[pid].Name;
            uiDomDrawLinesFrom.appendChild(option.cloneNode(true)); // Clone the node here instead of deleting it so we can append below
            uiDomDrawLinesTo.appendChild(option);
        }; 
    },

    openNav: function() {
        document.getElementById("menu").style.width = "270px";
        document.getElementById("menu").style.paddingLeft = "15px";
        document.getElementById("menu").style.paddingRight = "15px";
        document.getElementById("main").style.marginLeft = "270px";
        setTimeout(function () {
            document.getElementById("fadebox").style.opacity = "1"; // Wait x ms before making menu visible
        }, 300);
    },

    closeNav: function() {
        document.getElementById("menu").style.width = "0";
        document.getElementById("menu").style.paddingLeft = "0";
        document.getElementById("menu").style.paddingRight = "0";
        document.getElementById("main").style.marginLeft = "0";
        document.getElementById("fadebox").style.opacity = "0";
    },

    openMsg: function () {
        document.getElementById("msg").style.display = 'block';
        setTimeout(function () {
            document.getElementById("msg").style.opacity = "1";
        }, 300);
    },

    closeMsg: function () {
        document.getElementById("msg").style.opacity = "0";
        setTimeout(function () {
            document.getElementById("msg").style.display = 'none';
        }, 300);
    },
}