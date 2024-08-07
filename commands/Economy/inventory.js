const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Muestra tu inventario.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const user = await User.findOne({ discordId: interaction.user.id });
            if (!user) {
                return interaction.editReply('No se encontró tu perfil de usuario.');
            }

            const embed = new EmbedBuilder()
                .setTitle('Tu Inventario')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Espada', value: `**En inventario**: ${user.tools.sword}`, inline: true },
                    { name: 'Gemas', value: `**Gema Valiosa**: ${user.inventory.gem_valuable || 0}`, inline: true },
                     { name: 'Pico', value: `**En inventario**: ${user.tools.pickace}`, inline: true },
                    { name: 'Caña de pescar', value: `**En inventario**: ${user.tools.fishingRod}`, inline: true },
                    { name: 'Peces', value: `**Trucha**: ${user.inventory.get('trout') || 0}\n**Salmón**: ${user.inventory.get('salmon') || 0}\n**Bagre**: ${user.inventory.get('catfish') || 0}`, inline: true },
                    { name: 'Minerales', value: `**Oro**: ${user.inventory.get('gold') || 0}\n**Plata**: ${user.inventory.get('silver') || 0}\n**Cobre**: ${user.inventory.get('copper') || 0}`, inline: true }
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al mostrar el inventario:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al mostrar el inventario.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al mostrar el inventario.', ephemeral: true });
            }
        }
    },
};
