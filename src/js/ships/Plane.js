import Ship from './Ship'

class Parachute extends Ship {
  constructor (audioListener) {
    super('plane.gltf', 6, Math.PI + Math.PI * 0.5, 2, 'static/audios/218352__photomonster__motorcycle-nsumax-1954-engine.ogg', audioListener, false)
  }
}

export default Parachute
