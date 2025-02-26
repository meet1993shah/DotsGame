from flask import Flask, render_template, request, jsonify, session
import os
import platform

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game', methods=['POST'])
def start_game():
    data = request.form
    num_players = int(data['num_players'])
    colors = ["red", "yellow", "green", "blue", "orange", "purple"]
    players = [{"name": data[f"player{i}"], "color": colors[i]} for i in range(1, num_players + 1)]
    grid_width = int(data['grid_width'])
    grid_height = int(data['grid_height'])

    session["game"] = {
        "players": players,
        "grid_width": grid_width,
        "grid_height": grid_height,
        "turn": 0,
        "scores": {player["name"]: 0 for player in players},
        "lines": [],
        "boxes": []
    }
    session.modified = True

    # Return the game page, passing only necessary details
    return render_template('game.html', grid_width=grid_width, grid_height=grid_height)

@app.route('/getplayers', methods=['GET'])
def get_players():
    if "game" not in session:
        return jsonify({"error": "No active game found"}), 400

    game = session["game"]
    return jsonify({"players": game["players"]})

@app.route('/restart', methods=['GET'])
def restart_game():
    session.clear()  # Clear the session to restart the game
    return redirect('/')

if __name__ == "__main__":
    if platform.system() == 'Android':
        from android.permissions import Permission, request_permissions
        request_permissions([Permission.INTERNET, Permission.READ_EXTERNAL_STORAGE, Permission.WRITE_EXTERNAL_STORAGE])
    app.run(debug=False, port=8080)
