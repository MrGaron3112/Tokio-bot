const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Lucha contra otro jugador.')
        .addUserOption(option => 
            option.setName('opponent')
                .setDescription('El jugador contra el que quieres luchar.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const opponentId = interaction.options.getUser('opponent').id;
            const user = await User.findOne({ discordId: interaction.user.id });
            const opponent = await User.findOne({ discordId: opponentId });

            if (!user || !opponent) {
                return interaction.reply('No se encontró uno de los jugadores.');
            }

            if (!user.inventory.has('gem') || user.inventory.get('gem') < 1) {
                return interaction.reply('Necesitas al menos una gema valiosa para luchar.');
            }

            // Deduct a gem from the user's inventory
            user.inventory.set('gem', user.inventory.get('gem') - 1);
            await user.save();

            // Battle logic here (you can customize this part)
            const winner = Math.random() < 0.5 ? user : opponent;

            // Add the second gem to the winner
            if (winner === user) {
                user.inventory.set('gem', (user.inventory.get('gem') || 0) + 1);
                await user.save();
            } else {
                opponent.inventory.set('gem', (opponent.inventory.get('gem') || 0) + 1);
                await opponent.save();
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Resultado de la Batalla')
                .setDescription(`${winner.username} ha ganado la batalla.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al ejecutar el comando de batalla:', error);
            if (interaction.replied) {
                await interaction.followUp({ content: 'Hubo un error al ejecutar el comando de batalla.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al ejecutar el comando de batalla.', ephemeral: true });
            }
        }
    },
};
