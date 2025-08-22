from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

DATABASE = '/Users/macbook/Documents/Database/todolist.db'
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# ---------------- REGISTER ----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username'].strip()
    password = data['password'].strip()

    if not username or not password:
        return jsonify({"error": "Invalid username or password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO users (name, password) VALUES (?, ?)", (username, password))
        conn.commit()
        authorID = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({
        "message": "Account created successfully",
        "authorID": authorID,
        "username": username
    }), 201

# ---------------- LOGIN ----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('username')
    password = data.get('password')
    # print(password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE name = ? AND password = ?", (name, password))
    user = cursor.fetchone()
    conn.close()

    print(user)
    for row in user:
        print(row)

    if user:
        return jsonify({
            "message": "Login successful",
            "username": user["name"],
            "authorID": user["id"]
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 400

# ---------------- CREATE TASK ----------------
@app.route('/task/<int:author_id>', methods=['POST'])
def create_task(author_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    priority = data.get('priority')
    status = data.get('status')

    if not title or not start_date:
        return jsonify({"error": "Title and start_date are required"}), 400

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO Task (title, description, start_date, end_date, authorID, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (title, description, start_date, end_date, author_id, priority, status)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task created successfully"}), 201

# ---------------- GET TASKS BY AUTHOR ----------------
@app.route('/task/<int:author_id>', methods=['GET'])
def get_tasks_by_author(author_id):
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM Task WHERE authorID = ?', (author_id,)).fetchall()
    conn.close()
    return jsonify([dict(t) for t in tasks])


# ---- Update task (done bằng checkbox) ----
@app.route('/task/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    data = request.json
    status = data.get('status')

    if status not in ['todo', 'in_progress', 'done']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Task SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Task updated successfully"})


# ---- DELETE TASK (chuyển sang Deleted table) ----
@app.route('/task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Lấy task trước khi xóa
    cursor.execute("SELECT * FROM Task WHERE id = ?", (task_id,))
    task = cursor.fetchone()

    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    # Chèn vào Deleted table
    cursor.execute("""
        INSERT INTO Deleted (id, title, description, start_date, end_date, authorID, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task["id"], task["title"], task["description"], task["start_date"],
        task["end_date"], task["authorID"], task["priority"], task["status"]
    ))

    # Xóa khỏi Task
    cursor.execute("DELETE FROM Task WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Task moved to Deleted"}), 200

# ---- GET TASK BY ID (để lấy thông tin task khi edit) ----
@app.route('/task/id/<int:task_id>', methods=['GET'])
def get_task_by_id(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Task WHERE id = ?", (task_id,))
    task = cursor.fetchone()
    conn.close()

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(dict(task)), 200


# ---- UPDATE TASK (edit trong modal) ----
@app.route('/task/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    priority = data.get('priority')
    status = data.get('status')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Task
        SET title = ?, description = ?, start_date = ?, end_date = ?, priority = ?, status = ?
        WHERE id = ?
    """, (title, description, start_date, end_date, priority, status, task_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Task updated successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True)