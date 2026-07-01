"""
Run with: python seed.py
Populates locations, menu items, customizations, and a few demo accounts
so you have something to show in your live demo without manual setup.
"""
from app import create_app
from extensions import db
from models import User, Location, MenuItem, CustomizationOption

app = create_app()

with app.app_context():
    db.create_all()

    if User.query.filter_by(email="owner@coffee.com").first():
        print("Database already seeded. Owner account already exists.")
        exit()

    downtown = Location(name="Downtown", address="123 Main St")
    campus = Location(name="Campus", address="456 University Ave")
    db.session.add_all([downtown, campus])
    db.session.commit()

    latte = MenuItem(name="Latte", description="Espresso with steamed milk", base_price=4.50, category="drink")
    cold_brew = MenuItem(name="Cold Brew", description="Slow-steeped, served cold", base_price=4.00, category="drink")
    croissant = MenuItem(name="Croissant", description="Buttery, flaky", base_price=3.25, category="food")
    db.session.add_all([latte, cold_brew, croissant])
    db.session.commit()

    customizations = [
        CustomizationOption(menu_item_id=latte.id, group_name="Size", choice_label="Small", price_delta=0.0),
        CustomizationOption(menu_item_id=latte.id, group_name="Size", choice_label="Large", price_delta=0.75),
        CustomizationOption(menu_item_id=latte.id, group_name="Milk", choice_label="Whole", price_delta=0.0),
        CustomizationOption(menu_item_id=latte.id, group_name="Milk", choice_label="Oat Milk", price_delta=0.65),
        CustomizationOption(menu_item_id=cold_brew.id, group_name="Size", choice_label="Small", price_delta=0.0),
        CustomizationOption(menu_item_id=cold_brew.id, group_name="Size", choice_label="Large", price_delta=0.75),
    ]
    db.session.add_all(customizations)
    db.session.commit()

    owner = User(email="owner@coffee.com", name="Owner Olivia", role="owner")
    owner.set_password("owner123")

    barista = User(email="barista@coffee.com", name="Barista Ben", role="barista", location_id=downtown.id)
    barista.set_password("barista123")

    customer = User(email="customer@coffee.com", name="Customer Carl", role="customer")
    customer.set_password("customer123")

    db.session.add_all([owner, barista, customer])
    db.session.commit()

    print("Seeded database with:")
    print("owner@coffee.com / owner123")
    print("barista@coffee.com / barista123")
    print("customer@coffee.com / customer123")