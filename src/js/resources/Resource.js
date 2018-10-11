import GLTFLoader from '../../../static/js/GLTFLoader'
const EventEmitter = require('events')

class Resource extends EventEmitter {
  constructor (modelUrl, scale, rotation, audioUrl, audioListener) {
    super()

    this.modelUrl = modelUrl
    this.scale = scale
    this.rotation = rotation
    this.audioUrl = audioUrl
    this.audioListener = audioListener
    this.model = null
    this.sound = null

    this.loadModel()
    this.loadAudio()
  }

  loadModel () {
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

  loadAudio () {
    var t = this
    // eslint-disable-next-line
    this.sound = new THREE.Audio(this.audioListener)
    // eslint-disable-next-line
    var audioLoader = new THREE.AudioLoader()
    audioLoader.load(this.audioUrl, function (buffer) {
      t.sound.setBuffer(buffer)
      t.sound.setLoop(false)
      t.sound.setVolume(0.5)
    })
  }
}

export default Resource
