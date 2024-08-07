const fs = require('fs').promises;
const path = require('path');
const Guild = require('../models/guildConfig');

async function getLanguage(guildId) {
  const langDoc = await Language.findOne({ guildId });
  return langDoc ? langDoc.language : 'en';
}

async function loadMessages(language) {
  const filePath = path.join(__dirname, `./idiom/messages_${language}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function getMessage(guildId, key, variables = {}) {
  const language = await getLanguage(guildId);
  const messages = await loadMessages(language);
  let message = messages[key];

  if (Object.keys(variables).length > 0) {
    for (const [variable, value] of Object.entries(variables)) {
      message = message.replace(`{${variable}}`, value);
    }
  }

  return message;
}

module.exports = {
  getMessage
};
