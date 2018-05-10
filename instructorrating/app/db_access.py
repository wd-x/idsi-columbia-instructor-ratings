from app import db
from app.models import Professor, Department, Review, Course
import pandas as pd
import ast
from tqdm import tqdm

def import_reviews(df):

    def insertstr(item):
        if item.isnull().bool():
            return None
        else:
            return str(item.values[0])
    
    def insertint(item):
        if item.isnull().bool():
            return None
        else:
            return int(item)

    review_ids = list(df.review_id)
    for i in tqdm(review_ids):
        series = df.loc[df.review_id==i, :]
        
        try:
            r = Review(**{
                'rid' : int(series.review_id),
                'date' : pd.to_datetime(series.review_date.values[0]),
                'text' : str(series.review_text.values[0]),
                'agree' : int(series.agree_score),
                'disagree' : int(series.disagree_score),
                'funny' : int(series.funny_score),
                'workload' : insertstr(series.workload),
                'workload_label' : insertint(series.workload_label),
                'review_label' : insertint(series.review_label),
                'pid' : insertint(series.professor_id),
                'cid' : insertint(series.course_id)
            })
            db.session.add(r)
            db.session.commit()
        except:
            db.session.rollback()
            print('error importing review {}'.format(i))


def import_professors(df):
    for i in tqdm(df.iterrows()):
        pid, series = i
        pname = series.Name
        score = None if str(series.Score) == 'nan' else series.Score
        nrev = None if str(series.Num_Reviews) == 'nan' else series.Num_Reviews
        if series.Nugget == 'None':
            nuggets = None
        elif series.Nugget == 'Gold':
            nuggets = 1
        else:
            nuggets = 0
        p = Professor(pid=pid, pname=pname, nuggets=nuggets, score=score, nrev=nrev)
        
        dparsed = ast.literal_eval(series.Dept)
        if dparsed:
            if isinstance(dparsed, list): 
                for d in dparsed:
                    dname, did = d
                    dquery = Department.query.filter(Department.did==did).first()
                    if dquery:
                        p.departments.append(dquery)
                    else:
                        d = Department(dname=dname, did=did)
                        p.departments.append(d)
            else:
                dname, did = dparsed
                dquery = Department.query.filter(Department.did==did).first()
                if dquery:
                        p.departments.append(dquery)
                else:
                    d = Department(dname=dname, did=did)
                    p.departments.append(d)
        
        cparsed = ast.literal_eval(series.Courses)
        if cparsed:
            if isinstance(cparsed, list):
                for c in cparsed:
                    cname, cid = c
                    cquery = Course.query.filter(Course.cid==cid).first()
                    if cquery:
                        p.courses.append(cquery)
                    else:
                        c = Course(cname=cname, cid=cid)
                        p.courses.append(c)
            else:
                cname, cid = cparsed
                cquery = Course.query.filter(Course.cid==cid).first()
                if cquery:
                    p.courses.append(cquery)
                else:
                    c = Course(cname=cname, cid=cid)
                    p.courses.append(c)
        db.session.add(p)
        db.session.commit()
        
'''
        pquery = Professor.query.filter(Professor.pid==int(series.professor_id)).first()
        if pquery:
            pquery.reviews.append(r)
        else:
            p = Professor(**{
                'pid' : int(series.professor_id)
                'pname' : str(series.professor_name.values[0])
            })
            p.reviews.append(r)
'''