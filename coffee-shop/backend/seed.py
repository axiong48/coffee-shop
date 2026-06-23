from app import create_app
from app.extensions import db
from app.models import Product, User

app = create_app()

with app.app_context():
    admin = User.query.filter_by(email="admin@coffee.com").first()
    if not admin:
        admin = User(name="Admin", email="admin@coffee.com", is_admin=True)
        admin.set_password("admin123")
        db.session.add(admin)

    if Product.query.count() == 0:
        products = [
            Product(name="House Blend", description="Smooth daily coffee blend.", price=12.99, stock=30),
            Product(name="Dark Roast", description="Bold roast with deep flavor.", price=14.99, stock=25),
            Product(name="Cold Brew Bottle", description="Ready-to-drink cold brew.", price=5.99, stock=50),
        ]
        db.session.add_all(products)

    db.session.commit()
    print("Seed complete. Admin login: admin@coffee.com / admin123")
