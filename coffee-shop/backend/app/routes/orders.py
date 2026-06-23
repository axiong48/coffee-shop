from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from ..extensions import db
from ..models import CartItem, Order, OrderItem

orders_bp = Blueprint("orders", __name__)


@orders_bp.get("")
@login_required
def my_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.id.desc()).all()
    return jsonify([order.to_dict() for order in orders])


@orders_bp.post("/checkout")
@login_required
def checkout():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total = sum(float(item.product.price) * item.quantity for item in cart_items)
    order = Order(user_id=current_user.id, total=total, status="pending")
    db.session.add(order)
    db.session.flush()

    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price,
        )
        db.session.add(order_item)
        db.session.delete(item)

    db.session.commit()
    return jsonify(order.to_dict()), 201
