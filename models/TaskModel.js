const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    is_followup: {
      type: Boolean,
      default: false,
    },
    followup_result: {
      type: String,
    },
  },
  { versionKey: false }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
