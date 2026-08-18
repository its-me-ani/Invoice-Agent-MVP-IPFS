from flask import request, jsonify, session
import logging
from cloud.authenticate.user import user_exists, create_user, authenticate_user

logger = logging.getLogger(__name__)

class AuthApiHandler:
    @staticmethod
    def register():
        try:
            data = request.get_json() or {}
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            
            if not email or not password:
                return jsonify(error="Email and password are required"), 400
                
            if user_exists(email):
                return jsonify(error="User already exists"), 400
                
            create_user(email, password)
            logger.info(f"User registered successfully: {email}")
            return jsonify(message="User registered successfully", email=email), 201
        except Exception as e:
            logger.exception("Failed to register user")
            return jsonify(error=f"Registration failed: {str(e)}"), 500

    @staticmethod
    def login():
        try:
            data = request.get_json() or {}
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            
            if not email or not password:
                return jsonify(error="Email and password are required"), 400
                
            if authenticate_user(email, password):
                session['user'] = email
                logger.info(f"User logged in successfully: {email}")
                return jsonify(message="Login successful", email=email), 200
            else:
                logger.info(f"Login failed for: {email}")
                return jsonify(error="Invalid email or password"), 401
        except Exception as e:
            logger.exception("Failed to authenticate user")
            return jsonify(error=f"Login failed: {str(e)}"), 500

    @staticmethod
    def logout():
        user = session.pop('user', None)
        if user:
            logger.info(f"User logged out: {user}")
        return jsonify(message="Logged out successfully"), 200

    @staticmethod
    def status():
        email = session.get('user')
        if email:
            return jsonify(authenticated=True, email=email), 200
        return jsonify(authenticated=False), 200
