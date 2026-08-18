from flask import render_template, request, redirect, make_response,session
import logging
import cloud

class UserLoginHandler:
    @staticmethod
    def get():
        session.pop('user', None)
        response = make_response(render_template("userlogin.html", user=None))
        return response

    @staticmethod
    def post():
        # Verify user login
        user = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        logging.info(f"Login attempt for: {user}")
        
        if cloud.authenticate.user.authenticate_user(user, password):
            logging.info("authenticate succeeded")
            session['user'] = user
            return redirect('/save')
        else:
            logging.info("authenticate failed")
            # Render the login page again with an error message
            return render_template("userlogin.html", error="Invalid email or password", user=user)
