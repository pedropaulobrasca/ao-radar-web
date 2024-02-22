/* eslint-disable no-undef */
import { ChestsHandler } from '../handlers/ChestsHandler.js'
import { DungeonsHandler } from '../handlers/DungeonsHandler.js'
import { HarvestablesHandler } from '../handlers/HarvestablesHandler.js'
import { MobsHandler } from '../handlers/MobsHandler'
import { PlayersHandler } from '../handlers/PlayersHandler.js'

const playersHandler = new PlayersHandler()
const chestsHandler = new ChestsHandler()
const dungeonsHandler = new DungeonsHandler()
const harvestablesHandler = new HarvestablesHandler()
const mobsHandler = new MobsHandler()

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
  } else if (eventCode === 3) {
    const posX = Parameters[4]
    const posY = Parameters[5]
    playersHandler.updatePlayerPosition(id, posX, posY)
    mobsHandler.updateMistPosition(id, posX, posY)
    mobsHandler.updateMobPosition(id, posX, posY)
  } else if (eventCode === 27) {
    const ignoreList = JSON.parse(localStorage.getItem('ignoreList')) || []
    playersHandler.handleNewPlayerEvent(id, Parameters, ignoreList, false)
  } else if (eventCode === 36) {
    harvestablesHandler.newSimpleHarvestableObject(Parameters)
  } else if (eventCode === 37) {
    harvestablesHandler.newHarvestableObject(id, Parameters)
  } else if (eventCode === 58) {
    harvestablesHandler.harvestFinished(Parameters)
  } else if (eventCode === 44) {
    mobsHandler.updateEnchantEvent(Parameters)
  } else if (eventCode === 86) {
    playersHandler.updateItems(id, Parameters)
  } else if (eventCode === 118) {
    mobsHandler.NewMobEvent(Parameters)
  } else if (eventCode === 201) {
    playersHandler.handleMountedPlayerEvent(id, Parameters)
  } else if (eventCode === 309) {
    dungeonsHandler.dungeonEvent(Parameters)
  } else if (eventCode === 378) {
    chestsHandler.addChestEvent(Parameters)
  }
}

export function onRequest(Parameters) {
  // Player moving
  if (Parameters[253] === 21) {
    lpX = Parameters[1][0]
    lpY = Parameters[1][1]

    console.log('X: ' + lpX + ', Y: ' + lpY)
  }
}

export function onResponse(Parameters) {
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
