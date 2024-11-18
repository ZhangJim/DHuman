from flask import Flask, render_template

app = Flask(__name__, 
    static_folder='public',  # 设置静态文件夹
    static_url_path=''       # 设置URL路径前缀为空
)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 