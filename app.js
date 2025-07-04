// const express = require("express");
// const socket = require("socket.io");
// const http = require("http");
// const {Chess} = require("chess.js");
// const path = require("path");
// const { disconnect } = require("process");

// const app = express();

// const server = http.createServer(app);
// const io =socket(server);

// const chess = new Chess();           //Chess.js ka object- consists all the rules 

// let players ={};
// let currentPlayer ="w";

// app.set("view engine","ejs");
// app.use(express.static(path.join(__dirname,"public")));

// app.get("/",(req,res) => {
//     res.render("index",{title:"Chess Game"});
// });

// //call back function - decides that how many clients 
// // recieved the massage from server
// io.on("connection" , function(uniquesocket){
//     console.log("connected");

//     if(!players.white){
//         players.white = uniquesocket.id;
//         uniquesocket.emit("playerRole" ,"w");
//     } else if(!players.black){
//         players.black = uniquesocket.id;
//         uniquesocket.emit("playerRole" , "b");
//     } else {
//         uniquesocket.emit("spectatorRole");
//     }


//     uniquesocket.on("disconnect" , function (){
//         if(uniquesocket.id == players.white){
//             delete players.white;
//         }
//         else if(uniquesocket.id == players.black){
//             delete players.black;
//         }
//     });

//     uniquesocket.on("move",(move) =>{
//         try{
//             if(chess.turn() == 'w' && uniquesocket.id != players.white){return};
//             if(chess.turn() == 'b' && uniquesocket.id != players.black){return};

//             const result = chess.move(move);
//             if(result){
//                 currentPlayer = chess.turn();
//                 io.emit("move",move);
//                 io.emit("boardState" , chess.fen())

//             } else {
//                 console.log("Invalid move :" , move);
//                 uniquesocket.emit("invalidMove",move);
//             }
//         }
//         catch(err){
//             console.log(err);
//             uniquesocket.emit("Invalid move :" , move);
//         }

//     });
// });

// server.listen(3000 ,function(){
//     console.log("listening on server 3000");
// });








const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();

let players = {};
let playerNames = {};


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Multiplayer Chess" });
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("setUsername", (name) => {
    if (!players.white) {
      players.white = socket.id;
      playerNames.white = name;
      socket.emit("playerRole", { role: "w", names: playerNames });
      io.emit("updateNames", playerNames);
    } else if (!players.black) {
      players.black = socket.id;
      playerNames.black = name;
      socket.emit("playerRole", { role: "b", names: playerNames });
      io.emit("updateNames", playerNames);
    } else {
      socket.emit("spectatorRole", playerNames);
    }

    if (players.white && players.black) {
    }
  });

  socket.on("move", (move) => {
    const currentTurn = chess.turn();
    if (
      (currentTurn === "w" && socket.id !== players.white) ||
      (currentTurn === "b" && socket.id !== players.black)
    ) return;

    const result = chess.move(move);
    if (result) {
      io.emit("move", move);
      io.emit("boardState", chess.fen());
      io.emit("moveHistory", chess.history({ verbose: false }));
    }
  });

  socket.on("disconnect", () => {
    if (socket.id === players.white) {
      delete players.white;
      delete playerNames.white;
    } else if (socket.id === players.black) {
      delete players.black;
      delete playerNames.black;
    }
    clearTimeout(timer);
    chess.reset();
    io.emit("playerLeft");
    players = {};
    playerNames = {};
  });
});



server.listen(3000, () => {
  console.log("Server running on port 3000");
});





