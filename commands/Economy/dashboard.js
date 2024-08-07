const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Muestra tu balance e inventario, y permite navegar por la lista de miembros.'),
    async execute(interaction) {
        const usersPerPage = 5;

        try {
            const users = await User.find({}).sort({ balance: -1 });
            const totalPages = Math.ceil(users.length / usersPerPage);

            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * usersPerPage;
                const end = start + usersPerPage;
                const userSlice = users.slice(start, end);

                const leaderboard = userSlice.map((user, index) => {
                    return `${start + index + 1}. ${user.username}: ${user.balance} créditos`;
                }).join('\n');

                return new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Dashboard - Página ${page + 1} de ${totalPages}`)
                    .setDescription(leaderboard)
                    .setTimestamp()
                    .setFooter({ text: 'Sistema de Economía' });
            };

            const generateButtons = (page) => {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === totalPages - 1)
                    );
            };

            const message = await interaction.reply({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)],
                fetchReply: true
            });

            const filter = i => i.customId === 'prev' || i.customId === 'next';

            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'prev') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)]
                });
            });

            collector.on('end', collected => {
                interaction.editReply({ components: [] });
            });
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al mostrar el dashboard.');
        }
    },
};
