// routes/games.js
const router = require('express').Router()
const passport = require('../config/auth')
const { Game } = require('../models')
const utils = require('../lib/utils')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/games', (req, res, next) => {
      Game.find()
        // Newest games first
        .sort({ createdAt: -1 })
        // Send the data in JSON format
        .then((games) => res.json(games))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })
    .get('/games/:id', (req, res, next) => {
      const id = req.params.id

      Game.findById(id)
        .then((game) => {
          if (!game) { return next() }
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .post('/games', authenticate, (req, res, next) => {
      const newGame = {
        userId: req.account._id,
        players: [{
          userId: req.account._id
        }],
        fields: ['','','','','','','','','']
      }

      Game.create(newGame)
        .then((game) => {
          io.emit('action', {
            type: 'GAME_CREATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .put('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const body = req.body

      const updatedGame = {...body, fields: ['','','','','','','','',''], winner: '', draw: false, count: 0, }

      Game.findByIdAndUpdate(id, { $set: updatedGame }, { new: true })
        .then((game) => {
          io.emit('action', {
            type: 'GAME_UPDATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .patch('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const body = req.body
      const indexNumber = body.index
      const currentPlayer = body.userId

      Game.findById(id)
        .then((game) => {
          if (!game) { return next() }

          var fields = [...game.fields]


          var turn = game.turn;
          if(turn == 1){turn = 0}
          else {turn = 1}

          const count = game.count
          if (count % 2 === 0){fields[indexNumber] = 'O';}
          if (count % 2 === 1){fields[indexNumber] = 'X';}



          var winner = ''

          if( count >= 4){

            if( fields[0] === fields[1] && fields[1] === fields[2] && fields[2] !== ''){winner = currentPlayer}
            if( fields[3] === fields[4] && fields[4] === fields[5] && fields[5] !== ''){winner = currentPlayer}
            if( fields[6] === fields[7] && fields[7] === fields[8] && fields[8] !== ''){winner = currentPlayer}

            if( fields[0] === fields[3] && fields[3] === fields[6] && fields[6] !== ''){winner = currentPlayer}
            if( fields[1] === fields[4] && fields[4] === fields[7] && fields[7] !== ''){winner = currentPlayer}
            if( fields[2] === fields[5] && fields[5] === fields[8] && fields[8] !== ''){winner = currentPlayer}

            if( fields[0] === fields[4] && fields[4] === fields[8] && fields[8] !== ''){winner = currentPlayer}
            if( fields[2] === fields[4] && fields[4] === fields[6] && fields[6] !== ''){winner = currentPlayer}
          }

          draw = false

          if ( count === 8 && winner == '' ){ draw = true }

          const updatedGame = { ...game, fields: fields, turn: turn, winner: winner, draw: draw, count: count + 1  }

          Game.findByIdAndUpdate(id, { $set: updatedGame }, { new: true })
            .then((game) => {
              io.emit('action', {
                type: 'GAME_UPDATED',
                payload: game
              })
              res.json(game)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/games/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Game.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'GAME_REMOVED',
            payload: id
          })
          res.status = 200
          res.json({
            message: 'Removed',
            _id: id
          })
        })
        .catch((error) => next(error))
    })

  return router
}
