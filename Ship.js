const { findRectCorners, findRectEdges, findPerpendicularVecs } = require("./Utils");

class Ship {
    constructor(type, playerNumber, clientNumber) {
        this.type = type;
        this.playerNumber = playerNumber;
        this.clientNumber = clientNumber;
        this.level = 1;
        this.health = 100;
        this.x = 600;
        this.y = 600;
        this.size = 40;
        this.setSize();
        this.xv = 0;
        this.yv = 0;
        this.ax = 0;
        this.ay = 0;
        this.angle = 0;
        this.bulletSpeed = 50;
        this.turningSpeed = 0.05;
        this.accelerationSpeed = 0.5;
        this.maxSpeed = 5;

        //for collision checking
        this.corners;
        this.edges;
        this.pVecs;
    }

    update() {
        this.xv = Math.cos(this.angle);
        this.yv = Math.sin(this.angle);
        this.xv *= this.ax;
        this.yv *= this.ay;
        this.x += this.xv;
        this.y += this.yv;
        this.friction();

        this.corners = findRectCorners(this.x, this.y, this.width, this.height, this.angle);
        this.edges = findRectEdges(this.corners);
        this.pVecs = findPerpendicularVecs(this.edges);
    }

    setSize() {
        this.height = this.size;
        if(this.type == "Ship1") {
            this.width = this.height*1.9677;
        } else if(this.type == "Ship2") {
            this.width = this.height*2.1944;
        } else if(this.type == "Ship3") {
            this.width = this.height*2.1707;
        } else if(this.type == "Ship4") {
            this.width = this.height*1.7096;
        }
    }

    friction() {
        //"friction"
        this.ax *= 0.98;
        this.ay *= 0.98;
    }
    
    turn(turnAmount) {
        this.angle += turnAmount;
    }
}

module.exports = {
    Ship,
}