from flask import Flask, render_template, request, jsonify, session
import pymysql
import random

app = Flask(__name__)
app.secret_key = "dota_guess_secret"


# 数据库连接
def get_db_connection():
    return pymysql.connect(
        host="127.0.0.1",
        user="user",
        password="password",
        db="database",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )


# 首页
@app.route("/")
def index():
    # 每次刷新随机选择一个选手作为答案
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM players")
        ids = [row["id"] for row in cursor.fetchall()]
        answer_id = random.choice(ids)
        session["answer_id"] = answer_id
    conn.close()
    session["attempts"] = 0
    return render_template("index.html")


# 联想 ID
@app.route("/suggest", methods=["GET"])
def suggest():
    keyword = request.args.get("q", "").lower()
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM players WHERE LOWER(id) LIKE %s LIMIT 5", ("%" + keyword + "%",))
        suggestions = [row["id"] for row in cursor.fetchall()]
    conn.close()
    return jsonify(suggestions)


# 猜测
@app.route("/guess", methods=["POST"])
def guess():
    if session.get("attempts", 0) >= 10:
        return jsonify({"error": "已用完10次机会"})

    guess_id = request.json.get("id")
    session["attempts"] = session.get("attempts", 0) + 1

    conn = get_db_connection()
    with conn.cursor() as cursor:
        # 获取猜测选手信息
        cursor.execute("SELECT * FROM players WHERE id=%s", (guess_id,))
        guess_player = cursor.fetchone()
        # 获取答案选手信息
        cursor.execute("SELECT * FROM players WHERE id=%s", (session["answer_id"],))
        answer_player = cursor.fetchone()
    conn.close()

    if not guess_player:
        return jsonify({"error": "选手ID不存在"})

    result = {}

    # team / country / position
    for key in ["team", "country", "position"]:
        if guess_player[key] == answer_player[key]:
            result[key] = "correct"
        else:
            result[key] = ""

    # 年龄
    age_diff = guess_player["age"] - answer_player["age"]
    if age_diff == 0:
        result["age"] = "correct"
    elif age_diff > 0:
        result["age"] = "up"
    else:
        result["age"] = "down"

    # TI 次数
    ti_diff = guess_player["ti_count"] - answer_player["ti_count"]
    if ti_diff == 0:
        result["ti_count"] = "correct"
    elif ti_diff > 0:
        result["ti_count"] = "up"
    else:
        result["ti_count"] = "down"

    # 接近标注
    if abs(ti_diff) == 1:
        result["ti_count"] = "close"

    correct = guess_id.lower() == session["answer_id"].lower()
    attempts_left = 10 - session["attempts"]

    # 游戏结束处理
    if correct or attempts_left <= 0:
        session.pop("answer_id", None)
        session.pop("attempts", None)

    return jsonify({
        "guess_player": guess_player,
        "target_player": answer_player,  # 给前端箭头显示
        "result": result,
        "attempts_left": attempts_left,
        "correct": correct
    })



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8888, debug=True)
