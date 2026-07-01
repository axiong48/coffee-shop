from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")  # customer | barista | owner
    points_balance = db.Column(db.Integer, nullable=False, default=0)
    # only used for barista accounts - which location they work at
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "points_balance": self.points_balance,
            "location_id": self.location_id,
        }


class Location(db.Model):
    __tablename__ = "locations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "address": self.address}


class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    base_price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(60), nullable=False, default="drink")
    available = db.Column(db.Boolean, nullable=False, default=True)

    customizations = db.relationship(
        "CustomizationOption", backref="menu_item", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self, include_customizations=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "base_price": self.base_price,
            "category": self.category,
            "available": self.available,
        }
        if include_customizations:
            data["customizations"] = [c.to_dict() for c in self.customizations]
        return data


class CustomizationOption(db.Model):
    """A single choice within a customization group, e.g. group 'Size', choice 'Large'."""
    __tablename__ = "customization_options"

    id = db.Column(db.Integer, primary_key=True)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"), nullable=False)
    group_name = db.Column(db.String(60), nullable=False)   # e.g. "Size", "Milk"
    choice_label = db.Column(db.String(60), nullable=False)  # e.g. "Large", "Oat Milk"
    price_delta = db.Column(db.Float, nullable=False, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "menu_item_id": self.menu_item_id,
            "group_name": self.group_name,
            "choice_label": self.choice_label,
            "price_delta": self.price_delta,
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    # pending -> in_progress -> ready -> picked_up
    total = db.Column(db.Float, nullable=False, default=0.0)
    points_earned = db.Column(db.Integer, nullable=False, default=0)
    points_redeemed = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")
    location = db.relationship("Location")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_name": self.user.name if self.user else None,
            "location_id": self.location_id,
            "location_name": self.location.name if self.location else None,
            "status": self.status,
            "total": self.total,
            "points_earned": self.points_earned,
            "points_redeemed": self.points_redeemed,
            "created_at": self.created_at.isoformat(),
            "items": [i.to_dict() for i in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price_at_purchase = db.Column(db.Float, nullable=False)  # frozen unit price incl. customizations

    menu_item = db.relationship("MenuItem")
    customization_links = db.relationship(
        "OrderItemCustomization", backref="order_item", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "menu_item_id": self.menu_item_id,
            "menu_item_name": self.menu_item.name if self.menu_item else None,
            "quantity": self.quantity,
            "price_at_purchase": self.price_at_purchase,
            "customizations": [c.choice_label() for c in self.customization_links],
        }


class OrderItemCustomization(db.Model):
    __tablename__ = "order_item_customizations"

    id = db.Column(db.Integer, primary_key=True)
    order_item_id = db.Column(db.Integer, db.ForeignKey("order_items.id"), nullable=False)
    customization_option_id = db.Column(db.Integer, db.ForeignKey("customization_options.id"), nullable=False)

    option = db.relationship("CustomizationOption")

    def choice_label(self):
        if self.option:
            return f"{self.option.group_name}: {self.option.choice_label}"
        return None
