const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { getMessage } = require('../../utils/language');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu balance de créditos y banco.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            let user = await User.findOne({ discordId: interaction.user.id });
            if (!user) {
                user = new User({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                    balance: 0,
                    bank: 0
                });
                await user.save();
            }

const error = await getMessage(guildId, 'commands.economy.balance.error', { balance });


            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Balance`)
             .addFields(
                    { name: 'Cartera', value: `${user.balance} créditos`, inline: true },
                    { name: 'Banco', value: `${user.bank} créditos`, inline: true }
                )
                .setColor('#00FF00');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al mostrar el balance:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: error, ephemeral: true });
            } else {
                await interaction.reply({ content: error, ephemeral: true });
            }
        }
    },
};
