// Vector objects for math
var vector = {
    x: 0,
    y: 0,

    create: function (x, y) {
        var obj = Object.create(this);
        obj.setX(x);
        obj.setY(y);
        return obj;
    },

    setX: function (value) {
        this.x = value;
    },

    setY: function (value) {
        this.y = value;
    }
};

// Debug informational screen about planet info
var debug = {
    stringData: '',

    countdown: function () {
        var timer = config.countdownTimer * 100;
        var i = 1;
        config.simPause = true;

        function myLoop() {                                         //  create a loop function
            setTimeout(function () {                                //  call a 3s setTimeout when the loop is called
                this.stringData = '';
                //debug.stringData = `Sim begins in ${timer - i}`;    //  display time left
                //uiDebugWindow.innerHTML = debug.stringData;
                i++;                                                //  increment the counter
                if (i < timer) {                                    //  if the counter < timer, call the loop function
                    myLoop();
                } else {
                    //uiDebugWindow.innerHTML = 'Sim Running';
                    config.simPause = false;                        // Countdown has finished
                }
            }, 1)
        };
        myLoop();                                                   // start countdown loop
    }
};
