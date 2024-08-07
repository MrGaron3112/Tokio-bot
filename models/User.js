const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    lastFishTime: { type: Number, default: 0 }, // Añadido para el tiempo de espera
     lastMineTime: { type: Number, default: 0 }, // Tiempo de espera para minar
    lastRobTime: { type: Number, default: 0 },  // Tiempo de espera para robar
    inventory: {
        type: Map,
        of: Number,
        default: {
            gold: 0,
            silver: 0,
            copper: 0,
            trout: 0,
            salmon: 0,
            catfish: 0,
            gem_valuable: 0,
        },
    },
    tools: {
        pickaxe: { type: String, default: 'wooden' },
        fishingRod: { type: String, default: 'wooden' },
        sword: { type: String, default: 'wooden' },
},
  
    });

module.exports = mongoose.model('User', userSchema);
