const mongoose = require('mongoose');
const Item = require('../models/Item'); // Ajusta la ruta según tu estructura de archivos
const { mongoURI } = require('../config.json');

async function addItems() {
    try {
        // Asegúrate de que Mongoose está conectado
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        const items = [
            { name: 'Wooden Pickaxe', type: 'pickaxe', level: 'wooden', price: 500 },
            { name: 'Stone Pickaxe', type: 'pickaxe', level: 'stone', price: 4000 },
            { name: 'Iron Pickaxe', type: 'pickaxe', level: 'iron', price: 12000 },
            { name: 'Diamond Pickaxe', type: 'pickaxe', level: 'diamond', price: 1000000 },
            { name: 'Wooden Fishing Rod', type: 'fishingRod', level: 'wooden', price: 500 },
            { name: 'Bamboo Fishing Rod', type: 'fishingRod', level: 'bamboo', price: 4000 },
            { name: 'Iron Fishing Rod', type: 'fishingRod', level: 'iron', price: 10000 },
            { name: 'Golden Fishing Rod', type: 'fishingRod', level: 'golden', price: 1000000 },
            { name: 'Wooden Sword', type: 'sword', level: 'wooden', price: 500 },
            { name: 'Stone Sword', type: 'sword', level: 'stone', price: 2500 },
            { name: 'Iron Sword', type: 'sword', level: 'iron', price: 5000 },
            { name: 'Diamond Sword', type: 'sword', level: 'diamond', price: 9500 },
            { name: 'Valuable Gem', type: 'gem', level: 'rare', price: 3000 } // Añadida la gema
        ];

        // Insertar ítems en la base de datos
        await Item.insertMany(items);
        console.log('Ítems añadidos con éxito');
    } catch (error) {
        console.error('Error al añadir ítems:', error);
    } finally {
        // No cierres la conexión aquí para mantener la conexión del bot abierta
    }
}

addItems();
