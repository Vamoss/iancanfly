import * as THREE from 'three'
import GLTFLoader from '../../../static/js/GLTFLoader'
const EventEmitter = require('events')

class Ship extends EventEmitter {
  constructor (modelUrl, scale, rotation, velocity, audioUrl, audioListener, audioPlay) {
    super()

    this.modelUrl = modelUrl
    this.scale = scale
    this.rotation = rotation
    this.velocity = velocity
    this.audioUrl = audioUrl
    this.audioListener = audioListener
    this.audioPlay = audioPlay
    this.model = null
    this.sound = null
    this.center = new THREE.Vector3(0, 0, 0)

    this.loadModel()
    this.loadAudio()
  }

  loadModel () {
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

  loadAudio () {
    var t = this
    // eslint-disable-next-line
    this.sound = new THREE.Audio(this.audioListener)
    var audioLoader = new THREE.AudioLoader()
    audioLoader.load(this.audioUrl, function (buffer) {
      t.sound.setBuffer(buffer)
      t.sound.setLoop(true)
      t.sound.setVolume(0.3)
      if (t.audioPlay) {
        t.sound.play()
      }
    })
  }
}

export default Ship
