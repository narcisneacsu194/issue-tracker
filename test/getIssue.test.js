const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { app } = require('../server');
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
