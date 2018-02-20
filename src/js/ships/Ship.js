import * as THREE from 'three'
import GLTFLoader from '../../../static/js/GLTFLoader'
const EventEmitter = require('events')

class Ship extends EventEmitter {
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
    // eslint-disable-next-line
    var loader = new GLTFLoader()
    loader.load('static/models/' + this.modelUrl, function (gltf) {
      t.model = gltf.scene.children[0]
      t.model.scale.set(t.scale, t.scale, t.scale)
      t.emit('onModelLoaded', t.model)

      // collider
      if (t.model instanceof THREE.Group) {
        var combined = new THREE.Geometry()
        for (var i = 0; i < t.model.children.length; i++) {
          combined.merge(new THREE.Geometry().fromBufferGeometry(t.model.children[i].geometry))
        }
        t.collider = combined
      } else if (t.model instanceof THREE.Mesh) {
        t.collider = new THREE.Geometry().fromBufferGeometry(t.model.geometry)
      }
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
