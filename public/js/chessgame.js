const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = 'w'; // Hardcoded for now, update dynamically later if needed

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b'){
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q"
  };

  const result = chess.move(move); //  update local game state
  if (result) {
    renderBoard();                 //  re-render only on valid move
    socket.emit("move", move);     //  send move to server
  } else {
    console.warn("Invalid move:", move);
  }
};


const getPieceUnicode = (piece) => {
  const unicodePieces = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
  };
  const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
  return unicodePieces[key] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole" , function() {
    playerRole = null;
    renderBoard();
});

socket.on("boardState" , function(fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move" , function(move) {
    chess.move(move);
    renderBoard();
});

renderBoard();




// const socket = io();
// const chess = new Chess();
// const boardElement = document.querySelector(".chessboard");
// const moveHistoryElement = document.getElementById("moveHistory");

// let draggedPiece = null;
// let sourceSquare = null;
// let playerRole = null;
// let legalMoves = [];

// const usernameInput = document.getElementById("usernameInput");
// const whiteName = document.getElementById("whiteName");
// const blackName = document.getElementById("blackName");

// function submitUsername() {
//   const name = usernameInput.value.trim();
//   if (name) {
//     socket.emit("setUsername", name);
//     document.getElementById("loginModal").classList.add("hidden");
//   }
// }

// function renderMoveHistory(history) {
//   moveHistoryElement.innerHTML = "";
//   history.forEach((move, i) => {
//     const li = document.createElement("li");
//     li.textContent = move;
//     moveHistoryElement.appendChild(li);
//   });
// }

// const renderBoard = () => {
//   const board = chess.board();
//   boardElement.innerHTML = "";

//   for (let row = 0; row < 8; row++) {
//     for (let col = 0; col < 8; col++) {
//       const square = board[row][col];
//       const squareEl = document.createElement("div");
//       squareEl.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark");
//       squareEl.dataset.row = row;
//       squareEl.dataset.col = col;

//       if (square) {
//         const piece = document.createElement("div");
//         piece.classList.add("piece", square.color === "w" ? "white" : "black");
//         piece.innerText = getUnicode(square);
//         piece.draggable = square.color === playerRole;

//         piece.addEventListener("dragstart", (e) => {
//           draggedPiece = piece;
//           sourceSquare = { row, col };
//           e.dataTransfer.setData("text/plain", "");
//           highlightMoves(sourceSquare);
//         });

//         piece.addEventListener("dragend", () => {
//           draggedPiece = null;
//           sourceSquare = null;
//           clearHighlights();
//         });

//         squareEl.appendChild(piece);
//       }

//       squareEl.addEventListener("dragover", (e) => e.preventDefault());
//       squareEl.addEventListener("drop", (e) => {
//         e.preventDefault();
//         const target = {
//           row: parseInt(squareEl.dataset.row),
//           col: parseInt(squareEl.dataset.col),
//         };
//         handleMove(sourceSquare, target);
//         clearHighlights();
//       });

//       boardElement.appendChild(squareEl);
//     }
//   }
// };

// const handleMove = (source, target) => {
//   const move = {
//     from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
//     to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
//     promotion: "q",
//   };

//   if (chess.move(move)) {
//     renderBoard();
//     socket.emit("move", move);
//   }
// };

// const getUnicode = (piece) => {
//   const map = {
//     K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
//     k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
//   };
//   return map[piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase()];
// };

// const highlightMoves = (source) => {
//   const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
//   legalMoves = chess.moves({ square: from, verbose: true });
//   legalMoves.forEach((m) => {
//     const col = m.to.charCodeAt(0) - 97;
//     const row = 8 - parseInt(m.to[1]);
//     const square = `.square[data-row="${row}"][data-col="${col}"]`;
//     document.querySelector(square)?.classList.add("highlight");
//   });
// };

// const clearHighlights = () => {
//   document.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));
// };

// socket.on("playerRole", ({ role, names }) => {
//   playerRole = role;
//   whiteName.textContent = names.white || "Waiting...";
//   blackName.textContent = names.black || "Waiting...";
//   renderBoard();
// });

// socket.on("updateNames", (names) => {
//   whiteName.textContent = names.white || "Waiting...";
//   blackName.textContent = names.black || "Waiting...";
// });

// socket.on("boardState", (fen) => {
//   chess.load(fen);
//   renderBoard();
// });

// socket.on("move", (move) => {
//   chess.move(move);
//   renderBoard();
// });

// socket.on("moveHistory", renderMoveHistory);


// socket.on("gameOver", ({ reason, loser, winner }) => {
//   alert(`${reason === "timeout" ? "Time's up!" : "Game over"}\n${winner} wins!`);
//   location.reload();
// });





