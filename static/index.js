// Function to update player input fields based on the number of players
function updatePlayerInputs() {
    let numPlayers = document.getElementById("num_players").value;
    let container = document.getElementById("player_inputs");
    container.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        container.innerHTML += `
            <label>Player ${i} Name:</label>
            <input type="text" name="player${i}" required>
        `;
    }
}

// Bind the event listener for the number of players field
document.getElementById("num_players").addEventListener("change", updatePlayerInputs);
