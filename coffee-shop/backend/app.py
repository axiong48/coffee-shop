import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from extensions import db, login_manager, cors
from models import User

load_dotenv()


def create_app():
    app = Flask(__name__)

    base_dir = os.path.abspath(os.path.dirname(__file__))

    database_url = os.environ.get("DATABASE_URL")

    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url or f"sqlite:///{os.path.join(base_dir, 'coffee.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

    is_production = os.environ.get("FLASK_ENV") == "production"

    app.config["SESSION_COOKIE_SAMESITE"] = "None" if is_production else "Lax"
    app.config["SESSION_COOKIE_SECURE"] = True if is_production else False
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    db.init_app(app)
    login_manager.init_app(app)

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        frontend_url,
    ]

    cors.init_app(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "supports_credentials": True,
            }
        },
    )
    

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "Not logged in"}), 401

    from routes.auth import auth_bp
    from routes.menu import menu_bp
    from routes.orders import orders_bp
    from routes.owner import owner_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(owner_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5001, debug=True)