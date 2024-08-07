const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');

// Definir los ítems posibles a vender
const SELLABLE_ITEMS = [
    'gold',
    'silver',
    'copper',
    'trout',
    'salmon',
    'catfish',
   'gem_valuable',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Vende un ítem de tu inventario.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('El ítem que deseas vender.')
                .setRequired(true)
                .addChoices(
                    ...SELLABLE_ITEMS.map(item => ({ name: formatItemName(item), value: item }))
                ))
        .addStringOption(option =>
            option.setName('cantidad')
                .setDescription('La cantidad de ítems a vender. Usa "all" para vender todos.')
                .setRequired(true)),
    async execute(interaction) {
        const itemName = interaction.options.getString('item');
        const amountInput = interaction.options.getString('cantidad');

        try {
            let user = await User.findOne({ discordId: interaction.user.id });

            if (!user) {
                return interaction.reply('No tienes una cuenta registrada. Por favor, crea una primero.');
            }

            // Validar si el ítem existe en el inventario del usuario
            if (!user.inventory.has(itemName)) {
                return interaction.reply('El ítem especificado no está en tu inventario.');
            }

            let amount;
            if (amountInput.toLowerCase() === 'all') {
                amount = user.inventory.get(itemName);
            } else {
                amount = parseInt(amountInput, 10);
                if (isNaN(amount) || amount <= 0) {
                    return interaction.reply('La cantidad debe ser un número mayor que cero o "all".');
                }
            }

            if (user.inventory.get(itemName) < amount) {
                return interaction.reply('No tienes suficiente cantidad de este ítem para vender.');
            }

            const itemPrice = getItemPrice(itemName); // Función para obtener el precio del ítem
            const totalSaleValue = amount * itemPrice;

            user.inventory.set(itemName, user.inventory.get(itemName) - amount);
            user.balance += totalSaleValue;
            await user.save();

            await interaction.reply(`Has vendido ${amount} ${formatItemName(itemName)}(s) por ${totalSaleValue} créditos.`);
        } catch (error) {
            console.error('Error en el comando sell:', error);
            await interaction.reply('Hubo un error al vender el ítem.');
        }
    },
};

// Función para obtener el precio del ítem (ajustar según sea necesario)
function getItemPrice(itemName) {
    const prices = {
        'gold': 500,
        'silver': 250,
        'copper': 10,
        'trout': 15,
        'salmon': 50,
        'catfish': 70,
        'gem_valuable': 2800,
    };
    return prices[itemName] || 0;
}

// Función para formatear el nombre del ítem
function formatItemName(itemName) {
    return itemName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
