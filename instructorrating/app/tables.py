from flask_table import Table, Col, LinkCol, DateCol, OptCol

class decCol(Col):
    def td_format(self, content):
        if not isinstance(content, str):
            return int(content)



class ProfessorTable(Table):
    pid = Col('pid', show=False)
    pname = LinkCol('Professor', 'view_professors', text_fallback=False,
                        url_kwargs=dict(pid='pid'),  attr_list='pname')
    nuggets = OptCol('CULPA Nugget', choices={0:'Silver', 1:'Gold'})
    score = decCol('Score')
    nrev = Col('Reviews')


class ReviewTable(Table):
    rid = Col('rid', show=False)
    date = DateCol('Date')
    text = Col('Summary')
    agree = decCol('Agree')
    disagree = decCol('Disagree')
    funny = decCol('Funny')
    details = LinkCol('Details', 'redirect_culpa', url_kwargs=dict(id='rid'))

class CourseTable(Table):
    cid = Col('cid', show=False)
    cname = Col('Course')
    #cname = LinkCol('Course', 'redirect_search', text_fallback=False,
    #                url_kwargs=dict(cnamesearch='cname'), attr_list='cname',
    #                url_kwargs_extra=dict( pnamesearch='', did=-1,) )

class DepartmentTable(Table):
    did = Col('did', show=False)
    dname = Col('Department')
    #dname = LinkCol('Department', 'redirect_search', url_kwargs=dict(did='did'),
    #                text_fallback=False, attr_list='dname', url_kwargs_extra=dict(pnamesearch='', cnamesearch=''))

