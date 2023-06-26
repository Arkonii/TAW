const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Dodaj alias 'id' dla pola '_id'
messageSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Konwertuj '_id' na 'id' przy serializacji do JSON
messageSchema.set('toJSON', {
    virtuals: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;