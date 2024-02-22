import { ChestsHandler } from '../handlers/ChestsHandler.js'
import { DungeonsHandler } from '../handlers/DungeonsHandler.js'
import { HarvestablesHandler } from '../handlers/HarvestablesHandler.js'
import { MobsHandler } from '../handlers/MobsHandler'
import { PlayersHandler } from '../handlers/PlayersHandler.js'
import { Settings } from './Settings.js'

const playersHandler = new PlayersHandler()
const chestsHandler = new ChestsHandler()
const dungeonsHandler = new DungeonsHandler(Settings)
const harvestablesHandler = new HarvestablesHandler(Settings)
const mobsHandler = new MobsHandler(Settings)

/* eslint-disable @typescript-eslint/no-unused-vars */
const socket = new WebSocket('ws://localhost:5002')

socket.addEventListener('open', (event) => {
  console.log('Connected to the WebSocket server.')
})

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)

  // Extract the string and dictionary from the object
  const extractedString = data.code

  const extractedDictionary = JSON.parse(data.dictionary)

  switch (extractedString) {
    case 'request':
      onRequest(extractedDictionary.parameters)
      break

    case 'event':
      onEvent(extractedDictionary.parameters)
      break

    case 'response':
      onResponse(extractedDictionary.parameters)
      break
  }
})

export function onEvent(Parameters) {
  const id = parseInt(Parameters[0])
  const eventCode = Parameters[252]

  if (eventCode === 1) {
    playersHandler.removePlayer(id)
    mobsHandler.removeMist(id)
    mobsHandler.removeMob(id)
    dungeonsHandler.RemoveDungeon(id)
    chestsHandler.removeChest(id)
  }

  if (eventCode === 3) {
    const posX = Parameters[4]
    const posY = Parameters[5]
    playersHandler.updatePlayerPosition(id, posX, posY)
    mobsHandler.updateMistPosition(id, posX, posY)
    mobsHandler.updateMobPosition(id, posX, posY)

    if (playersHandler.playersInRange.length > 0) {
      for (let i = 0; i < playersHandler.playersInRange.length; i++) {
        const player = playersHandler.playersInRange[i]
        console.log('Player in range: ' + player.nickname)
      }
    }
  }

  if (eventCode === 27) {
    const ignoreList = JSON.parse(localStorage.getItem('ignoreList')) || []
    playersHandler.handleNewPlayerEvent(id, Parameters, ignoreList, false)
  }

  if (eventCode === 36) {
    harvestablesHandler.newSimpleHarvestableObject(Parameters)
  }

  if (eventCode === 37) {
    harvestablesHandler.newHarvestableObject(id, Parameters)
  }

  if (eventCode === 58) {
    harvestablesHandler.harvestFinished(Parameters)
  }

  if (eventCode === 44) {
    mobsHandler.updateEnchantEvent(Parameters)
  }

  if (eventCode === 86) {
    playersHandler.updateItems(id, Parameters)
  }

  if (eventCode === 118) {
    mobsHandler.NewMobEvent(Parameters)
  }

  if (eventCode === 201) {
    playersHandler.handleMountedPlayerEvent(id, Parameters)
  }

  if (eventCode === 309) {
    dungeonsHandler.dungeonEvent(Parameters)
  }

  if (eventCode === 378) {
    chestsHandler.addChestEvent(Parameters)
  }
}

export function onRequest(Parameters) {
  let lpX // Declare the variable lpX
  let lpY // Declare the variable lpY
  // Player moving
  if (Parameters[253] === 21) {
    lpX = Parameters[1][0]
    lpY = Parameters[1][1]

    // console.log('X: ' + lpX + ', Y: ' + lpY) // Meu personagem
  }
}

export function onResponse(Parameters) {
  let lpX // Declare the variable lpX
  let lpY // Declare the variable lpY
  let map
  // Player join new map
  if (Parameters[253] === 35) {
    map.id = Parameters[0]
  }
  // All data on the player joining the map (us)
  else if (Parameters[253] === 2) {
    lpX = Parameters[9][0]
    lpY = Parameters[9][1]
  }
}
