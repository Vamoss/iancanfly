import Ship from './Ship'

class Parachute extends Ship {
  constructor (audioListener) {
    super('spaceship.gltf', 30, Math.PI, 3, 'static/audios/42233__noisecollector__spaceswamp.ogg', audioListener, false)
  }
}

export default Parachute
