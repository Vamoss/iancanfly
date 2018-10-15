import Ship from './Ship'

class Parachute2 extends Ship {
  constructor (audioListener) {
    super('spaceship2.gltf', 30, Math.PI, 3, 'static/audios/42233__noisecollector__spaceswamp.ogg', audioListener, false)
  }
}

export default Parachute2
