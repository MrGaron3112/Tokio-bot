const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Reclama tu recompensa diaria.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            let user = await User.findOne({ discordId: interaction.user.id });
            if (!user) {
                user = new User({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                });
                await user.save();
            }

            const now = new Date();
            const rewardInterval = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

            if (user.lastDailyClaim && now - new Date(user.lastDailyClaim) < rewardInterval) {
                return interaction.editReply('Ya has reclamado tu recompensa diaria. Por favor, intenta de nuevo más tarde.');
            }

            // Definir la recompensa diaria
            const rewardAmount = 200; // Por ejemplo, 1000 créditos
            user.balance += rewardAmount;
            user.lastDailyClaim = now; // Actualizar la última reclamación

            await user.save();

            const embed = new EmbedBuilder()
                .setTitle('Recompensa Diaria')
                .setDescription(`Has reclamado tu recompensa diaria de ${rewardAmount} créditos.`)
                .setColor('#00FF00');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al reclamar la recompensa diaria:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al reclamar la recompensa diaria.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al reclamar la recompensa diaria.', ephemeral: true });
            }
        }
    },
};
