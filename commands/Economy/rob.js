const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Roba dinero a otro usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que deseas robar.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            if (targetUser.id === interaction.user.id) {
                return interaction.reply('No puedes robarte a ti mismo.');
            }

            const user = await User.findOne({ discordId: interaction.user.id });
            const target = await User.findOne({ discordId: targetUser.id });

            if (!user || !target) {
                return interaction.reply('Uno de los usuarios no tiene una cuenta registrada.');
            }

            // Verifica si han pasado 3 minutos desde el último robo
            const now = Date.now();
            const cooldown = 3 * 60 * 1000; // 3 minutos en milisegundos
            const lastRobTime = user.lastRobTime || 0;

            if (now - lastRobTime < cooldown) {
                const timeRemaining = Math.ceil((cooldown - (now - lastRobTime)) / 1000);
                return interaction.reply(`Debes esperar ${timeRemaining} segundos antes de intentar robar nuevamente.`);
            }

            // Actualiza la marca de tiempo del último robo
            user.lastRobTime = now;

            // Lógica para robar dinero (esto puede variar según tu implementación)
            const stolenAmount = Math.floor(Math.random() * 1000); // Ejemplo de cantidad robada
            const targetBalance = target.balance;
            if (stolenAmount > targetBalance) {
                stolenAmount = targetBalance; // No puedes robar más de lo que tiene el objetivo
            }

            user.balance += stolenAmount;
            target.balance -= stolenAmount;

            await user.save();
            await target.save();

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Robo Exitoso')
                .setDescription(`Has robado ${stolenAmount} créditos a ${targetUser.username}.`)
                .addFields(
                    { name: 'Tu Balance', value: user.balance.toString(), inline: true },
                    { name: 'Balance del Objetivo', value: target.balance.toString(), inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al robar:', error);
            await interaction.reply('Hubo un error al intentar robar.');
        }
    },
};
