import { useEffect } from 'react'

import { onEvent, onRequest, onResponse } from './utils/Utils'

interface DataResponse {
  code: string
  dictionary: string
}

const socket = new WebSocket('ws://localhost:5002')

function App() {
  useEffect(() => {
    socket.onopen = () => {
      console.log('Conectado')
    }

    socket.onmessage = (event) => {
      const data: DataResponse = JSON.parse(event.data)

      // Code and dictionary
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

    socket.onclose = () => {
      console.log('Desconectado')
    }
  }, [])

  return (
    <>
      <h1 className="text-3xl font-bold underline">oi</h1>
    </>
  )
}

export default App
