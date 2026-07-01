from flask import Blueprint, request, jsonify
from flask_login import login_required
from sqlalchemy import func
from extensions import db
from models import MenuItem, CustomizationOption, Location, Order, OrderItem
from decorators import role_required

owner_bp = Blueprint("owner", __name__, url_prefix="/api/owner")


# ---------- Locations ----------

@owner_bp.route("/locations", methods=["POST"])
@login_required
@role_required("owner")
def create_location():
    data = request.get_json() or {}
    name = data.get("name")
    address = data.get("address")
    if not name or not address:
        return jsonify({"error": "name and address are required"}), 400

    loc = Location(name=name, address=address)
    db.session.add(loc)
    db.session.commit()
    return jsonify(loc.to_dict()), 201


@owner_bp.route("/locations/<int:location_id>", methods=["DELETE"])
@login_required
@role_required("owner")
def delete_location(location_id):
    loc = Location.query.get_or_404(location_id)
    db.session.delete(loc)
    db.session.commit()
    return jsonify({"message": "Location deleted"}), 200


# ---------- Menu items ----------

@owner_bp.route("/menu", methods=["GET"])
@login_required
@role_required("owner", "barista")
def list_all_menu_items():
    # includes unavailable items, unlike the public /api/menu endpoint
    items = MenuItem.query.all()
    return jsonify([i.to_dict() for i in items]), 200


@owner_bp.route("/menu", methods=["POST"])
@login_required
@role_required("owner")
def create_menu_item():
    data = request.get_json() or {}
    name = data.get("name")
    base_price = data.get("base_price")
    if not name or base_price is None:
        return jsonify({"error": "name and base_price are required"}), 400

    item = MenuItem(
        name=name,
        description=data.get("description", ""),
        base_price=float(base_price),
        category=data.get("category", "drink"),
        available=data.get("available", True),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@owner_bp.route("/menu/<int:item_id>", methods=["PATCH"])
@login_required
@role_required("owner")
def update_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    data = request.get_json() or {}

    for field in ("name", "description", "category"):
        if field in data:
            setattr(item, field, data[field])
    if "base_price" in data:
        item.base_price = float(data["base_price"])
    if "available" in data:
        item.available = bool(data["available"])

    db.session.commit()
    return jsonify(item.to_dict()), 200


@owner_bp.route("/menu/<int:item_id>", methods=["DELETE"])
@login_required
@role_required("owner")
def delete_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


# ---------- Customization options ----------

@owner_bp.route("/menu/<int:item_id>/customizations", methods=["POST"])
@login_required
@role_required("owner")
def add_customization(item_id):
    MenuItem.query.get_or_404(item_id)
    data = request.get_json() or {}
    group_name = data.get("group_name")
    choice_label = data.get("choice_label")
    if not group_name or not choice_label:
        return jsonify({"error": "group_name and choice_label are required"}), 400

    opt = CustomizationOption(
        menu_item_id=item_id,
        group_name=group_name,
        choice_label=choice_label,
        price_delta=float(data.get("price_delta", 0.0)),
    )
    db.session.add(opt)
    db.session.commit()
    return jsonify(opt.to_dict()), 201


@owner_bp.route("/customizations/<int:option_id>", methods=["DELETE"])
@login_required
@role_required("owner")
def delete_customization(option_id):
    opt = CustomizationOption.query.get_or_404(option_id)
    db.session.delete(opt)
    db.session.commit()
    return jsonify({"message": "Customization deleted"}), 200


# ---------- Analytics ----------

@owner_bp.route("/analytics", methods=["GET"])
@login_required
@role_required("owner")
def analytics():
    total_revenue = db.session.query(func.coalesce(func.sum(Order.total), 0.0)).scalar()
    total_orders = db.session.query(func.count(Order.id)).scalar()

    revenue_by_location = (
        db.session.query(Location.name, func.coalesce(func.sum(Order.total), 0.0))
        .join(Order, Order.location_id == Location.id)
        .group_by(Location.name)
        .all()
    )

    top_items = (
        db.session.query(MenuItem.name, func.sum(OrderItem.quantity).label("qty"))
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .group_by(MenuItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    return jsonify({
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "revenue_by_location": [{"location": name, "revenue": round(rev, 2)} for name, rev in revenue_by_location],
        "top_items": [{"name": name, "quantity_sold": int(qty)} for name, qty in top_items],
    }), 200
