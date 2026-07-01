from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import Order, OrderItem, OrderItemCustomization, MenuItem, CustomizationOption, User
from decorators import role_required

orders_bp = Blueprint("orders", __name__, url_prefix="/api")

POINTS_PER_DOLLAR = 10        # earned
POINT_VALUE_IN_DOLLARS = 0.05  # redemption value: 100 points = $5

VALID_STATUSES = ["pending", "in_progress", "ready", "picked_up"]


@orders_bp.route("/cart/checkout", methods=["POST"])
@login_required
@role_required("customer")
def checkout():
    data = request.get_json() or {}
    location_id = data.get("location_id")
    cart_items = data.get("items", [])
    redeem_points = int(data.get("redeem_points") or 0)
    # Capture promo code from the request
    promo_code = data.get("promo_code", "").strip().upper()

    if not location_id or not cart_items:
        return jsonify({"error": "location_id and at least one item are required"}), 400

    if redeem_points < 0 or redeem_points > current_user.points_balance:
        return jsonify({"error": "Invalid points redemption amount"}), 400

    order = Order(user_id=current_user.id, location_id=location_id, status="pending")
    db.session.add(order)

    subtotal = 0.0

    for ci in cart_items:
        menu_item = MenuItem.query.get(ci.get("menu_item_id"))
        if not menu_item or not menu_item.available:
            db.session.rollback()
            return jsonify({"error": f"Menu item {ci.get('menu_item_id')} is unavailable"}), 400

        quantity = max(1, int(ci.get("quantity", 1)))
        option_ids = ci.get("customization_option_ids", [])

        # Server computes price - never trust a price sent from the client.
        unit_price = menu_item.base_price
        valid_options = []
        for opt_id in option_ids:
            opt = CustomizationOption.query.get(opt_id)
            if opt and opt.menu_item_id == menu_item.id:
                unit_price += opt.price_delta
                valid_options.append(opt)

        order_item = OrderItem(
            order=order,
            menu_item_id=menu_item.id,
            quantity=quantity,
            price_at_purchase=unit_price,
        )
        db.session.add(order_item)

        for opt in valid_options:
            db.session.add(OrderItemCustomization(order_item=order_item, customization_option_id=opt.id))

        subtotal += unit_price * quantity

    # --- PROMO LOGIC ---
    promo_discount = 0.0
    if promo_code == "GRANDOPENING":
        promo_discount = subtotal * 0.15

    # Points discount is calculated against the total AFTER the promo discount is applied
    points_discount = min(redeem_points * POINT_VALUE_IN_DOLLARS, subtotal - promo_discount)
    total = round(subtotal - promo_discount - points_discount, 2)
    # -------------------

    points_earned = int(total * POINTS_PER_DOLLAR)

    order.total = total
    order.points_redeemed = redeem_points
    order.points_earned = points_earned

    current_user.points_balance = current_user.points_balance - redeem_points + points_earned

    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.route("/orders/me", methods=["GET"])
@login_required
@role_required("customer")
def my_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("/orders", methods=["GET"])
@login_required
@role_required("barista", "owner")
def order_queue():
    query = Order.query

    # Baristas only see orders for their assigned location; owners can see all
    # or filter via ?location_id=
    if current_user.role == "barista":
        if not current_user.location_id:
            return jsonify({"error": "Your account has no assigned location"}), 400
        query = query.filter_by(location_id=current_user.location_id)
    else:
        location_id = request.args.get("location_id")
        if location_id:
            query = query.filter_by(location_id=location_id)

    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)

    orders = query.order_by(Order.created_at.asc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("/orders/<int:order_id>/status", methods=["PATCH"])
@login_required
@role_required("barista", "owner")
def update_status(order_id):
    order = Order.query.get_or_404(order_id)

    if current_user.role == "barista" and order.location_id != current_user.location_id:
        return jsonify({"error": "You can only update orders at your own location"}), 403

    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    order.status = new_status
    db.session.commit()
    return jsonify(order.to_dict()), 200
