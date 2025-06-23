from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import sys
import json
import webbrowser

APP_VERSION = "1.0.0"

if getattr(sys, 'frozen', False):
    # Siamo in eseguibile generato da PyInstaller
    base_path = sys._MEIPASS
else:
    # In esecuzione da sorgente
    base_path = os.path.dirname(os.path.abspath(__file__))

t_html_folder = os.path.join(base_path, 'templates_html')
t_folder = os.path.join(base_path, 'templates')
s_folder = os.path.join(base_path, 'static')

app = Flask(
    __name__,
    template_folder=t_html_folder,
    static_folder=s_folder)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/list-templates")
def list_templates():
    files = os.listdir(t_folder)
    return jsonify(files)

@app.route("/templates/<filename>")
def get_template(filename):
    with open(os.path.join(t_folder, filename), "r", encoding="utf-8") as f:
        return jsonify(json.load(f))
    
@app.route("/shutdown", methods=["POST"])
def shutdown():
    shutdown_server()
    return "Server shutting down..."

def shutdown_server():
    print("Server shutting down...")
    os._exit(0)

if __name__ == "__main__":
    webbrowser.open("http://127.0.0.1:5000")  # Apre il browser automaticamente
    app.run(debug=False)


