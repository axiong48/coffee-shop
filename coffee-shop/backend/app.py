import os
from flask import Flask, jsonify
from extensions import db, login_manager, cors
from models import User


def create_app():
    app = Flask(__name__)

    base_dir = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(base_dir, 'coffee.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

    # 127.0.0.1:5173 and 127.0.0.1:5000 are "same-site" (same registrable
    # domain, different port) so Lax works here and doesn't require HTTPS.
    # NOTE: SameSite=None without Secure gets silently dropped by browsers
    # over plain HTTP - that combination is what broke login earlier.
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False  # set True once served over HTTPS in production

    db.init_app(app)
    login_manager.init_app(app)
    cors.init_app(
        app,
        supports_credentials=True,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

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


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
