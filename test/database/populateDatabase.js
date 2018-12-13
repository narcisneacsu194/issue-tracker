const { ObjectID } = require('mongodb');
const moment = require('moment-timezone');
const { Project } = require('../../models/project');
const { Issue } = require('../../models/issue');

const projects = [
  {
    _id: new ObjectID(),
    name: 'project1'
  },
  {
    _id: new ObjectID(),
    name: 'project2'
  }
];

const date = moment().format('ddd MMM DD YYYY HH:mm');

let issues = [
  {
    _id: new ObjectID(),
    issue_title: 'issueTitle1',
    issue_text: 'issueText1',
    created_on: date,
    updated_on: date,
    created_by: 'createdBy1',
    assigned_to: 'assignedTo1',
    open: true,
    status_text: 'statusText1',
    project: 'project1'
  },
  {
    _id: new ObjectID(),
    issue_title: 'issueTitle1.2',
    issue_text: 'issueText1.2',
    created_on: date,
    updated_on: date,
    created_by: 'createdBy1.2',
    assigned_to: 'assignedTo1.2',
    open: true,
    status_text: 'statusText1.2',
    project: 'project1'
  },
  {
    _id: new ObjectID(),
    issue_title: 'issueTitle1.3',
    issue_text: 'issueText1.3',
    created_on: date,
    updated_on: date,
    created_by: 'createdBy1.3',
    assigned_to: 'assignedTo1.3',
    open: true,
    status_text: 'statusText1.3',
    project: 'project1'
  },
  {
    _id: new ObjectID(),
    issue_title: 'issueTitle2',
    issue_text: 'issueText2',
    created_on: date,
    updated_on: date,
    created_by: 'createdBy2',
    assigned_to: 'assignedTo2',
    open: false,
    status_text: 'statusText2',
    project: 'project2'
  }
];

const populateProjectCollection = (done) => {
  Project.deleteMany({}).then(() => {
    Project.insertMany(projects).then(() => done());
  });
};

const populateIssueCollection = (done) => {
  Issue.deleteMany({}).then(() => {
    Issue.insertMany(issues).then(() => done());
  });
};

module.exports = { populateProjectCollection, populateIssueCollection, projects, issues};
