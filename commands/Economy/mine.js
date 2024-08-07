const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('Mina minerales.'),
    async execute(interaction) {
        try {
            const user = await User.findOne({ discordId: interaction.user.id });

            if (!user) {
                return interaction.reply('No tienes una cuenta registrada. Por favor, crea una primero.');
            }

            // Verifica si han pasado 3 minutos desde la última minería
            const now = Date.now();
            const cooldown = 3 * 60 * 1000; // 3 minutos en milisegundos
            const lastMineTime = user.lastMineTime || 0;

            if (now - lastMineTime < cooldown) {
                const timeRemaining = Math.ceil((cooldown - (now - lastMineTime)) / 1000);
                return interaction.reply(`Debes esperar ${timeRemaining} segundos antes de minar nuevamente.`);
            }

            // Actualiza la marca de tiempo de la última minería
            user.lastMineTime = now;

            // Determina la probabilidad y la cantidad en función del nivel del pico
            const pickaxeLevel = user.tools.pickaxe;
            let multiplier;
            switch (pickaxeLevel) {
                case 'wooden':
                    multiplier = 1;
                    break;
                case 'stone':
                    multiplier = 2;
                    break;
                case 'iron':
                    multiplier = 3;
                    break;
                case 'diamond':
                    multiplier = 4;
                    break;
                default:
                    multiplier = 1;
            }

            // Genera una cantidad aleatoria de minerales basada en el multiplicador
            const goldMined = Math.floor(Math.random() * 3 * multiplier);
            const silverMined = Math.floor(Math.random() * 5 * multiplier);
            const copperMined = Math.floor(Math.random() * 10 * multiplier);

            user.inventory.set('gold', user.inventory.get('gold') + goldMined);
            user.inventory.set('silver', user.inventory.get('silver') + silverMined);
            user.inventory.set('copper', user.inventory.get('copper') + copperMined);

            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('Resultados de la Minería')
                .setDescription('Has minado los siguientes minerales:')
                .addFields(
                    { name: 'Oro', value: goldMined.toString(), inline: true },
                    { name: 'Plata', value: silverMined.toString(), inline: true },
                    { name: 'Cobre', value: copperMined.toString(), inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al minar:', error);
            await interaction.reply('Hubo un error al intentar minar.');
        }
    },
};
