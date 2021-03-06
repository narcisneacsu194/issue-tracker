require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const moment = require('moment-timezone');
require('./db/mongoose');
const { Project } = require('./models/project');
const { Issue } = require('./models/issue');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(helmet.xssFilter());

app.post('/api/issues/:projectname', (req, res) => {
  const projectName = req.params.projectname;
  const { body } = req;

  if (!body.issue_title || !body.issue_text || !body.created_by) {
    return res.status(400).send('missing inputs');
  }

  return Project.findOne({ name: projectName }).then((project) => {
    if (!project) {
      const newProject = new Project({ name: projectName });
      return newProject.save();
    }

    return project;
  }).then((project) => {
    const currentDate = moment().format('ddd MMM DD YYYY HH:mm');

    const issue = new Issue({
      issue_title: body.issue_title,
      issue_text: body.issue_text,
      created_on: currentDate,
      updated_on: currentDate,
      created_by: body.created_by,
      assigned_to: body.assigned_to ? body.assigned_to : '',
      open: true,
      status_text: body.status_text ? body.status_text : '',
      project: project.name
    });

    return issue.save();
  }).then((issue) => {
    const stringId = issue._id.toString();
    const finalIssue = _.pick(issue, ['issue_title', 'issue_text', 'created_on',
      'updated_on', 'created_by', 'assigned_to', 'open', 'status_text']);
    finalIssue._id = stringId;

    return res.send(finalIssue);
  })
    .catch((err) => {
      res.status(400).send(`Something went wrong -> ${err}`);
    });
});

app.put('/api/issues/:projectname', (req, res) => {
  const projectName = req.params.projectname;
  const { body } = req;

  if (!body._id || body._id.trim().length === 0 || !ObjectID.isValid(body._id)) {
    return res.status(400).send('could not update');
  }

  if (Object.keys(body).length === 1) {
    return res.status(400).send('no updated field sent');
  }

  return Project.findOne({ name: projectName }).then((project) => {
    if (!project) {
      return res.status(404).send('could not update');
    }

    const currentDate = moment().format('ddd MMM DD YYYY HH:mm');
    body.updated_on = currentDate;

    return Issue.findOneAndUpdate({ _id: body._id }, {
      $set: body
    }, { new: true });
  }).then((issue) => {
    if (!issue) {
      return res.status(400).send('could not update');
    }

    if (!issue.issue_title) return;

    return res.send('successfully updated');
  }).catch(err => res.status(400).send(`Something went wrong -> ${err}`));
});

app.delete('/api/issues/:projectname', (req, res) => {
  const projectName = req.params.projectname;
  const { body } = req;

  if (!body._id || body._id.trim().length === 0 || !ObjectID.isValid(body._id)) {
    return res.status(400).send('_id error.');
  }

  Project.findOne({ name: projectName }).then((project) => {
    if (!project) {
      return res.status(404).send(`could not delete ${body._id}`);
    }

    return Issue.findOneAndRemove({ _id: body._id });
  }).then((issue) => {
    if (!issue) {
      return res.status(400).send(`could not delete ${body._id}`);
    }

    if (!issue.issue_title) return;

    return res.send(`deleted ${body._id}`);
  }).catch(err => res.status(400).send(`Something went wrong -> ${err}`));
});

app.get('/api/issues/:projectname', (req, res) => {
  const projectName = req.params.projectname;
  const params = req.query;
  params.project = projectName;
  Issue.find(params).then((issues) => {
    const newIssues = issues.map((issue) => { 
      return _.pick(issue, ['issue_title', 'issue_text', 'created_on',
        'updated_on', 'created_by', 'assigned_to', 'open', 'status_text', '_id']);
    });
    return res.send(newIssues);
  }).catch(err => res.status(400).send(`Something went wrong -> ${err}`));
});

app.listen(port, () => {
  console.log(`Server started up on port ${port}`);
});

module.exports = { app };
