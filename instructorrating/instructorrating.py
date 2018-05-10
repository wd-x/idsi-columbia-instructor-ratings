from app import app, db
from app.models import Professor, Department, Course, Review


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Professor': Professor, 'Department': Department,
        'Course': Course, 'Review':Review}
