import * as THREE from 'three'
// import * as Stats from 'stats.js'
import Parachute from './ships/Parachute'
import Balloon from './ships/Balloon'
import Plane from './ships/Plane'
import Spaceship from './ships/Spaceship'
// import Spaceship2 from './ships/Spaceship2'
import Ovni from './ships/Ovni'
import Coin from './resources/Coin'
import '../../static/js/GLTFLoader'
import '../../static/js/Math'
import ParticleManager from './particles/ParticleManager'
import Amplitude from 'amplitude'
// import shaderVert from 'shaders/custom.vert'
// import shaderFrag from 'shaders/custom.frag'

class Main {
  constructor () {
    var t = this

    this.userId = new Date().getTime()
    this.amplitude = new Amplitude('82e23a024491264ca4d730a9297d4073')

    this.currentLevel = 0

    this.mouseX = 0
    this.mouseY = 0
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.diffX = 0
    this.diffY = 0

    this.audioList = [
      {
        url: 'static/audios/Black-Eyed-Peas-I-Got-A-Feeling.ogg',
        sound: null
      },
      {
        url: 'static/audios/Eiffel65-Blue.ogg',
        sound: null
      },
      {
        url: 'static/audios/Enegetic-Game-Theme.ogg',
        sound: null
      },
      {
        url: 'static/audios/Imagine Dragons - Radioactive (Harder).ogg',
        sound: null
      }
    ]
    this.audioListener = new THREE.AudioListener()

    this.maxX = 80
    this.maxY = 50
    this.velX = 1.5
    this.minAltitude = 200 // meters
    this.altitude = this.minAltitude
    this.curAltitude = this.altitude
    this.destPos = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 2
    this.direction = new THREE.Vector3(0, 0, 10)
    this.direction.normalize()
    this.coins = []
    this.coin = new Coin(this.audioListener)
    this.paused = false

    this.levels = [
      {
        ship: new Parachute(this.audioListener),
        altitude: this.minAltitude,
        skyColor: new THREE.Color(0xcaf8f1),
        decay: 0.03,
        coins: 20
      },
      {
        ship: new Balloon(this.audioListener),
        altitude: 400,
        skyColor: new THREE.Color(0xaaffff),
        decay: 0.04,
        coins: 18
      },
      {
        ship: new Plane(this.audioListener),
        altitude: 600,
        skyColor: new THREE.Color(0xf26dd9),
        decay: 0.06,
        coins: 15
      },
      {
        ship: new Spaceship(this.audioListener),
        altitude: 800,
        skyColor: new THREE.Color(0xff933a),
        decay: 0.12,
        coins: 12
      },
      /*
      {
        ship: new Spaceship2(this.audioListener),
        altitude: 1000,
        skyColor: new THREE.Color(0x000000),
        decay: 0.12,
        coins: 10
      },
      */
      {
        ship: new Ovni(this.audioListener),
        altitude: 1000,
        skyColor: new THREE.Color(0x000000),
        decay: 0.12,
        coins: 8
      }
    ]

    this._camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    this._camera.position.set(-100, this.altitude + 50, 0)
    this._camera.lookAt(0, this.altitude, 100)
    this._camera.add(this.audioListener)

    this._scene = new THREE.Scene()

    this._renderer = new THREE.WebGLRenderer()
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    /*
    this.stats = new Stats()
    this.stats.showPanel(0)// fps,
    // this.stats.showPanel(1)// ms
    // this.stats.showPanel(2)// mb
    document.body.appendChild(this.stats.dom)
    */

    // for inspection debug
    // window.scene = this._scene
    // window.THREE = THREE

    // 'ovni.gltf' 100
    // 'balloon.gltf' 10

    var light = new THREE.HemisphereLight(0xbbbbff, 0x444422)
    light.name = 'Hemisphere Light'
    light.position.set(0, 1, 0)
    t._scene.add(light)

    var dirLight = new THREE.DirectionalLight(0xffffff)
    dirLight.name = 'Point Light'
    dirLight.position.set(-10, 6, -10)
    t._scene.add(dirLight)

    this.particles = new ParticleManager(this._scene, this._camera)

    const geometry = new THREE.SphereGeometry(1, 320, 320)
    const material = new THREE.MeshPhongMaterial({color: 0x008800, emissive: 0x00ff00})
    /*
    const material2 = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
    })
    */
    this.ground = new THREE.Mesh(geometry, material)
    this.ground.name = 'Ground'
    this._scene.add(this.ground)

    const earthRadius = 6000000 // 6000 km
    this.ground.scale.set(earthRadius, earthRadius, earthRadius)
    this.ground.position.y = -earthRadius
    this.ground.rotation.z = Math.PI * 0.5

    // add ship models to scene
    for (var i = 0; i < this.levels.length; i++) {
      this.levels[i].ship.on('onModelLoaded', function (model) {
        t._scene.add(model)
        model.position.y = t.altitude
      })
    }

    this._renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    this._renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    this._renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    this._renderer.domElement.addEventListener('touchstart', this.onMouseDown.bind(this), false)
    this._renderer.domElement.addEventListener('touchend', this.onMouseUp.bind(this), false)

    document.addEventListener('keydown', this.onKeyDown.bind(this), false)
    document.addEventListener('keyup', this.onKeyUp.bind(this), false)

    window.addEventListener('resize', this.onWindowResize.bind(this), false)

    this.loadAudio()
    this.initAccelerometer()
    this.animate()
  }

