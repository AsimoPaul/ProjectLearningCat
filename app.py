from flask import Flask, render_template, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json['code']
    
    with open('temp.py', 'w') as f:
        f.write(code)

    try:
        output = subprocess.check_output(['python', 'temp.py'], stderr=subprocess.STDOUT, timeout=5).decode('utf-8')
    except subprocess.CalledProcessError as e:
        output = e.output.decode('utf-8')
    except subprocess.TimeoutExpired:
        output = 'Error: Code execution timed out.'

    return jsonify({'output': output})

if __name__ == '__main__':
    app.run(debug=True)
