import Ship from './Ship'

class Balloon extends Ship {
  constructor (audioListener) {
    super('balloon.gltf', 2.5, 0, 1, 'static/audios/205966__kangaroovindaloo__medium-wind.ogg', audioListener, false)
  }
}

export default Balloon
