const express = require("express");
const socket = require("socket.io");

const port = process.env.PORT || 8000;
const app = express();
app.use(express.static("public"));
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
let io = socket(server);

const { Ship } = require("./Ship.js");
const { Bullet } = require("./Bullet.js");
const { GameState } = require("./GameState.js");
const { generateNewCode, sat } = require("./Utils.js");

const lobbies = {};
const states = {};

io.on("connection", client => {
    client.on("startNewLobby", shipType => {
        const newLobbyCode = generateNewCode();
        const newState = new GameState();
        client.emit("playerNumber", newState.playerCount++);
        client.emit("lobbyCode", newLobbyCode);
        client.emit("clientNumber", client.id);
        newState.ships.push(new Ship(shipType, newState.playerCount, client.id));
        lobbies[client.id] = newLobbyCode;
        states[newLobbyCode] = newState;
        client.join(newLobbyCode);
        startGameLoop(newLobbyCode);
    });

    client.on("joinLobby", data => {
        const lobbyCode = data.lobbyCode;
        const shipType = data.shipType;
        const state = states[lobbyCode];
        if (!state) {
            client.emit("invalidLobbyCode");
            return;
        }
        client.emit("playerNumber", state.playerCount++);
        client.emit("clientNumber", client.id);
        state.ships.push(new Ship(shipType, state.playerCount, client.id));
        lobbies[client.id] = lobbyCode;
        client.join(lobbyCode);
    });

    client.on("keyPressed", key => {
        const lobbyCode = lobbies[client.id];
        const state = states[lobbyCode];
        const clientShip = state.ships.filter(ship => ship.clientNumber == client.id)[0];
        if (key == 68) {
            clientShip.turn(clientShip.turningSpeed);
        } else if (key == 65) {
            clientShip.turn(-clientShip.turningSpeed);
        }
        if (key == 87) {
            if (clientShip.ax <= clientShip.maxSpeed && clientShip.ay <= clientShip.maxSpeed) {
                clientShip.ax += clientShip.accelerationSpeed;
                clientShip.ay += clientShip.accelerationSpeed;
            }
        }
    });

    client.on("shoot", () => {
        const lobbyCode = lobbies[client.id];
        var gameState = states[lobbyCode];
        io.sockets.in(lobbyCode).emit("playShootSound");
        let clientShip = gameState.ships.filter(ship => ship.clientNumber == client.id)[0];
        gameState.bullets.push(new Bullet(
            "Bullet1",
            clientShip.x, 
            clientShip.y,
            Math.cos(clientShip.angle) * clientShip.bulletSpeed,
            Math.sin(clientShip.angle) * clientShip.bulletSpeed,
            clientShip.angle,
            client.id,
        ));
      });
});

const updateGame = lobbyCode => {
    let state = states[lobbyCode];
    state.bullets.forEach(bullet => bullet.update());
    for (let ship of state.ships)  {
        ship.update();
        for (let bullet of state.bullets) {
            if (sat(ship.corners, bullet.corners, [...ship.pVecs, ...bullet.pVecs])
                && ship.clientNumber != bullet.client) {
                    ship.health -= 5;
                    if (ship.health <= 0) {
                        state.ships.splice(state.ships.indexOf(ship), 1);
                        io.sockets.in(lobbyCode).emit("shipCrash", ship.clientNumber);
                    }
                    state.bullets.splice(state.bullets.indexOf(bullet), 1);
            }
        }
    }
}

const startGameLoop = (lobbyCode) => {
    let gameInterval = setInterval(() => {
        io.sockets.in(lobbyCode).emit("gameState", states[lobbyCode]);
        updateGame(lobbyCode);
    }, 1000 / 60);
}