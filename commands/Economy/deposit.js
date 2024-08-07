const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposita dinero en tu banco.')
        .addStringOption(option => 
            option.setName('cantidad')
                .setDescription('La cantidad de dinero a depositar. Usa "all" para depositar todo.')
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
                amount = user.balance;
            } else {
                amount = parseInt(amountInput, 10);
                if (isNaN(amount) || amount <= 0) {
                    return interaction.reply('La cantidad debe ser un número mayor que cero o "all".');
                }
            }

            if (user.balance < amount) {
                return interaction.reply('No tienes suficiente dinero para depositar.');
            }

            user.balance -= amount;
            user.bank += amount;
            await user.save();

            await interaction.reply(`Has depositado ${amount} créditos en tu banco.`);
        } catch (error) {
            console.error('Error en el comando deposit:', error);
            await interaction.reply('Hubo un error al realizar el depósito.');
        }
    },
};
