const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('Apuesta una cantidad de dinero.')
        .addIntegerOption(option => 
            option.setName('cantidad')
                .setDescription('La cantidad de dinero a apostar.')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('cantidad');

        if (amount <= 0) {
            return interaction.reply('La cantidad debe ser mayor que cero.');
        }

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

            if (user.balance < amount) {
                return interaction.reply('No tienes suficiente dinero para apostar.');
            }

            const winChance = 0.5;
            if (Math.random() < winChance) {
                user.balance += amount;
                await interaction.reply(`Has ganado ${amount} créditos!`);
            } else {
                user.balance -= amount;
                await interaction.reply(`Has perdido ${amount} créditos.`);
            }

            await user.save();
        } catch (error) {
            console.error('Error en el comando bet:', error);
            await interaction.reply('Hubo un error al realizar la apuesta.');
        }
    },
};
