class Explosion {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.frames = splitIntoArray(assets["explosionSheet"], 9, 9, 81);
      this.currentFrame = 0;
      this.animationRate = 1;
      this.active = true;
    }
  
    animate() {
      if (this.active) {
        image(this.frames[Math.floor(this.currentFrame)], this.x, this.y, this.w, this.h);
        this.currentFrame += this.animationRate;
        if (this.currentFrame >= this.frames.length) {
          this.active = false;
        }
      }
    }
}

const splitIntoArray = (img, rows, cols, numberOfFrames) => {
    let fwidth = floor(img.width / cols);
    let fheight = floor(img.height / rows);
    let frames = [];
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (numberOfFrames > 0) {
          frames.push(img.get(c * fwidth, r * fheight, fwidth, fheight));
        }
        numberOfFrames--;
      }
    }
    frames.frameWidth = fwidth;
    frames.frameHeight = fheight;
  
    return frames;
}

