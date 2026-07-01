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
    promo_code = data.get("promo_code", "").strip().upper()  # Get promo code

    if not location_id or not cart_items:
        return jsonify({"error": "location_id and at least one item are required"}), 400

    if redeem_points < 0 or redeem_points > current_user.points_balance:
        return jsonify({"error": "Invalid points redemption amount"}), 400

    # Calculate subtotal based on items in database
    subtotal = 0.0
    for ci in cart_items:
        menu_item = MenuItem.query.get(ci.get("menu_item_id"))
        if not menu_item:
            return jsonify({"error": f"Item {ci.get('menu_item_id')} not found"}), 404
        
        item_price = menu_item.base_price
        for opt_id in ci.get("customization_option_ids", []):
            opt = CustomizationOption.query.get(opt_id)
            if opt:
                item_price += opt.price_delta
        
        subtotal += item_price * ci.get("quantity", 1)

    # --- NEW PROMO LOGIC ---
    promo_discount = 0.0
    if promo_code == "GRANDOPENING":
        promo_discount = subtotal * 0.15

    # Ensure points discount doesn't exceed the remaining total
    points_discount = min(redeem_points * POINT_VALUE_IN_DOLLARS, subtotal - promo_discount)
    
    final_total = max(0, subtotal - promo_discount - points_discount)
    # -----------------------

    # Create Order
    order = Order(
        user_id=current_user.id, 
        location_id=location_id, 
        status="pending",
        total=final_total  # Assuming 'total' column exists in Order model
    )
    db.session.add(order)
    db.session.commit()

    # (Proceed with creating OrderItems and handling points_balance...)
    # [Rest of your existing item creation logic remains the same]

    return jsonify({"message": "Order placed", "order_id": order.id}), 201