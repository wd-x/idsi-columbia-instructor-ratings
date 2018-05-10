from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField
from wtforms.validators import DataRequired, Optional
from app.models import Professor

class SearchForm(FlaskForm):
    professor_name = StringField('Professor Name')
    department_select = SelectField('Department', coerce=int, validators=[Optional()])
    course_name = StringField('Course Name', validators=[Optional()])
    submit = SubmitField('Search')

