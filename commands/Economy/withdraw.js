const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Retira dinero de tu banco.')
        .addStringOption(option => 
            option.setName('cantidad')
                .setDescription('La cantidad de dinero a retirar. Usa "all" para retirar todo.')
                .setRequired(true)),
    async execute(interaction) {
        const amountInput = interaction.options.getString('cantidad');

        try {
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

            let amount;
            if (amountInput.toLowerCase() === 'all') {
                amount = user.bank;
            } else {
                amount = parseInt(amountInput, 10);
                if (isNaN(amount) || amount <= 0) {
                    return interaction.reply('La cantidad debe ser un número mayor que cero o "all".');
                }
            }

            if (user.bank < amount) {
                return interaction.reply('No tienes suficiente dinero en tu banco para retirar.');
            }

            user.bank -= amount;
            user.balance += amount;
            await user.save();

            await interaction.reply(`Has retirado ${amount} créditos de tu banco.`);
        } catch (error) {
            console.error('Error en el comando withdraw:', error);
            await interaction.reply('Hubo un error al realizar el retiro.');
        }
    },
};
