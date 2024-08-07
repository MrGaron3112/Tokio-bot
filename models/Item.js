const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    type: { 
        type: String, 
        enum: ['pickaxe', 'fishingRod', 'sword', 'gem'], 
        required: true 
    },
    level: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    }
});

module.exports = mongoose.model('Item', itemSchema);
