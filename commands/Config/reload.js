const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, '../commands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recarga todos los comandos del bot.'),
    async execute(interaction) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        const commands = [];

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            commands.push(command.data.toJSON());
        }

        try {
            // Registra los nuevos comandos
            await interaction.client.application.commands.set(commands);
            await interaction.reply('Comandos recargados con éxito.');
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al recargar los comandos.');
        }
    },
};