  onMouseMove (event) {
    this.mouseX = event.pageX
    this.mouseY = event.pageY
  }

  onMouseDown () {
    // this.nextLevel()
    // this.altitude = this.levels[this.currentLevel].altitude + 100
  }

  onMouseUp () {
  }

  onKeyDown (e) {
    if (e.keyCode === 32) this.paused = !this.paused
  }

  onKeyUp (e) {
  }

  onWindowResize () {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate () {
    // this.stats.begin()

    if (!this.paused) {
      // mouse
      this.diffX += (this.mouseX - this.prevMouseX) / 100
      this.diffY += (this.mouseY - this.prevMouseY) / 100
      this.diffX = Math.clamp(this.diffX, -1, 1)
      this.diffY = Math.clamp(this.diffY, -1, 1)
      this.prevMouseX = this.mouseX
      this.prevMouseY = this.mouseY

      // altitude
      this.altitude -= this.levels[this.currentLevel].decay
      if (this.altitude < this.minAltitude) this.altitude = this.minAltitude
      this.curAltitude += (this.altitude - this.curAltitude) * 0.05

      let nextLevel = this.currentLevel + 1
      if (nextLevel >= this.levels.length) {
        nextLevel = this.currentLevel
      }
      let progress = (this.curAltitude - this.levels[this.currentLevel].altitude) / (this.levels[nextLevel].altitude - this.levels[this.currentLevel].altitude)
      progress = THREE.Math.clamp(progress, 0, 1)

      // instantiate coins
      if (this.coin.model) {
        if (this.coins.length < this.levels[this.currentLevel].coins && Math.random() > 0.97) {
          var coin = this.coin.model.clone()
          coin.rotation.z = Math.random() * Math.PI
          coin.position.set(
            (Math.random() - 0.5) * 2 * this.maxX,
            Math.random() * (this.maxY - 20) + 20 + this.curAltitude,
            this._camera.position.z + 500 + Math.random() * 300)
          this._scene.add(coin)
          this.coins.push(coin)
        }
      }

      // update or remove coins
      for (var c = this.coins.length - 1; c >= 0; c--) {
        if (this.coins[c].position.z < this._camera.position.z) {
          this.removeCoin(this.coins[c])
        } else {
          this.coins[c].rotation.z += 0.02
        }
      }

      var model = this.levels[this.currentLevel].ship.model
      if (model) {
        var oldModelPos = model.position.clone()

        // position
        this.destPos.x = Math.map(-this.diffX, -1, 1, -this.maxX, this.maxX)
        this.destPos.y = Math.map(-this.diffY, -1, 1, 0, this.maxY) + this.curAltitude
        model.position.x += (this.destPos.x - model.position.x) * 0.05
        model.position.y += (this.destPos.y - model.position.y) * 0.05
        model.position.z += this.levels[this.currentLevel].ship.velocity * this.velX

        // camera
        this._camera.position.z = model.position.z - 50
        this._camera.position.y = this.curAltitude + 50

        // ground
        this.ground.position.z = model.position.z
        // this.ground.rotation.x += 0.00005

        // direction
        var dir = new THREE.Vector3()
        dir.subVectors(model.position, oldModelPos)
        dir.add(model.position)
        model.lookAt(dir)
        model.rotation.y += this.levels[this.currentLevel].ship.rotation

        // collider
        var position = model.position.clone().add(this.levels[this.currentLevel].ship.center)
        for (var i = this.coins.length - 1; i >= 0; i--) {
          if (position.distanceToSquared(this.coins[i].position) < 300) {
            this.onResourceCollide(this.coins[i])
          }
        }
      // if model
      }

      this.particles.update()

      // color
      let skyColor = this.levels[this.currentLevel].skyColor.clone()
      skyColor.lerp(this.levels[nextLevel].skyColor, progress)
      this._scene.background = skyColor
      this._scene.fog = new THREE.FogExp2(skyColor, 0.003)

      // console.log(progress)
      if (progress <= 0) {
        this.prevLevel()
      } else if (progress >= 1) {
        this.nextLevel()
      }

    // if !this.paused
    }

    this._renderer.render(this._scene, this._camera)

    // this.stats.end()

    requestAnimationFrame(this.animate.bind(this))
  }

  nextLevel () {
    var nextLevel = this.currentLevel + 1
    if (nextLevel >= this.levels.length) nextLevel = this.currentLevel

    if (nextLevel === this.currentLevel) return

    this.startLevel(nextLevel)
  }

  prevLevel () {
    var prevLevel = this.currentLevel - 1
    if (prevLevel <= 0) prevLevel = 0

    if (prevLevel === this.currentLevel) return

    this.startLevel(prevLevel)
  }

  startLevel (level) {
    console.log('startLevel', level)

    this.track('change_level', {level: level})

    this.levels[level].ship.model.position.copy(this.levels[this.currentLevel].ship.model.position)
    if (this.levels[this.currentLevel].ship.sound.isPlaying) {
      this.levels[this.currentLevel].ship.sound.stop()
    }
    this.currentLevel = level
    this.levels[this.currentLevel].ship.sound.play()
  }

  onResourceCollide (resource) {
    var increase = 20

    // bonus = fast coin catch
    if (this.curAltitude < this.altitude) increase *= 2

    this.altitude += increase * (this.currentLevel + 1)

    this.coin.sound.play()

    this.removeCoin(resource)

    this.track('get_resource')
  }

  removeCoin (coin) {
    var index = this.coins.indexOf(coin)
    if (index > -1) {
      this.coins.splice(index, 1)
    }

    this._scene.remove(coin)
  }

  loadAudio () {
    this.audioList = this.audioList
      .map((a) => ({sort: Math.random(), value: a}))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value)

    this.currentAudio = 0
    let counter = -1
    let t = this

    this.audioList.map((a) => {
      a.index = ++counter
      a.sound = new THREE.Audio(this.audioListener)
      var audioLoader = new THREE.AudioLoader()
      audioLoader.load(a.url, function (buffer) {
        a.sound.setBuffer(buffer)
        a.sound.setLoop(false)
        a.sound.setVolume(0.5)
        if (a.index === 0) {
          a.sound.play()
          a.sound.source.onended = () => {
            console.log('audio ended', t.currentAudio, t.audioList.length, a.index)
            t.currentAudio++
            if (t.currentAudio >= t.audioList.length) t.currentAudio = 0
            console.log('audio ended', t.currentAudio, t.audioList.length, a.index)

            t.audioList[t.currentAudio].sound.play()
          }
        }
      })
    })
  }

  initAccelerometer () {
    let t = this
    window.addEventListener('devicemotion', function (event) {
      let x = event.accelerationIncludingGravity.x
      let y = event.accelerationIncludingGravity.y
      if (x !== 0 || y !== 0) {
        if (window.innerWidth > window.innerHeight) {
          t.mouseX = -y * 30
          t.mouseY = x * 30
        } else {
          t.mouseX = x * 30
          t.mouseY = -y * 30
        }
      }
    })
  }

  track (eventType, eventProperties) {
    let data = {event_type: eventType, user_id: this.userId}
    if (eventProperties) data.event_properties = eventProperties
    this.amplitude.track(data)
  }
}

export default Main
