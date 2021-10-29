const generateNewCode = () => {
    const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += options[Math.floor(Math.random() * options.length)];
    }
    return code;
}

const findRectCorners = (x, y, w, h, rot) => {
    let corners = [];
    //in clockwise direction starting top right
    if (rot != 0) {
        corners.push({
        x: x + w/2 * Math.cos(rot) + h/2 * Math.sin(rot),
        y: y + w/2 * Math.sin(rot) - h/2 * Math.cos(rot)
        });
        corners.push({
        x: x + w/2 * Math.cos(rot) - h/2 * Math.sin(rot),
        y: y + w/2 * Math.sin(rot) + h/2 * Math.cos(rot)
        });
        corners.push({
        x: x - w/2 * Math.cos(rot) - h/2 * Math.sin(rot),
        y: y - w/2 * Math.sin(rot) + h/2 * Math.cos(rot)
        });
        corners.push({
        x: x - w/2 * Math.cos(rot) + h/2 * Math.sin(rot),
        y: y - w/2 * Math.sin(rot) - h/2 * Math.cos(rot)
        });
    } else {
        corners.push({x: x + w/2, y: y - h/2});
        corners.push({x: x + w/2, y: y + h/2});
        corners.push({x: x - w/2, y: y + h/2});
        corners.push({x: x - w/2, y: y - h/2});
    }
    return corners;
}
  
const findRectEdges = corners => {
    //corners given in clockwise direction starting top right
    let edges = [];
    for (let i = 0; i < corners.length; i++) {
      if (i == corners.length-1) {
        edges.push({
          x: corners[0].x - corners[i].x,
          y: corners[0].y - corners[i].y
        });
        continue;
      } else {
        edges.push({
          x: corners[i+1].x - corners[i].x,
          y: corners[i+1].y - corners[i].y
        });
      }
    }
    return edges;
}

const findPerpendicularVecs = edges => {
    let perpendicularVecs = [];
    for (let edge of edges) {
        perpendicularVecs.push({
            x: -edge.y,
            y: edge.x
        });
    }
    return perpendicularVecs;
}

const sat = (aCorners, bCorners, perpendicularVecs) => {
    for (let vec of perpendicularVecs) {
        let amin = null;
        let amax = null;
        let bmin = null;
        let bmax = null;
        for (let aCorner of aCorners) {
            let aDot = aCorner.x * vec.x + aCorner.y * vec.y;
            if (amax == null || aDot > amax) {
            amax = aDot;
            }
            if (amin == null || aDot < amin) {
            amin = aDot;
            }
        }
        for (let bCorner of bCorners) {
            let bDot = bCorner.x * vec.x + bCorner.y * vec.y;
            if (bmax == null || bDot > bmax) {
            bmax = bDot;
            }
            if (bmin == null || bDot < bmin) {
            bmin = bDot;
            }
        }
    
        if ((amin < bmax && amin > bmin) || (bmin < amax && bmin > amin)) {
            continue;
        } else {
            return false;
        }
    }
    return true;
}

module.exports = {
    generateNewCode,
    findRectCorners,
    findRectEdges,
    findPerpendicularVecs,
    sat
}