from flask import Blueprint, jsonify
from models import MenuItem, Location

menu_bp = Blueprint("menu", __name__, url_prefix="/api")


@menu_bp.route("/locations", methods=["GET"])
def get_locations():
    locations = Location.query.all()
    return jsonify([l.to_dict() for l in locations]), 200


@menu_bp.route("/menu", methods=["GET"])
def get_menu():
    # Customers should only see available items; owners use a separate
    # endpoint (owner.py) that returns everything including unavailable items.
    items = MenuItem.query.filter_by(available=True).all()
    return jsonify([i.to_dict() for i in items]), 200
