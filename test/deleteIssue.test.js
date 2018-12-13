const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Issue } = require('../models/issue');
const { populateProjectCollection, populateIssueCollection, issues } = require('./database/populateDatabase');

beforeEach(populateProjectCollection);
beforeEach(populateIssueCollection);

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
