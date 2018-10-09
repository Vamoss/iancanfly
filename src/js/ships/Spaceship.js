import Ship from './Ship'

class Parachute extends Ship {
  constructor () {
    super('spaceship.gltf', 30, Math.PI, 3)
  }
}

export default Parachute