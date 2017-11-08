// models/game.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const gameSchema = new Schema({
  fields: [{ type: Number, default: 0 }],
  players: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  turn: { type: Number, default: 0 }, // player index
  started: { type: Boolean, default: false },
  winnerId: { type: Schema.Types.ObjectId, ref: 'users' },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  draw: { type: Boolean, default: false },
}, { usePushEach: true })

module.exports = mongoose.model('games', gameSchema)
