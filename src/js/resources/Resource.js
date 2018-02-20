import GLTFLoader from '../../../static/js/GLTFLoader'
const EventEmitter = require('events')

class Resource extends EventEmitter {
  constructor (modelUrl, scale, rotation) {
    super()

    this.modelUrl = modelUrl
    this.scale = scale
    this.rotation = rotation
    this.model = null

    this.load()
  }

  load () {
    var t = this
    var loader = new GLTFLoader()
    loader.load('static/models/' + t.modelUrl, function (gltf) {
      t.model = gltf.scene.children[0].clone()
      t.model.scale.set(t.scale, t.scale, t.scale)
      t.model.lookAt(0, t.rotation, 0)
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    function (error) {
      console.error('GLTF LOADER:', error)
    })
  }
}

export default Resource
