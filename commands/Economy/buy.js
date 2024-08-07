const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Item = require('../../models/Item');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la tienda.')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('El nombre del artículo que deseas comprar.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const itemName = interaction.options.getString('item').toLowerCase();
            const item = await Item.findOne({ name: new RegExp(`^${itemName}$`, 'i') });

            if (!item) {
                return interaction.editReply('Ese artículo no está disponible en la tienda.');
            }

            let user = await User.findOne({ discordId: interaction.user.id });
            if (!user) {
                user = new User({
                    discordId: interaction.user.id,
                    username: interaction.user.username,
                });
                await user.save();
            }

            if (user.balance < item.price) {
                return interaction.editReply('No tienes suficientes créditos para comprar este artículo.');
            }

            user.balance -= item.price;

            // Manejar la lógica de compra de herramientas y espadas
            const itemTypes = ['pickaxe', 'fishingRod', 'sword', 'gem'];
            if (itemTypes.includes(item.type)) {
                if (item.type === 'sword') {
                    const swordHierarchy = {
                        wooden: 1,
                        stone: 2,
                        iron: 3,
                        diamond: 4,
                    };

                    const currentSwordLevel = user.inventory.get(`sword_${item.level}`) || 0;

                    if (swordHierarchy[item.level] > currentSwordLevel) {
                        user.inventory.set(`sword_${item.level}`, (user.inventory.get(`sword_${item.level}`) || 0) + 1);
                    } else {
                        return interaction.editReply('Ya tienes una espada de nivel igual o superior.');
                    }
                } else if (item.type === 'gem') {
                    user.inventory.set('gem', (user.inventory.get('gem') || 0) + 1);
                } else {
                    // Manejar la compra de herramientas
                    const toolTypes = ['pickaxe', 'fishingRod'];
                    if (toolTypes.includes(item.type)) {
                        const currentToolLevel = user.tools[item.type];
                        const newToolLevel = item.level;

                        const toolHierarchy = {
                            wooden: 1,
                            bamboo: 2,
                            stone: 2,
                            iron: 3,
                            golden: 4,
                            diamond: 4,
                        };

                        if (toolHierarchy[newToolLevel] > toolHierarchy[currentToolLevel]) {
                            user.tools[item.type] = newToolLevel;
                        } else {
                            return interaction.editReply('Ya tienes una herramienta de nivel igual o superior.');
                        }
                    }
                }
            }

            await user.save();

            const embed = new EmbedBuilder()
                .setTitle('Compra Exitosa')
                .setDescription(`Has comprado **${item.name}** por ${item.price} créditos.`)
                .setColor('#00FF00');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al comprar el artículo:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al comprar el artículo.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al comprar el artículo.', ephemeral: true });
            }
        }
    },
};
