const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const connectDB = require('./db')
const path = require('path');
const { token } = require('./config.json');

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
 GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
 GatewayIntentBits.MessageContent,
 ] });
 
client.commands = new Collection();

// conectar a mongodb
connectDB();

// Handlers
const handlers = ['commandHandler', 'eventHandler'];
handlers.forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.login(token);