from __future__ import print_function
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def main():
    return render_template('home.html', **locals())


if __name__ == "__main__":
    app.run()