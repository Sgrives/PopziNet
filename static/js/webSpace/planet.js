// Planet objects for storing all data
var planet = {
    name: null,
    position: null,
    canvasPosition: null, // Takes the position and centers it to the canvas
    canvasVelocity: null, // Takes the velocity and centers it to the canvas
    radius: null,
    velocity: null,
    mass: 1,
    color: null,
    a: null, // attraction
    d: null, // distance
    ax: null, // acceleration vector x
    ay: null, // accerlation vector y
    positionHistory: null, // Used for lines

    create: function (name, posX, posY, radius, velocityX, velocityY, mass, color) {
        var obj = Object.create(this);
        obj.name = name;
        obj.position = vector.create(posX, posY);
        obj.canvasPosition = vector.create(0, 0);
        obj.radius = radius;
        if (config.simFlipOrbit) {
            obj.velocity = vector.create(velocityX * -1, velocityY * -1);
        } else {
            obj.velocity = vector.create(velocityX, velocityY);
        }
        obj.canvasVelocity = vector.create(0, 0);
        obj.mass = mass;
        obj.positionHistory = [];
        obj.color = color;
        //obj.canvasUpdate();
        return obj;
    },

    distanceTo: function (p2) {
        var dx = p2.position.x - this.position.x,
            dy = p2.position.y - this.position.y;
        return Math.sqrt(dx ** 2 + dy ** 2);
    },

    attraction: function (p2) { 
        var G = 6.674 * 10 ** config.gravityPower; // Gravitational Constant

        // Scalar Acceleration
        this.d = Math.sqrt(this.position.x * this.position.x + this.position.y * this.position.y);
        this.a = G * p2.mass / (this.d ** 2);

        // Acceleration Vector
        this.ax = -this.a * this.position.x / this.d;
        this.ay = -this.a * this.position.y / this.d;

        // Velocity
        var dt = config.simSpeed;
        this.velocity.x += this.ax * dt;
        this.velocity.y += this.ay * dt;

        // Position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    },

    canvasUpdate: function () {
        this.canvasPosition.x = canvas.width / 2 + this.position.x * config.kgZoom + config.canvasOffsetX;
        this.canvasPosition.y = canvas.height / 2 + this.position.y * config.kgZoom + config.canvasOffsetY;

        this.canvasVelocity.x = canvas.width / 2 + this.velocity.x * config.kgZoom;
        this.canvasVelocity.y = canvas.height / 2 + this.velocity.y * config.kgZoom;
        
        // Trail modifiers
        if (config.trailType == 2 || config.trailType == 3) { // 2 or 3
            for (var xpos = 0; xpos < this.positionHistory.length; xpos++) {
                this.positionHistory[xpos].x = this.positionHistory[xpos].x * config.trailTypePower;
                this.positionHistory[xpos].y = this.positionHistory[xpos].y * config.trailTypePower;
            };
        };
    }
};
