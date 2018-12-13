const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const { app } = require('../server');
const { Project } = require('../models/project');
const { Issue } = require('../models/issue');
const { populateProjectCollection, populateIssueCollection, issues } = require('./database/populateDatabase');

const expectValues = (dbIssue, issue) => {
  const date = moment().format('ddd MMM DD YYYY HH:mm');
  expect(dbIssue.issue_title).toBe(issue.issue_title);
  expect(dbIssue.issue_text).toBe(issue.issue_text);
  expect(dbIssue.created_on).toBe(date);
  expect(dbIssue.updated_on).toBe(date);
  expect(dbIssue.created_by).toBe(issue.created_by);
  expect(dbIssue.assigned_to).toBe(issue.assigned_to);
  expect(dbIssue.open).toBe(issue.open);
  expect(dbIssue.status_text).toBe(issue.status_text);
  expect(dbIssue._id.toString()).toBe(issue._id);
};

beforeEach(populateProjectCollection);
beforeEach(populateIssueCollection);

describe('POST /api/issues/:projectname', () => {
  it('should create a new issue for the given project', (done) => {
    const date = moment().format('ddd MMM DD YYYY HH:mm');
    const projectName = 'project3';
    const body = {
      issue_title: 'issueTitle3',
      issue_text: 'issueText3',
      created_by: 'createdBy3',
      assigned_to: 'assignedTo3',
      status_text: 'statusText3'
    };

    request(app)
      .post(`/api/issues/${projectName}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.issue_title).toBe(body.issue_title);
        expect(res.body.issue_text).toBe(body.issue_text);
        expect(res.body.created_by).toBe(body.created_by);
        expect(res.body.assigned_to).toBe(body.assigned_to);
        expect(res.body.status_text).toBe(body.status_text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Project.findOne({ name: projectName }).then((project) => {
          expect(project.name).toBe(projectName);
          return Issue.findOne({ project: projectName });
        }).then((issue) => {
          expect(issue.issue_title).toEqual(body.issue_title);
          expect(issue.issue_text).toBe(body.issue_text);
          expect(issue.created_on).toBe(date);
          expect(issue.updated_on).toBe(date);
          expect(issue.created_by).toBe(body.created_by);
          expect(issue.assigned_to).toBe(body.assigned_to);
          expect(issue.open).toBeTruthy();
          expect(issue.status_text).toBe(body.status_text);
          done();
        }).catch(error => done(error));
      });
  });

  it('should create a new issue for the given project without using assigned_to and status_text properties', (done) => {
    const date = moment().format('ddd MMM DD YYYY HH:mm');
    const projectName = 'project3';
    const body = {
      issue_title: 'issueTitle3',
      issue_text: 'issueText3',
      created_by: 'createdBy3'
    };

    request(app)
      .post(`/api/issues/${projectName}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.issue_title).toBe(body.issue_title);
        expect(res.body.issue_text).toBe(body.issue_text);
        expect(res.body.created_by).toBe(body.created_by);
        expect(res.body.assigned_to).toBe('');
        expect(res.body.status_text).toBe('');
        expect(res.body.created_on).toBe(date);
        expect(res.body.updated_on).toBe(date);
        expect(res.body.open).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Project.findOne({ name: projectName }).then((project) => {
          expect(project.name).toBe(projectName);
          return Issue.findOne({ project: projectName });
        }).then((issue) => {
          expect(issue.issue_title).toEqual(body.issue_title);
          expect(issue.issue_text).toBe(body.issue_text);
          expect(issue.created_on).toBe(date);
          expect(issue.updated_on).toBe(date);
          expect(issue.created_by).toBe(body.created_by);
          expect(issue.assigned_to).toBe('');
          expect(issue.open).toBeTruthy();
          expect(issue.status_text).toBe('');
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error message if issue_title not provided', (done) => {
    const projectName = 'project3';
    const body = {
      issue_text: 'issueText3',
      created_by: 'createdBy3',
      assigned_to: 'assignedTo3',
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
        if (err) {
          return done(err);
        }

        return Project.findOne({ name: projectName }).then((project) => {
          expect(project).toBeFalsy();
          return Issue.findOne({ project: projectName });
        }).then((issue) => {
          expect(issue).toBeFalsy();
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error message if issue_text not provided', (done) => {
    const projectName = 'project3';
    const body = {
      issue_title: 'issueTitle3',
      created_by: 'createdBy3',
      assigned_to: 'assignedTo3',
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
        if (err) {
          return done(err);
        }

        return Project.findOne({ name: projectName }).then((project) => {
          expect(project).toBeFalsy();
          return Issue.findOne({ project: projectName });
        }).then((issue) => {
          expect(issue).toBeFalsy();
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error message if created_by not provided', (done) => {
    const projectName = 'project3';
    const body = {
      issue_title: 'issueTitle3',
      issue_text: 'issueText3',
      assigned_to: 'assignedTo3',
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
        if (err) {
          return done(err);
        }

        return Project.findOne({ name: projectName }).then((project) => {
          expect(project).toBeFalsy();
          return Issue.findOne({ project: projectName });
        }).then((issue) => {
          expect(issue).toBeFalsy();
          done();
        }).catch(error => done(error));
      });
  });
});

describe('PUT /api/issues/:projectname', () => {
  it('should successfully update the issue properties', (done) => {
    const projectName = 'project1';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited',
      created_on: 'createdOn-edited',
      assigned_to: 'assignedTo-edited',
      open: false,
      status_text: 'statusText-edited',
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
        if (err) {
          return done(err);
        }

        return Issue.findOne({ _id: issues[0]._id }).then((issue) => {
          const currentDate = moment().format('ddd MMM DD YYYY HH:mm');

          expect(issue.issue_title).toBe(body.issue_title);
          expect(issue.issue_text).toBe(body.issue_text);
          expect(issue.created_by).toBe(body.created_by);
          expect(issue.created_on).toBe(body.created_on);
          expect(issue.updated_on).toBe(currentDate);
          expect(issue.assigned_to).toBe(body.assigned_to);
          expect(issue.open).toBe(body.open);
          expect(issue.status_text).toBe(body.status_text);
          expect(issue._id).toEqual(body._id);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if no id property provided', (done) => {
    const projectName = 'project1';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited'
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_title: 'issueTitle-edited' })
          .then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch(error => done(error));
      });
  });

  it('should return error message if the provided id is an empty string', (done) => {
    const projectName = 'project1';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited',
      _id: ' '
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_title: 'issueTitle-edited' })
          .then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch(error => done(error));
      });
  });

  it('should return error message if the provided id is not valid', (done) => {
    const projectName = 'project1';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited',
      _id: '123'
    };

    request(app)
      .put(`/api/issues/${projectName}`)
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('could not update');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_title: 'issueTitle-edited' })
          .then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch(error => done(error));
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
        if (err) {
          return done(err);
        }

        return Issue.findOne({ _id: issues[0]._id }).then((issue) => {
          expect(issue.issue_title).toBe(issues[0].issue_title);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if non-existing project is passed', (done) => {
    const projectName = 'project3';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited',
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
        if (err) {
          return done(err);
        }

        return Issue.findOne({ _id: issues[0]._id }).then((issue) => {
          expect(issue.issue_title).toBe(issues[0].issue_title);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return error message if issue with given id doesn\'t exist', (done) => {
    const projectName = 'project1';
    const body = {
      issue_title: 'issueTitle-edited',
      issue_text: 'issueText-edited',
      created_by: 'createdBy-edited',
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
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_title: 'issueTitle-edited' })
          .then((issue) => {
            expect(issue).toBeFalsy();
            done();
          }).catch(error => done(error));
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
        if (err) {
          return done(err);
        }

        return Issue.find({}).then((dbIssues) => {
          expect(dbIssues.length).toBe(3);
          return Issue.findOne({ _id: body._id });
        }).then((issue) => {
          expect(issue).toBeFalsy();
          done();
        })
          .catch(error => done(err));
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
        if (err) {
          return done(err);
        }

        return Issue.find({}).then((dbIssues) => {
          expect(dbIssues.length).toBe(4);
          done();
        }).catch(error => done(error));
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
        if (err) {
          return done(err);
        }

        return Issue.find({}).then((dbIssues) => {
          expect(issues.length).toBe(4);
          done();
        }).catch(error => done(error));
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
        if (err) {
          return done(err);
        }

        return Issue.find({}).then((dbIssues) => {
          expect(dbIssues.length).toBe(4);
          done();
        }).catch(error => done(error));
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
        if (err) {
          return done(err);
        }

        return Issue.find({}).then((dbIssues) => {
          expect(dbIssues.length).toBe(4);
          done();
        }).catch(error => done(error));
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
    const expectedResponse = [
      {
        issue_title: 'issueTitle1',
        issue_text: 'issueText1',
        created_on: moment().format('ddd MMM DD YYYY HH:mm'),
        updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
        created_by: 'createdBy1',
        assigned_to: 'assignedTo1',
        open: true,
        status_text: 'statusText1',
        _id: issues[0]._id.toString()
      },
      {
        issue_title: 'issueTitle1.2',
        issue_text: 'issueText1.2',
        created_on: moment().format('ddd MMM DD YYYY HH:mm'),
        updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
        created_by: 'createdBy1.2',
        assigned_to: 'assignedTo1.2',
        open: true,
        status_text: 'statusText1.2',
        _id: issues[1]._id.toString()
      },
      {
        issue_title: 'issueTitle1.3',
        issue_text: 'issueText1.3',
        created_on: moment().format('ddd MMM DD YYYY HH:mm'),
        updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
        created_by: 'createdBy1.3',
        assigned_to: 'assignedTo1.3',
        open: true,
        status_text: 'statusText1.3',
        _id: issues[2]._id.toString()
      }
    ];

    request(app)
      .get(`/api/issues/${projectName}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(expectedResponse[0]);
        expect(res.body[1]).toEqual(expectedResponse[1]);
        expect(res.body[2]).toEqual(expectedResponse[2]);
      })
      .end((err, res) => {
        if (err) {
          return done();
        }

        return Issue.find({}).then((dbIssues) => {
          expect(dbIssues.length).toBe(4);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return one issue by querying the id property', (done) => {
    const projectName = 'project1';
    const _id = issues[0]._id.toString();
    const issue = {
      issue_title: 'issueTitle1',
      issue_text: 'issueText1',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1',
      assigned_to: 'assignedTo1',
      open: true,
      status_text: 'statusText1',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?_id=${_id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ _id }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return one issue by querying the issue_title property', (done) => {
    const projectName = 'project1';
    const issueTitle = issues[1].issue_title;
    const _id = issues[1]._id.toString();
    const issue = {
      issue_title: issueTitle,
      issue_text: 'issueText1.2',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1.2',
      assigned_to: 'assignedTo1.2',
      open: true,
      status_text: 'statusText1.2',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?issue_title=${issueTitle}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_title: issueTitle }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return one issue by querying the issue_text property', (done) => {
    const projectName = 'project1';
    const issueText = issues[2].issue_text;
    const _id = issues[2]._id.toString();
    const issue = {
      issue_title: 'issueTitle1.3',
      issue_text: issueText,
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1.3',
      assigned_to: 'assignedTo1.3',
      open: true,
      status_text: 'statusText1.3',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?issue_text=${issueText}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ issue_text: issueText }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return three issues by querying the created_on property', (done) => {
    const projectName = 'project1';
    const currentDate = moment().format('ddd MMM DD YYYY HH:mm');
    request(app)
      .get(`/api/issues/${projectName}?created_on=${currentDate}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(3);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.find({ created_on: currentDate }).then((dbIssues) => {
          expect(dbIssues.length).toBe(4);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return three issues by querying the updated_on property', (done) => {
    const projectName = 'project1';
    const currentDate = moment().format('ddd MMM DD YYYY HH:mm');
    request(app)
      .get(`/api/issues/${projectName}?updated_on=${currentDate}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(3);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.find({ updated_on: currentDate }).then((dbissues) => {
          expect(dbissues.length).toBe(4);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return one issue by querying the created_by property', (done) => {
    const projectName = 'project1';
    const createdBy = 'createdBy1';
    const _id = issues[0]._id.toString();

    const issue = {
      issue_title: 'issueTitle1',
      issue_text: 'issueText1',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1',
      assigned_to: 'assignedTo1',
      open: true,
      status_text: 'statusText1',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?created_by=${createdBy}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ created_by: createdBy }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(err));
      });
  });

  it('should return one issue by querying the assigned_to property', (done) => {
    const projectName = 'project1';
    const assignedTo = 'assignedTo1';
    const _id = issues[0]._id.toString();

    const issue = {
      issue_title: 'issueTitle1',
      issue_text: 'issueText1',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1',
      assigned_to: 'assignedTo1',
      open: true,
      status_text: 'statusText1',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?assigned_to=${assignedTo}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ assigned_to: assignedTo }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return three issues by querying the open property', (done) => {
    const projectName = 'project1';
    const open = true;

    request(app)
      .get(`/api/issues/${projectName}?open=${open}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(3);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.find({ open }).then((dbIssues) => {
          expect(dbIssues.length).toBe(3);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return one issue by querying the status_text property', (done) => {
    const projectName = 'project1';
    const statusText = 'statusText1';

    const _id = issues[0]._id.toString();

    const issue = {
      issue_title: 'issueTitle1',
      issue_text: 'issueText1',
      created_on: moment().format('ddd MMM DD YYYY HH:mm'),
      updated_on: moment().format('ddd MMM DD YYYY HH:mm'),
      created_by: 'createdBy1',
      assigned_to: 'assignedTo1',
      open: true,
      status_text: 'statusText1',
      _id
    };

    request(app)
      .get(`/api/issues/${projectName}?status_text=${statusText}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(issue);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Issue.findOne({ status_text: statusText }).then((dbIssue) => {
          expectValues(dbIssue, issue);
          done();
        }).catch(error => done(error));
      });
  });
});
