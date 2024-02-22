import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { onEvent, onRequest, onResponse } from '../../../utils/Utils'

interface DataResponse {
  code: string
  dictionary: string
}

export function Map() {
  const isMap = useLocation()
  const [socket, setSocket] = useState<WebSocket | null>(null)

  // Verificar se está na página de Map e se a conexão WebSocket ainda não foi estabelecida
  if (isMap.pathname === '/map' && !socket) {
    const newSocket = new WebSocket('ws://localhost:5002')
    newSocket.onopen = () => {
      console.log('Conectado')
    }

    newSocket.onmessage = (event) => {
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

    newSocket.onclose = () => {
      console.log('Desconectado')
    }

    // Atualizar o estado com a nova conexão WebSocket
    setSocket(newSocket)
  }

  // Certificar-se de que a conexão WebSocket seja fechada quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  return <div>Map</div>
}
