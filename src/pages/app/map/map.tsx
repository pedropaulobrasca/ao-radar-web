/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DrawingUtils } from '../../../utils/drawing-utils'
import {
  checkLocalStorage,
  drawInit,
  drawItems,
  gameLoop,
  itemsAndMobsInfoInit,
  onEvent,
  onRequest,
  onResponse,
  setCanvas,
} from '../../../utils/utils'

interface DataResponse {
  code: string
  dictionary: string
}

const drawingUtils = new DrawingUtils()

export function Map() {
  const isMap = useLocation()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const canvasMapRef = useRef<HTMLCanvasElement>(null)
  const canvasGridRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasOurPlayerRef = useRef<HTMLCanvasElement>(null)
  const canvasItemsRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isMap.pathname === '/' && !socket) {
      const newSocket = new WebSocket('ws://localhost:5002')

      newSocket.onopen = () => {
        console.log('Conectado')
      }

      newSocket.onmessage = (event) => {
        const data: DataResponse = JSON.parse(event.data)

        const code = data.code
        const dictionary = JSON.parse(data.dictionary)

        switch (code) {
          case 'request':
            onRequest(dictionary.parameters)
            break
          case 'response':
            onResponse(dictionary.parameters)
            break
          case 'event':
            onEvent(dictionary.parameters)
            break
          default:
            console.log('Invalid code')
            break
        }
      }

      newSocket.onclose = () => {
        console.log('Desconectado')
      }

      setSocket(newSocket)
    }

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [isMap.pathname, socket])

  useEffect(() => {
    const contextMap = canvasMapRef.current?.getContext('2d')
    const contextGrid = canvasGridRef.current?.getContext('2d')
    const context = canvasRef.current?.getContext('2d')
    const contextOurPlayer = canvasOurPlayerRef.current?.getContext('2d')
    const contextItems = canvasItemsRef.current?.getContext('2d')

    setCanvas(
      canvasRef.current,
      context,
      canvasGridRef,
      contextGrid,
      canvasOurPlayerRef,
      contextOurPlayer,
    )

    itemsAndMobsInfoInit()
    drawInit(
      canvasRef.current,
      context,
      canvasGridRef.current,
      contextGrid,
      canvasOurPlayerRef.current,
      contextOurPlayer,
    )

    gameLoop()
  }, [])

  return (
    <div className="relative flex items-center justify-center bg-slate-950">
      <canvas
        id="mapCanvas"
        ref={canvasMapRef}
        width="500"
        height="500"
        className="absolute right-0 top-0 m-2.5"
      ></canvas>
      <canvas
        id="gridCanvas"
        ref={canvasGridRef}
        width="500"
        height="500"
        className="absolute right-0 top-0 m-2.5 bg-gray-500"
      ></canvas>
      <canvas
        id="drawCanvas"
        ref={canvasRef}
        width="500"
        height="500"
        className="absolute right-0 top-0 m-2.5"
      ></canvas>
      <canvas
        id="ourPlayerCanvas"
        ref={canvasOurPlayerRef}
        width="500"
        height="500"
        className="absolute right-0 top-0 m-2.5"
      ></canvas>
      {/* {<canvas
        id="thirdCanvas"
        ref={canvasItemsRef}
        style={{ width: '100vw', height: '100vh' }}
        className="absolute bottom-0 left-0 top-[520px] border-2"
      ></canvas>} */}
    </div>
  )
}
