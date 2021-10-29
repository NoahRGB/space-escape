const { findRectCorners, findRectEdges, findPerpendicularVecs } = require("./Utils");

class Bullet {
    constructor(type, x, y, xv, yv, angle, client) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.xv = xv;
        this.yv = yv;
        this.size = 50;
        this.setSize();
        this.angle = angle;
        this.client = client;

        //for collision
        this.corners;
        this.edges;
        this.pVecs;
    }

    update() {
        this.x += this.xv;
        this.y += this.yv;

        this.corners = findRectCorners(this.x, this.y, this.width, this.height, this.angle);
        this.edges = findRectEdges(this.corners);
        this.pVecs = findPerpendicularVecs(this.edges);
    }

    setSize() {
        if (this.type == "Bullet1") {
            this.height = this.size;
            this.width = this.height*1.7291;
        }
    }
}

module.exports = {
    Bullet,
}