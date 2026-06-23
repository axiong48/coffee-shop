from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required

from ..extensions import db
from ..models import CartItem, Product

cart_bp = Blueprint("cart", __name__)


def cart_response():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(float(item.product.price) * item.quantity for item in items)
    return jsonify({"items": [item.to_dict() for item in items], "total": total})


@cart_bp.get("")
@login_required
def get_cart():
    return cart_response()


@cart_bp.post("/add")
@login_required
def add_to_cart():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if quantity < 1:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    product = Product.query.get_or_404(product_id)
    if not product.is_active:
        return jsonify({"error": "Product is not available"}), 400

    item = CartItem.query.filter_by(user_id=current_user.id, product_id=product.id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(user_id=current_user.id, product_id=product.id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    return cart_response()


@cart_bp.patch("/<int:item_id>")
@login_required
def update_cart_item(item_id):
    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    data = request.get_json() or {}
    quantity = int(data.get("quantity", item.quantity))

    if quantity < 1:
        db.session.delete(item)
    else:
        item.quantity = quantity

    db.session.commit()
    return cart_response()


@cart_bp.delete("/<int:item_id>")
@login_required
def remove_cart_item(item_id):
    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return cart_response()
