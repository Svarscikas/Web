const mongoose = require('mongoose');

// Coin Schema
let coinSchema = mongoose.Schema({
    name:{ type: String, required: true },
    denomination:{ type: String, required: true },
    mint:{ type: String, required: true },
    price:{ type: Number, required: true }, 
    country:{ type: String, required: true },
    description:{ type: String, required: true }, 
    coverImage: { type: Buffer, required: true },
    coverImageType: { type: String, required: true },
    userID: { type: String, required: true}
});

coinSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})
  
  module.exports = mongoose.model('Coin', coinSchema)