import Ship from './Ship'

class Ovni extends Ship {
  constructor (audioListener) {
    super('ovni.gltf', 30, Math.PI, 2, 'static/audios/42233__noisecollector__spaceswamp.ogg', audioListener, false)
  }
}

export default Ovni
