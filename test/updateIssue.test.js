const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const { app } = require('../server');
const { Issue } = require('../models/issue');
const { populateProjectCollection, populateIssueCollection, issues } = require('./database/populateDatabase');

beforeEach(populateProjectCollection);
beforeEach(populateIssueCollection);

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
