import Ship from './Ship'

class Parachute extends Ship {
  constructor () {
    super('plane.gltf', 6, Math.PI + Math.PI * 0.5, 2)
  }
}

export default Parachute
