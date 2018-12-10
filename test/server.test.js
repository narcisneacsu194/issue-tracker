const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const { app } = require('../server');
const { Project } = require('../models/project');
const { Issue } = require('../models/issue');
const { populateProjectCollection, populateIssueCollection, projects, issues} = require('./database/populateDatabase');

beforeEach(populateProjectCollection);
beforeEach(populateIssueCollection);

describe('POST /api/issues/:projectname', () => {
  it('should create a new issue for the given project', (done) => {
    const date = moment().format('ddd MMM DD YYYY HH:mm');
    const projectName = 'project3';
    const body = {
        issue_title: 'issueTitle3',
        issue_text: 'issueText3',
        created_on: date,
        updated_on: date,
        created_by: 'createdBy3',
        assigned_to: 'assignedTo3',
        open: true,
        status_text: 'statusText3'        
    };

    request(app)
      .post(`/api/issues/${projectName}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        body._id = res.body._id;
        expect(res.body).toEqual(body);
      })
      .end((err, res) => {
          if(err){
            return done(err);
          }

          Project.findOne({ name: projectName}).then((project) => {
            expect(project.name).toBe(projectName);
            return Issue.findOne({_id: res.body._id});
          }).then((issue) => {
            expect(issue.issue_title).toEqual(body.issue_title);
            expect(issue.issue_text).toBe(body.issue_text);
            expect(issue.created_on).toBe(body.created_on);
            expect(issue.updated_on).toBe(body.updated_on);
            expect(issue.created_by).toBe(body.created_by);
            expect(issue.assigned_to).toBe(body.assigned_to);
            expect(issue.open).toBe(body.open);
            expect(issue.status_text).toBe(body.status_text);
            done();
          }).catch((err) => done(err));
      });
  });

  it('should create a new issue for the given project without using assigned_to and status_text properties', (done) => {
    const date = moment().format('ddd MMM DD YYYY HH:mm');
    const projectName = 'project3';
    const body = {
        issue_title: 'issueTitle3',
        issue_text: 'issueText3',
        created_on: date,
        updated_on: date,
        created_by: 'createdBy3',
        open: true        
    };

    request(app)
      .post(`/api/issues/${projectName}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        body._id = res.body._id;
        body.assigned_to = '';
        body.status_text = '';
        expect(res.body).toEqual(body);
      })
      .end((err, res) => {
          if(err){
            return done(err);
          }

          Project.findOne({ name: projectName}).then((project) => {
            expect(project.name).toBe(projectName);
            return Issue.findOne({_id: res.body._id});
          }).then((issue) => {
            expect(issue.issue_title).toEqual(body.issue_title);
            expect(issue.issue_text).toBe(body.issue_text);
            expect(issue.created_on).toBe(body.created_on);
            expect(issue.updated_on).toBe(body.updated_on);
            expect(issue.created_by).toBe(body.created_by);
            expect(issue.assigned_to).toBe('');
            expect(issue.open).toBe(body.open);
            expect(issue.status_text).toBe('');
            done();
          }).catch((err) => done(err));
      });
  });

  it('should return an error message if issue_title not provided', (done) => {
    const date = moment().format('ddd MMM DD YYYY HH:mm');
    const projectName = 'project3';
    const body = {
        issue_text: 'issueText3',
        created_on: date,
        updated_on: date,
        created_by: 'createdBy3',
        assigned_to: 'assignedTo3',
        open: true,
        status_text: 'statusText3'        
    };

    request(app)
      .post(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('missing inputs');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Project.findOne({ name: projectName}).then((project) => {
            expect(project).toBeFalsy();
            return Issue.findOne({ issue_text: 'issueText3' });
          }).then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch((err) => done(err));
      });
  });
});

