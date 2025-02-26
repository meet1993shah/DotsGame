document.addEventListener("DOMContentLoaded", function () {
    fetch('/getplayers')
        .then(response => response.json())
        .then(data => {
            const players = data.players;
            const gridWidth = parseInt(document.getElementById('gameBoard').getAttribute('data-width'));
            const gridHeight = parseInt(document.getElementById('gameBoard').getAttribute('data-height'));

            let currentPlayer = 0;
            let scores = new Array(players.length).fill(0);
            let lines = new Set();
            let boxes = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(null));

            const currentPlayerDisplay = document.getElementById("turn");
            const scoreBoard = document.getElementById("scores");
            const gameBoard = document.getElementById("gameBoard");

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
                const dotSpacing = 50;

                // Draw lines
                for (let r = 0; r <= gridHeight; r++) {
                    for (let c = 0; c <= gridWidth; c++) {
                        // Draw horizontal lines (between adjacent dots in the same row)
                        if (c < gridWidth) { // Only draw horizontal lines between adjacent dots
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
                        if (r < gridHeight) { // Only draw vertical lines between adjacent dots
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

                let madeBox = checkForBoxes(pos);
                if (!madeBox) switchPlayer();
                updateScoreBoard();
            }

            function checkForBoxes(pos) {
                const [r, c, dir] = pos.split("-").map((val, i) => (i < 2 ? parseInt(val) : val));
                let completedBox = false;

                if (dir === "h") {
                    if (r > 0 && isBoxCompleted(r - 1, c)) {
                        boxes[r - 1][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                    }
                    if (r < gridHeight && isBoxCompleted(r, c)) {
                        boxes[r][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                    }
                } else {
                    if (c > 0 && isBoxCompleted(r, c - 1)) {
                        boxes[r][c - 1] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                    }
                    if (c < gridWidth && isBoxCompleted(r, c)) {
                        boxes[r][c] = currentPlayer;
                        scores[currentPlayer]++;
                        completedBox = true;
                    }
                }

                return completedBox;
            }

            function isBoxCompleted(r, c) {
                return (
                    lines.has(`${r}-${c}-h`) &&
                    lines.has(`${r + 1}-${c}-h`) &&
                    lines.has(`${r}-${c}-v`) &&
                    lines.has(`${r}-${c + 1}-v`)
                );
            }

            drawGrid();
            updateScoreBoard();
        })
        .catch(error => console.error('Error fetching player data:', error));
});
