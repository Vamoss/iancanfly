import * as THREE from 'three'
import GLTFLoader from '../../../static/js/GLTFLoader'
const EventEmitter = require('events')

class Ship extends EventEmitter {
  constructor (modelUrl, scale, rotation, velocity) {
    super()

    this.modelUrl = modelUrl
    this.scale = scale
    this.rotation = rotation
    this.velocity = velocity
    this.model = null
    this.center = new THREE.Vector3(0, 0, 0)

    this.load()
  }

  load () {
    var t = this
    // eslint-disable-next-line
    var loader = new GLTFLoader()
    loader.load('static/models/' + this.modelUrl, function (gltf) {
      t.model = gltf.scene.children[0]
      t.model.scale.set(t.scale, t.scale, t.scale)
      t.center = new THREE.Box3().setFromObject(t.model).getCenter()
      t.emit('onModelLoaded', t.model)
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    function (error) {
      console.error('GLTF LOADER:', error)
    })
  }
}

export default Ship