describe('PUT /api/issues/:projectname', () => {
  it('should successfully update the issue properties', (done) => {
    const projectName = 'project1';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited",
        _id: issues[0]._id
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.text).toBe('successfully updated');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.findOne({ _id: issues[0]._id }).then((issue) => {
          expect(issue.issue_title).toBe(body.issue_title);
          expect(issue.issue_text).toBe(body.issue_text);;
          expect(issue.created_on).toBe(body.created_on);
          expect(issue.assigned_to).toBe(body.assigned_to);
          expect(issue.open).toBe(body.open);
          expect(issue.status_text).toBe(body.status_text);
          expect(issue._id).toEqual(body._id);
          done();
        }).catch((err) => done(err));
      });
  }); 
  it('should return error message if no id property provided', (done) => {
    const projectName = 'project3';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited"
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Project.findOne({ name: projectName }).then((project) => {
          expect(project).toBeFalsy();
          return Issue.findOne({ issue_title: 'issueTitle-edited' });
        }).then((issue) => {
          expect(issue).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return error message if the provided id is an empty string', (done) => {
    const projectName = 'project3';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited",
        _id: " "
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
          if(err){
            return done(err);
          }

          Project.findOne({ name: projectName }).then((project) => {
            expect(project).toBeFalsy();
            return Issue.findOne({ issue_title: 'issueTitle-edited' });
          }).then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch((err) => done(err));
      });
  });

  it('should return error message if the provided id is not valid', (done) => {
    const projectName = 'project3';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited",
        _id: "123"
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
          if(err){
            return done(err);
          }

          Project.findOne({ name: projectName }).then((project) => {
            expect(project).toBeFalsy();
            return Issue.findOne({ issue_title: 'issueTitle-edited' });
          }).then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch((err) => done(err));
      });
  });

  it('should return error message if no field is sent for update', (done) => {
    const projectName = 'project1';
    const body = {
      _id: issues[0]._id
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('no updated field sent');
      })
      .end((err, res) => {
          if(err){
            return done(err);
          }

          Issue.findOne({ _id: issues[0]._id}).then((issue) => {
            expect(issue.issue_title).toBe(issues[0].issue_title);
            done();
          }).catch((err) => done(err));
      });
  });

  it('should return error message if non-existing project is passed', (done) => {
    const projectName = 'project3';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited",
        _id: issues[0]._id
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.findOne({ _id: issues[0]._id}).then((issue) => {
            expect(issue.issue_title).toBe(issues[0].issue_title);
            done();
          }).catch((err) => done(err));
      });
  });

  it('should return error message if issue with given id doesn\'t exist', (done) => {
    const projectName = 'project1';
    const body = {
        issue_title: "issueTitle-edited",
        issue_text: "issueText-edited",
        created_on: "createdOn-edited",
        created_by: "createdBy-edited",
        assigned_to: "assignedTo-edited",
        open: false,
        status_text: "statusText-edited",
        _id: new ObjectID()
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.findOne({ _id: issues[0]._id}).then((issue) => {
            expect(issue.issue_title).toBe(issues[0].issue_title);
            done();
          }).catch((err) => done(err));
      });
  });
});

describe('DELETE /api/issues/:projectname', () => {
  it('should successfully delete issue by specified id', (done) => {
    const projectName = 'project2';
    const body = {
      _id: issues[1]._id
    };

    request(app)
     .delete(`/api/issues/${projectName}`)
     .send(body)
     .expect((res) => {
       expect(`deleted ${body._id}`);
     })
     .end((err, res) => {
       if(err){
         return done(err);
       }

       Issue.find({}).then((issues) => {
        expect(issues.length).toBe(1);
        return Issue.findOne({ _id: body._id });
       }).then((issue) => {
         expect(issue).toBeFalsy();
         done();
       })
       .catch((err) => done(err));
     });
  });

  it('should return error message if no issue id provided', (done) => {
    const projectName = 'project1';

    request(app)
     .delete(`/api/issues/${projectName}`)
     .send({})
     .expect(400)
     .expect((res) => {
       expect(res.text).toBe('_id error.');
     })
     .end((err, res) => {
       if(err){
         return done(err);
       }

       Issue.find({}).then((issues) => {
        expect(issues.length).toBe(2);
        done();
       }).catch((err) => done(err));
     });
  });

  it('should return error message if the issue id is an empty string', (done) => {
    const projectName = 'project1';
    const body = {
      _id: ' '
    };

    request(app)
      .delete(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('_id error.');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.find({}).then((issues) => {
          expect(issues.length).toBe(2);
          done();
         }).catch((err) => done(err));
      });
  });

  it('should return error message if the provided issue id is invalid', (done) => {
    const projectName = 'project1';
    const body = {
      _id: '123'
    };

    request(app)
      .delete(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('_id error.');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.find({}).then((issues) => {
          expect(issues.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return error message if project with given name doesn\'t exist', (done) => {
    const projectName = 'project3';
    const body = {
      _id: issues[1]._id
    };

    request(app)
      .delete(`/api/issues/${projectName}`)
      .send(body)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe(`could not delete ${body._id}`);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Issue.find({}).then((issues) => {
          expect(issues.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return error message if provided id doesn\'t belong to any issue', (done) => {
    const projectName = 'project2';
    const body = {
      _id: new ObjectID()
    };

    request(app)
      .delete(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`could not delete ${body._id}`);
      })
      .end(done);
  });
});

describe('GET /api/issues/:projectname', () => {
  it('should get all the issues of a specific project', (done) => {
    const projectName = 'project1';
    const expectedResponse = {
      issue_title: 'issueTitle1',
      issue_text: 'issueText1',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1',
      assigned_to: 'assignedTo1',
      open: true,
      status_text: 'statusText1',
      _id: issues[0]._id.toString()
};

    request(app)
     .get(`/api/issues/${projectName}`)
     .expect(200)
     .expect((res) => {
      expect(res.body[0]).toEqual(expectedResponse);
     })
     .end(done);
  });
});