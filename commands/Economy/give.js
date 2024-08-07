const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Da una cantidad de dinero a un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario al que se le dará el dinero.').setRequired(true))
        .addIntegerOption(option => option.setName('cantidad').setDescription('La cantidad de dinero a dar.').setRequired(true)),
    async execute(interaction) {
        // Verificar si el usuario es administrador
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        if (amount <= 0) {
            return interaction.reply('La cantidad debe ser mayor que cero.');
        }

        try {
            // Encontrar el usuario objetivo
            let user = await User.findOne({ discordId: targetUser.id });

            if (!user) {
                // Si el usuario no existe, lo creamos
                user = new User({
                    discordId: targetUser.id,
                    username: targetUser.username
                });
                await user.save();
            }

            // Actualizar el balance del usuario objetivo
            user.balance += amount;
            await user.save();

            await interaction.reply(`Se han añadido ${amount} créditos a ${targetUser.username}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al dar el dinero.');
        }
    },
};
