const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: String,
    username: String,
    avatarURL: String,
    feedback: String,
    week: Number,
    year: Number
});

module.exports = mongoose.model('Feedback', feedbackSchema);