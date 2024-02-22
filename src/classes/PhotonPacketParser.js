import EventEmitter from 'events'

import PhotonPacket from './PhotonPacket'

class PhotonPacketParser extends EventEmitter {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  handle(buff) {
    this.emit('packet', new PhotonPacket(this, buff))
  }
}

export default PhotonPacketParser
