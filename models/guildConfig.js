const mongoose = require('mongoose');

const guildConfig = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  language: {
    type: String,
    required: true,
    default: 'en'
  }
});

const Guild = mongoose.model('Guild', guildConfig);

module.exports = Guild;
