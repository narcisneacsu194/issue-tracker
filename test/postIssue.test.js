const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { app } = require('../server');
const { Project } = require('../models/project');
const { Issue } = require('../models/issue');
const { populateProjectCollection, populateIssueCollection } = require('./database/populateDatabase');

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
