from app import app, db
from flask import render_template, redirect, flash
from app.forms import SearchForm
from app.db_access import import_reviews, import_professors, update_text
import pandas as pd
from app.models import Professor, Department, Course, Review
from app.tables import DepartmentTable, CourseTable, ReviewTable, ProfessorTable
#from gensim.summarization.summarizer import summarize


@app.route('/')
def home():
    return redirect('/index')

@app.route('/index', methods=['GET', 'POST'])
def index():
    form = SearchForm()

    dqry = Department.query.order_by('dname')
    dchoice = [(-1, 'Choose Department')]
    dchoice.extend([(d.did, d.dname) for d in dqry])

    form.department_select.choices =  dchoice

    if form.validate_on_submit():
        
        pnamesearch=form.professor_name.data
        cnamesearch=form.course_name.data
        did=form.department_select.data

        if (pnamesearch == '') & (cnamesearch == '') & (did==-1):
            flash("Please fill at least one search field!")
            return redirect('/index')

        return search_professor(pnamesearch, cnamesearch, did)
            
    return render_template('index.html', title='Home', form=form)


@app.route('/results', methods=['GET', 'POST'])
def search_professor(pnamesearch, cnamesearch, did):
    qry = Professor.query
    if pnamesearch != '':
        for name in pnamesearch.split(' '):
            qry = qry.filter(Professor.pname.contains(name))
    
    if did != -1:
        qry = qry.filter(Professor.departments.any(Department.did.in_([did])))
    
    if cnamesearch != '':
        for course in cnamesearch.split(' '):
            qry = qry.filter(Professor.courses.any(Course.cname.contains(course)))

    ptable = ProfessorTable(qry.order_by(Professor.pname).all(), border=False, no_items='Professor not found! Try again?')
    return render_template('results.html', ptable=ptable)


@app.route('/leaderboarddept', methods=['GET', 'POST'])
def leaderboard_department():
    form = SearchForm()
    dqry = Department.query.order_by('dname')
    dchoice = [(-1, 'Choose Department')]
    dchoice.extend([(d.did, d.dname) for d in dqry])
    form.department_select.choices =  dchoice
    items=Professor.query.filter(Professor.pid==9999999).all()
    
    title = 'Department Leaderboard'
    name = 'Department'

    if form.validate_on_submit():
        did = form.department_select.data
        qry = Professor.query.filter(Professor.departments.any(Department.did.in_([did])))
        qry = qry.filter(Professor.nrev>=6).order_by(Professor.score.desc()).limit(10)
        items = qry.all()

    ptable = ProfessorTable(items, border=False, no_items='Choose a department!')

    return render_template('leaderboard.html', name=name, title=title, ptable=ptable, form=form)


@app.route('/leaderboard', methods=['GET', 'POST'])
def leaderboard():
    title = 'Overall Leaderboard'
    name = 'Overall'

    qry = Professor.query.filter(Professor.nrev>=15).order_by(Professor.score.desc()).limit(50)
    qry = qry.from_self().filter(Professor.reviews.any(Review.date > '2016-01-01'))
    qry = qry.order_by(Professor.score.desc()).limit(20)
    items = qry.all()

    ptable = ProfessorTable(items, border=False, classes=['ltable'])

    return render_template('leaderboard.html', name=name, title=title, ptable=ptable)


@app.route('/leaderboardalltime', methods=['GET', 'POST'])
def leaderboard_alltime():
    title = 'All-time Leaderboard'
    name = 'All-time'

    qry = Professor.query.filter(Professor.nrev>=15)
    qry = qry.order_by(Professor.score.desc()).limit(30)
    items = qry.all()

    ptable = ProfessorTable(items, border=False)

    return render_template('leaderboard.html', name=name, title=title, ptable=ptable)



@app.route('/thereisnocowlevel', methods=['GET', 'POST'])
def secret():

    qry = Professor.query.filter(Professor.nrev>=15).order_by(Professor.score).limit(20)
    items = qry.all()

    ptable = ProfessorTable(items, border=False)

    return render_template('leaderboard.html', ptable=ptable)




@app.route('/professors/<int:pid>', methods=['GET', 'POST'])
def view_professors(pid):
    qry = Professor.query.filter(Professor.pid==pid).first()
    name = qry.pname
    score = qry.score
    dtable = DepartmentTable(qry.departments, no_items='No department!', border=False)
    ctable = CourseTable(qry.courses, no_items='No courses!',border=False)
    rvs = []
    for r in qry.reviews.order_by(Review.date.desc()).all():
     #   if len(r.text.split('.')) > 1:
     #       r.text = summarize(r.text, word_count=15)
     #       rvs.append(r)
     #   else:
        rvs.append(r)
    rtable = ReviewTable(rvs, border=True)
    return render_template('professors.html', name=name, score=score, 
                            title='Professor {}'.format(name), dtable=dtable, 
                            ctable=ctable, rtable=rtable)


@app.route('/redirect/reviews/<int:id>', methods=['GET','POST'])
def redirect_culpa(id):
    return redirect("http://culpa.info/reviews/{}".format(id))


#@app.route('/redirect/search/<int:did><string:pnamesearch><string:cnamesearch>', methods=['GET','POST'])
#def redirect_search(did, pnamesearch, cnamesearch):
#    return search_professor(did,pnamesearch, cnamesearch)


@app.route('/populatereviews')
def populatereviews():
    df = pd.read_csv('../data/dataframe_final.csv', index_col=0)
    import_reviews(df)
    return redirect('/index')

@app.route('/populateprofs')
def populateprofs():
    df = pd.read_csv('../data/final_prof_table.csv', index_col=2)
    import_professors(df)
    return redirect('/index')

@app.route('/updatetext')
def updatetext():
    df = pd.read_csv('../data/dataframe_final.csv', index_col=2)
    update_text(df)
    return redirect('/index')
