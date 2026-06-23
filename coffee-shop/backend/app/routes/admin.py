from flask import Blueprint, request, jsonify

from ..extensions import db
from ..models import Product, Order
from .helpers import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/products")
@admin_required
def admin_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify([product.to_dict() for product in products])


@admin_bp.post("/products")
@admin_required
def create_product():
    data = request.get_json() or {}
    product = Product(
        name=data.get("name", "").strip(),
        description=data.get("description", "").strip(),
        price=data.get("price", 0),
        image_url=data.get("image_url", "").strip() or None,
        stock=int(data.get("stock", 0)),
        is_active=bool(data.get("is_active", True)),
    )

    if not product.name or float(product.price) <= 0:
        return jsonify({"error": "Product name and valid price are required"}), 400

    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@admin_bp.patch("/products/<int:product_id>")
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    for field in ["name", "description", "price", "image_url", "stock", "is_active"]:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify(product.to_dict())


@admin_bp.delete("/products/<int:product_id>")
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Product removed from public menu"})


@admin_bp.get("/orders")
@admin_required
def all_orders():
    orders = Order.query.order_by(Order.id.desc()).all()
    return jsonify([order.to_dict() for order in orders])
