const mongoose = require('mongoose');

const IssueSchema = mongoose.Schema({
  issue_title: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  issue_text: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  created_on: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updated_on: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.Mixed
  },
  open: {
    type: Boolean,
    required: true
  },
  status_text: {
    type: mongoose.Schema.Types.Mixed
  },
  project: {
    type: String,
    required: true
  }
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = { Issue };
