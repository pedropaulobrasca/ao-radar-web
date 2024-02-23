/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChestsHandler } from '../api/websocket/handlers/ChestsHandler.js'
import { DungeonsHandler } from '../api/websocket/handlers/DungeonsHandler.js'
import { HarvestablesHandler } from '../api/websocket/handlers/HarvestablesHandler.js'
import { ItemsInfo } from '../api/websocket/handlers/ItemsInfo.js'
import { MapH } from '../api/websocket/handlers/Map.js'
import { MobsHandler } from '../api/websocket/handlers/MobsHandler.js'
import { MobsInfo } from '../api/websocket/handlers/MobsInfo.js'
import { PlayersHandler } from '../api/websocket/handlers/PlayersHandler.js'
import { ChestsDrawing } from '../components/drawings/ChestsDrawing.js'
import { DungeonsDrawing } from '../components/drawings/DungeonsDrawing.js'
import { HarvestablesDrawing } from '../components/drawings/HarvestablesDrawing.js'
import { MapDrawing } from '../components/drawings/MapsDrawing.js'
import { MobsDrawing } from '../components/drawings/MobsDrawing.js'
import { PlayersDrawing } from '../components/drawings/PlayersDrawing.js'
import { DrawingUtils } from './drawing-utils.js'
import { Settings } from './settings.js'

const settings = new Settings()

const playersHandler = new PlayersHandler()
const chestsHandler = new ChestsHandler()
const dungeonsHandler = new DungeonsHandler(settings)
const harvestablesHandler = new HarvestablesHandler(settings)
const mobsHandler = new MobsHandler(settings)

const map = new MapH(-1)

const itemsInfo = new ItemsInfo()
const mobsInfo = new MobsInfo()

let lpX = 0.0
let lpY = 0.0

const mapsDrawing = new MapDrawing(settings)
const chestsDrawing = new ChestsDrawing(settings)
const mobsDrawing = new MobsDrawing(settings)
const playersDrawing = new PlayersDrawing(settings)
const dungeonsDrawing = new DungeonsDrawing(settings)
const harvestablesDrawing = new HarvestablesDrawing(settings)

const drawingUtils = new DrawingUtils()

let previousTime = performance.now()

let drawCanvas = null
let drawContext = null
let drawCanvasGrid = null
let drawContextGrid = null
let drawCanvasOurPlayer = null
let drawContextOurPlayer = null

export function setCanvas(
  canvas,
  context,
  canvasGrid,
  contextGrid,
  canvasOurPlayer,
  contextOurPlayer,
) {
  drawCanvas = canvas
  drawContext = context
  drawCanvasGrid = canvasGrid
  drawContextGrid = contextGrid
  drawCanvasOurPlayer = canvasOurPlayer
  drawContextOurPlayer = contextOurPlayer
}

export function drawInit(
  drawCanvas,
  drawContext,
  drawCanvasGrid,
  drawContextGrid,
  drawCanvasOurPlayer,
  drawContextOurPlayer,
) {
  drawingUtils.initCanvas(drawCanvas, drawContext)
  drawingUtils.initGridCanvas(drawCanvasGrid, drawContextGrid)
  drawingUtils.initOurPlayerCanvas(drawCanvasOurPlayer, drawContextOurPlayer)
}

export function itemsAndMobsInfoInit() {
  itemsInfo.initItems()
  mobsInfo.initMobs()

  mobsHandler.updateMobInfo(mobsInfo.moblist)
  playersDrawing.updateItemsInfo(itemsInfo.iteminfo)
}

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
    // mobsHandler.updateMistPosition(id, posX, posY)
    // mobsHandler.updateMobPosition(id, posX, posY)
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
  // Player moving
  if (Parameters[253] === 21) {
    lpX = Parameters[1][0]
    lpY = Parameters[1][1]

    // console.log('X: ' + lpX + ', Y: ' + lpY) // Meu personagem
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

export function render(drawCanvas, drawContext) {
  drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
  // contextMap.clearRect(0, 0, canvasMap.width, canvasMap.height)

  // mapsDrawing.Draw(contextMap, map)

  // harvestablesDrawing.invalidate(
  //   drawContext,
  //   harvestablesHandler.harvestableList,
  // )
  // mobsDrawing.invalidate(
  //   drawContext,
  //   mobsHandler.mobsList,
  //   mobsHandler.mistList,
  // )
  // chestsDrawing.invalidate(drawContext, chestsHandler.chestsList)
  // dungeonsDrawing.Draw(drawContext, dungeonsHandler.dungeonList)
  playersDrawing.invalidate(drawContext, playersHandler.playersInRange)
}

export function update() {
  const currentTime = performance.now()
  const deltaTime = currentTime - previousTime
  const t = Math.min(1, deltaTime / 100)

  // if (settings.showMapBackground) mapsDrawing.interpolate(map, lpX, lpY, t)

  harvestablesHandler.removeNotInRange(lpX, lpY)
  harvestablesDrawing.interpolate(
    harvestablesHandler.harvestableList,
    lpX,
    lpY,
    t,
  )

  mobsDrawing.interpolate(
    mobsHandler.mobsList,
    mobsHandler.mistList,
    lpX,
    lpY,
    t,
  )

  chestsDrawing.interpolate(chestsHandler.chestsList, lpX, lpY, t)
  dungeonsDrawing.interpolate(dungeonsHandler.dungeonList, lpX, lpY, t)
  playersDrawing.interpolate(playersHandler.playersInRange, lpX, lpY, t)

  previousTime = currentTime
}

export function drawItems(canvasItems, contextItems) {
  contextItems.clearRect(0, 0, canvasItems.width, canvasItems.height)

  if (settings.settingItems) {
    playersDrawing.drawItems(
      contextItems,
      canvasItems,
      playersHandler.playersInRange,
      settings.settingItemsDev,
    )
  }
}

export function gameLoop() {
  update()
  render(drawCanvas, drawContext)
  requestAnimationFrame(gameLoop)
}

export function checkLocalStorage() {
  settings.update(settings)
}
