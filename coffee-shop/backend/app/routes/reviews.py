from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required

from ..extensions import db
from ..models import Product, Review

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.post("/products/<int:product_id>")
@login_required
def create_or_update_review(product_id):
    Product.query.get_or_404(product_id)
    data = request.get_json() or {}
    rating = int(data.get("rating", 0))
    comment = data.get("comment", "").strip()

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    review = Review.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    if review:
        review.rating = rating
        review.comment = comment
    else:
        review = Review(user_id=current_user.id, product_id=product_id, rating=rating, comment=comment)
        db.session.add(review)

    db.session.commit()
    return jsonify(review.to_dict()), 201
