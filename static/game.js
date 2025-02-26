document.addEventListener("DOMContentLoaded", function () {
    fetch('/getplayers')
        .then(response => response.json())
        .then(data => {
            const players = data.players;
            const gridWidth = parseInt(document.getElementById('gameBoard').getAttribute('data-width'));
            const gridHeight = parseInt(document.getElementById('gameBoard').getAttribute('data-height'));
            const dotSpacing = 60 + (7 - Math.min(gridWidth, gridHeight)) * 10;

            let currentPlayer = 0;
            let scores = new Array(players.length).fill(0);
            let lines = new Set();
            let boxes = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(null));
            let history = []; // To keep track of moves for undo

            const currentPlayerDisplay = document.getElementById("turn");
            const scoreBoard = document.getElementById("scores");
            const gameBoard = document.getElementById("gameBoard");
            const undoButton = document.getElementById("undo-button");
            const restartButton = document.getElementById("restart-button");

            function updateScoreBoard() {
                scoreBoard.innerHTML = players.map((p, i) =>
                    `<div style="color: ${p.color}">${p.name}: ${scores[i]}</div>`).join("");
            }

            function switchPlayer() {
                currentPlayer = (currentPlayer + 1) % players.length;
                currentPlayerDisplay.textContent = `Turn: ${players[currentPlayer].name}`;
                currentPlayerDisplay.style.color = players[currentPlayer].color;
            }

            function drawGrid() {
                gameBoard.innerHTML = "";

                // Draw lines
                for (let r = 0; r <= gridHeight; r++) {
                    for (let c = 0; c <= gridWidth; c++) {
                        // Draw horizontal lines (between adjacent dots in the same row)
                        if (c < gridWidth) {
                            let hLine = document.createElement("div");
                            hLine.classList.add("line", "horizontal");
                            hLine.setAttribute("data-pos", `${r}-${c}-h`);
                            hLine.style.top = `${r * dotSpacing}px`;
                            hLine.style.left = `${c * dotSpacing}px`;
                            hLine.style.width = `${dotSpacing}px`;
                            hLine.addEventListener("click", handleLineClick);
                            gameBoard.appendChild(hLine);
                        }

                        // Draw vertical lines (between adjacent dots in the same column)
                        if (r < gridHeight) {
                            let vLine = document.createElement("div");
                            vLine.classList.add("line", "vertical");
                            vLine.setAttribute("data-pos", `${r}-${c}-v`);
                            vLine.style.top = `${r * dotSpacing}px`;
                            vLine.style.left = `${c * dotSpacing}px`;
                            vLine.style.height = `${dotSpacing}px`;
                            vLine.addEventListener("click", handleLineClick);
                            gameBoard.appendChild(vLine);
                        }
                    }
                }

                for (let r = 0; r <= gridHeight; r++) {
                    for (let c = 0; c <= gridWidth; c++) {
                        let dot = document.createElement("div");
                        dot.classList.add("dot");
                        dot.style.top = `${r * dotSpacing}px`;
                        dot.style.left = `${c * dotSpacing}px`;
                        gameBoard.appendChild(dot);
                    }
                }
            }

            function handleLineClick(event) {
                const pos = event.target.getAttribute("data-pos");
                if (lines.has(pos)) return;

                lines.add(pos);
                event.target.style.backgroundColor = players[currentPlayer].color;

                history.push({ pos, player: currentPlayer }); // Save the move for undo

                let madeBox = checkForBoxes(pos);
                if (!madeBox) switchPlayer();
                updateScoreBoard();
                checkGameEnd();
            }

            function undoMove() {
                if (history.length === 0 || document.getElementById("turn").textContent.includes("wins")) return; // No moves to undo or game is over

                const lastMove = history.pop();
                lines.delete(lastMove.pos); // Remove the line
                const lineElement = document.querySelector(`[data-pos="${lastMove.pos}"]`);
                if (lineElement) lineElement.style.backgroundColor = ""; // Reset the line color

                // Reverse the score and remove box colors if any were completed
                let [r, c, dir] = lastMove.pos.split("-").map((val, i) => (i < 2 ? parseInt(val) : val));
                let removedBox = false;

                if (dir === "h") {
                    if (r > 0 && boxes[r - 1][c] === lastMove.player) {
                        boxes[r - 1][c] = null;
                        scores[lastMove.player]--;
                        removeBoxColor(r - 1, c);
                        removedBox = true;
                    }
                    if (r < gridHeight && boxes[r][c] === lastMove.player) {
                        boxes[r][c] = null;
                        scores[lastMove.player]--;
                        removeBoxColor(r, c);
                        removedBox = true;
                    }
                } else {
                    if (c > 0 && boxes[r][c - 1] === lastMove.player) {
                        boxes[r][c - 1] = null;
                        scores[lastMove.player]--;
                        removeBoxColor(r, c - 1);
                        removedBox = true;
                    }
                    if (c < gridWidth && boxes[r][c] === lastMove.player) {
                        boxes[r][c] = null;
                        scores[lastMove.player]--;
                        removeBoxColor(r, c);
                        removedBox = true;
                    }
                }

                updateScoreBoard();
                
                // Restore the last player
                currentPlayer = lastMove.player;
                currentPlayerDisplay.textContent = `Turn: ${players[currentPlayer].name}`;
                currentPlayerDisplay.style.color = players[currentPlayer].color;
            }

            // Helper function to remove box color
            function removeBoxColor(r, c) {
                let boxesToRemove = document.querySelectorAll(`#gameBoard div`);
                boxesToRemove.forEach(box => {
                    if (
                        parseInt(box.style.top) === r * dotSpacing + 5 &&
                        parseInt(box.style.left) === c * dotSpacing + 5
                    ) {
                        box.remove();
                    }
                });
            }

            function checkForBoxes(pos) {
                const [r, c, dir] = pos.split("-").map((val, i) => (i < 2 ? parseInt(val) : val));
                let completedBox = false;

                if (dir === "h") {
                    if (r > 0 && isBoxCompleted(r - 1, c)) {
                        boxes[r - 1][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                        colorBox(r - 1, c);
                    }
                    if (r < gridHeight && isBoxCompleted(r, c)) {
                        boxes[r][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                        colorBox(r, c);
                    }
                } else {
                    if (c > 0 && isBoxCompleted(r, c - 1)) {
                        boxes[r][c - 1] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                        colorBox(r, c - 1);
                    }
                    if (c < gridWidth && isBoxCompleted(r, c)) {
                        boxes[r][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                        colorBox(r, c);
                    }
                }

                return completedBox;
            }

            function colorBox(r, c) {
                let box = document.createElement("div");
                box.style.position = "absolute";
                box.style.top = `${r * dotSpacing + 5}px`;  // Adjusting position to center in box
                box.style.left = `${c * dotSpacing + 5}px`; // Adjusting position to center in box
                box.style.width = `${dotSpacing}px`;
                box.style.height = `${dotSpacing}px`;
                box.style.backgroundColor = players[currentPlayer].color;
                box.style.zIndex = 1; // Make sure the box appears above the lines
                gameBoard.appendChild(box);
            }

            function isBoxCompleted(r, c) {
                return (
                    lines.has(`${r}-${c}-h`) &&
                    lines.has(`${r + 1}-${c}-h`) &&
                    lines.has(`${r}-${c}-v`) &&
                    lines.has(`${r}-${c + 1}-v`)
                );
            }

            function checkGameEnd() {
                // Check if all boxes are completed
                let allBoxesCompleted = true;
                for (let r = 0; r < gridHeight; r++) {
                    for (let c = 0; c < gridWidth; c++) {
                        if (boxes[r][c] === null) {
                            allBoxesCompleted = false;
                            break;
                        }
                    }
                }

                if (allBoxesCompleted) {
                    displayWinner();
                }
            }

            function triggerConfetti() {
                let duration = 3 * 1000;
                let end = Date.now() + duration;
                function frame() {
                    confetti({
                        particleCount: 5,
                        spread: 100,
                        startVelocity: 40,
                        origin: { x: Math.random(), y: Math.random() }
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }

                frame();
            }

            function displayWinner() {
                let winnerIndex = scores.indexOf(Math.max(...scores));
                let winner = players[winnerIndex];
                currentPlayerDisplay.textContent = `${winner.name} wins! 🎉🎉🎉`;
                triggerConfetti();
            }

            function restartGame() {
                window.location.href = '/'; // Redirect to the starting page
            }

            // Event listener for undo button
            undoButton.addEventListener("click", undoMove);

            // Event listener for restart button
            restartButton.addEventListener("click", restartGame);

            drawGrid();
            updateScoreBoard();
        })
        .catch(error => console.error('Error fetching player data:', error));
});
