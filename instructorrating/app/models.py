from app import db


professor_department = db.Table('professor_department',
    db.Column('did', db.Integer, db.ForeignKey('departments.did')),
    db.Column('pid', db.Integer, db.ForeignKey('professors.pid')))

course_department = db.Table('course_department',
    db.Column('did', db.Integer, db.ForeignKey('departments.did')),
    db.Column('cid', db.Integer, db.ForeignKey('courses.cid')))

professor_course = db.Table('professor_course',
    db.Column('pid', db.Integer, db.ForeignKey('professors.pid')),
    db.Column('cid', db.Integer, db.ForeignKey('courses.cid')))


class Professor(db.Model):
    __tablename__ = 'professors'
    pid = db.Column(db.Integer, primary_key=True)
    pname = db.Column(db.String(128))
    nuggets = db.Column(db.Integer)
    score = db.Column(db.Numeric(precision=2))
    nrev = db.Column(db.Integer)

    departments = db.relationship("Department",
                    secondary=professor_department)
    courses = db.relationship("Course",
                    secondary=professor_course)   
    reviews = db.relationship("Review", backref='professors',
                                            lazy='dynamic', cascade="delete")         

    def __repr__(self):
        return '<Professor {} with culpa_id {}'.format(self.pname, self.pid)


class Department(db.Model):
    __tablename__ = 'departments'
    did = db.Column(db.Integer, primary_key=True)
    dname = db.Column(db.String(64))

    professors = db.relationship("Professor",
                secondary=professor_department)
    courses =  db.relationship("Course",
                secondary=course_department)

    def __repr__(self):
        return '<Department {} with culpa_id {}'.format(self.dname, self.did)


class Course(db.Model):
    __tablename__ = 'courses'
    cid = db.Column(db.Integer, primary_key=True)
    cname = db.Column(db.String(64))

    professors = db.relationship("Professor",
                secondary=professor_course)
    departments = db.relationship("Department",
                secondary=course_department)
    reviews = db.relationship("Review", backref='courses',
                                            lazy='dynamic', cascade="delete")

    def __repr__(self):
        return '<Course {} with culpa_id {}'.format(self.cname, self.cid)


class Review(db.Model):
    __tablename__ = 'reviews'
    rid = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    text = db.Column(db.String)
    agree = db.Column(db.Numeric)
    disagree = db.Column(db.Numeric)
    funny = db.Column(db.Numeric)
    workload = db.Column(db.String)
    workload_label = db.Column(db.Integer)
    review_label = db.Column(db.Integer)

    cid = db.Column(db.Integer, db.ForeignKey('courses.cid'))
    pid = db.Column(db.Integer, db.ForeignKey('professors.pid'))

    def __repr__(self):
        return '<Review with culpa_id {}'.format(self.rid)
