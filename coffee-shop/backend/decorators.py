from functools import wraps
from flask import jsonify
from flask_login import current_user


def role_required(*roles):
    """Restrict a route to one or more roles, e.g. @role_required('owner')"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not current_user.is_authenticated:
                return jsonify({"error": "Not logged in"}), 401
            if current_user.role not in roles:
                return jsonify({"error": "Forbidden - insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
