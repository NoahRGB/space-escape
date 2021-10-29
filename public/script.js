const socket = io.connect();

let gameStarted = false;
let gameOver = false;
let currentState;
let assets = {};
let clientNumber;
let animations = [];
let lastAliveShip;

const backgroundRate = 5;
let bgXPos1 = -1000;
let bgYPos1 = -1000;


function preload() {
    assets["Ship1"] = loadImage("./assets/images/ships/Ship1.png");
    assets["Ship2"] = loadImage("./assets/images/ships/Ship2.png");
    assets["Ship3"] = loadImage("./assets/images/ships/Ship3.png");
    assets["Ship4"] = loadImage("./assets/images/ships/Ship4.png");
    assets["Bullet1"] = loadImage("./assets/images/bullets/bullet1.png");
    assets["asteroid"] = loadImage("./assets/images/asteroid.png");
    assets["bg"] = loadImage("./assets/images/background/project-bg4.png");
    assets["explosionSheet"] = loadImage("./assets/animations/explosion.png");
}

function setup() {
    if (!gameStarted) {
        toggleMainMenu();
        frameRate(30);
    } else {
        frameRate(0);
        toggleMainMenu();
        let canvas = createCanvas(windowWidth, windowHeight);
        canvas.style("z-index", "-1");
        canvas.position(0, 0);
        canvas.parent(document.getElementById("game-container"));
    }
}

function draw() {
    let selectedShip = document.getElementById("ship-select").value;
    let selectedShipDisplay = document.getElementById("selected-ship-display");
    selectedShipDisplay.innerHTML = `<img class="ship-icon" src="./assets/images/ships/${selectedShip}.png"></img>`;
}

const toggleMainMenu = () => {
    let mainMenu = document.getElementById("main-menu");
    mainMenu.style.display == "flex" ? 
        mainMenu.style.display = "none" : 
        mainMenu.style.display = "flex";
}

const startGame = () => {
    gameStarted = true;
    socket.emit("startNewLobby", document.getElementById("ship-select").value);
    setup();
}

const joinGame = () => {
    const code = document.getElementById("code-input").value;
    if (code != "" && code.length < 6) {
      socket.emit("joinLobby", {
          lobbyCode:code, 
          shipType:document.getElementById("ship-select").value
      });
      console.log("Joining game");
      gameStarted = true;
      setup();
    } else {
      alert("Invalid game code");
    }
}

socket.on("gameState", newState => {
    initLoop(newState);

    updateGUI();
    drawBullets();
    drawShips();
    drawAnimations();
    if (!gameOver) checkForInput();

    cleanupLoop();
});

const initLoop = (newState) => {
    currentState = newState;
    updateBackground();
    const myShip = getMyShip();
    translate(width/2 - myShip.x, height/2 - myShip.y);
}

const cleanupLoop = () => {
    const myShip = getMyShip();
    translate(-(width/2 - myShip.x), -(height/2 - myShip.y));
}

const updateGUI = () => {
    const myShip = getMyShip();
    document.getElementById("health-display").innerHTML = 
        `<h1>${myShip.health} HP</h1><h1>Level ${myShip.level}</h1>`;
}

const drawShips = () => {
    imageMode(CENTER, CENTER);
    for (let ship of currentState.ships) {
        if (ship.clientNumber == clientNumber && gameOver) continue;
        push();
        translate(ship.x, ship.y);
        rotate(ship.angle);
        image(assets[ship.type], 0, 0, ship.width, ship.height);
        pop();
    }
}

const drawBullets = () => {
  imageMode(CENTER, CENTER);
    for (let bullet of currentState.bullets) {
        push();
        translate(bullet.x, bullet.y);
        rotate(bullet.angle);
        image(assets[bullet.type], 0, 0, bullet.width, bullet.height);
        pop();
    }
}

const updateBackground = () => {
    background(100);
    if (currentState) {
        let myShip = getMyShip();
        if (myShip) {
            bgXPos1 -= myShip.xv * 0.1;
            bgYPos1 -= myShip.yv * 0.1;
        }
        push();
        imageMode(CORNER, CORNER);
        image(assets["bg"], bgXPos1, bgYPos1, 3556, 2000);
        pop();
    }
}

const drawAnimations = () => {
    for (let animation of animations) {
      if (animation.active == false) {
        animations.splice(animations.indexOf(animation), 1);
        continue;
      }
      animation.animate();
    }
  }

const checkForInput = () => {
    if (keyIsDown(87)) {
        socket.emit("keyPressed", 87);
    }
    if (keyIsDown(68)) {
        socket.emit("keyPressed", 68);
    }
    if (keyIsDown(65)) {
        socket.emit("keyPressed", 65);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        socket.emit("shoot");
    }
}

const getMyShip = () => {
    let ship;
    const myShip = currentState.ships.filter(ship => ship.clientNumber == clientNumber)[0];
    myShip ? ship = myShip : ship = lastAliveShip;
    return ship;
}

socket.on("shipCrash", clientNum => {
    const crashedShip = currentState.ships.filter(ship => ship.clientNumber == clientNum)[0];
    animations.push(new Explosion(crashedShip.x, crashedShip.y, 50, 50));
    if (clientNum == clientNumber) {
        lastAliveShip = crashedShip;
        gameOver = true;
    }
});

socket.on("lobbyCode", code => {
    document.getElementById("lobby-code-display").innerHTML = `<h1>Lobby Code: ${code}</h1>`;
});

socket.on("clientNumber", num => {
    clientNumber = num;
});