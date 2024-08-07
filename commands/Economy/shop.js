const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Item = require('../../models/Item');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra los productos de la tienda.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const items = await Item.find();
            if (!items.length) {
                return interaction.editReply('No hay productos en la tienda.');
            }

            const itemsPerPage = 5;
            const totalPages = Math.ceil(items.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = items.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle('Tienda')
                    .setDescription('Aquí están los productos disponibles:')
                    .setColor('#0099ff');

                pageItems.forEach(item => {
                    embed.addFields({ name: item.name, value: `${item.price} créditos`, inline: true });
                });

                embed.setFooter({ text: `Página ${page + 1} de ${totalPages}` });

                return embed;
            };

            const embed = generateEmbed(currentPage);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );

            const message = await interaction.editReply({ embeds: [embed], components: [row] });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: 'Solo la persona que usó el comando puede interactuar con estos botones.', ephemeral: true });
                }

                if (i.customId === 'previous' && currentPage > 0) {
                    currentPage--;
                } else if (i.customId === 'next' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                const newEmbed = generateEmbed(currentPage);

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === totalPages - 1)
                    );

                await i.update({ embeds: [newEmbed], components: [newRow] });
            });

            collector.on('end', async () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );

                await interaction.editReply({ components: [disabledRow] });
            });
        } catch (error) {
            console.error('Error al mostrar la tienda:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al mostrar la tienda.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al mostrar la tienda.', ephemeral: true });
            }
        }
    },
};
