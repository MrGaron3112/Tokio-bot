const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Pesca peces.'),
    async execute(interaction) {
        try {
            console.log('Iniciando comando fish');

            const user = await User.findOne({ discordId: interaction.user.id });

            if (!user) {
                console.log('Usuario no encontrado');
                await interaction.reply('No tienes una cuenta registrada. Por favor, crea una primero.');
                return;
            }

            // Verifica si han pasado 3 minutos desde la última pesca
            const now = Date.now();
            const cooldown = 3 * 60 * 1000; // 3 minutos en milisegundos
            const lastFishTime = user.lastFishTime || 0;

            if (now - lastFishTime < cooldown) {
                const timeRemaining = Math.ceil((cooldown - (now - lastFishTime)) / 1000);
                console.log(`Tiempo restante para pescar: ${timeRemaining} segundos`);
                await interaction.reply(`Debes esperar ${timeRemaining} segundos antes de pescar nuevamente.`);
                return;
            }

            // Actualiza la marca de tiempo de la última pesca
            user.lastFishTime = now;

            // Determina la probabilidad y la cantidad en función del nivel de la caña de pescar
            const fishingRodLevel = user.tools.fishingRod;
            let multiplier;
            switch (fishingRodLevel) {
                case 'wooden':
                    multiplier = 1;
                    break;
                case 'bamboo':
                    multiplier = 2;
                    break;
                case 'iron':
                    multiplier = 3;
                    break;
                case 'golden':
                    multiplier = 4;
                    break;
                default:
                    multiplier = 1;
            }

            // Genera una cantidad aleatoria de peces basada en el multiplicador
            const troutCaught = Math.floor(Math.random() * 3 * multiplier);
            const salmonCaught = Math.floor(Math.random() * 5 * multiplier);
            const catfishCaught = Math.floor(Math.random() * 10 * multiplier);

            // Verifica que los items en el inventario sean números
            if (typeof user.inventory.get('trout') !== 'number') user.inventory.set('trout', 0);
            if (typeof user.inventory.get('salmon') !== 'number') user.inventory.set('salmon', 0);
            if (typeof user.inventory.get('catfish') !== 'number') user.inventory.set('catfish', 0);

            user.inventory.set('trout', user.inventory.get('trout') + troutCaught);
            user.inventory.set('salmon', user.inventory.get('salmon') + salmonCaught);
            user.inventory.set('catfish', user.inventory.get('catfish') + catfishCaught);

            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('Resultados de la Pesca')
                .setDescription('Has pescado los siguientes peces:')
                .addFields(
                    { name: 'Trucha', value: troutCaught.toString(), inline: true },
                    { name: 'Salmón', value: salmonCaught.toString(), inline: true },
                    { name: 'Bagre', value: catfishCaught.toString(), inline: true }
                );

            console.log('Pesca realizada con éxito');
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al pescar:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp('Hubo un error al intentar pescar.');
            } else {
                await interaction.reply('Hubo un error al intentar pescar.');
            }
        }
    },
};
