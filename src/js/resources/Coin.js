import Resource from './Resource'

class Coin extends Resource {
  constructor (audioListener) {
    super('coin.gltf', 30, 1, 'static/audios/135936__bradwesson__collectcoin.ogg', audioListener)
  }
}

export default Coin
