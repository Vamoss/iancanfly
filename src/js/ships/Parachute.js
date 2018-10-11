import Ship from './Ship'

class Parachute extends Ship {
  constructor (audioListener) {
    super('parachute.gltf', 2.5, 0, 1, 'static/audios/205966__kangaroovindaloo__medium-wind.ogg', audioListener, true)
  }
}

export default Parachute
