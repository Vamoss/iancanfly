import * as THREE from 'three'
import * as Stats from 'stats.js'
import Parachute from './ships/Parachute'
import Plane from './ships/Plane'
import Spaceship from './ships/Spaceship'
import Coin from './resources/Coin'
import '../../static/js/GLTFLoader'
import '../../static/js/Math'
// import shaderVert from 'shaders/custom.vert'
// import shaderFrag from 'shaders/custom.frag'

class Main {
  constructor () {
    var t = this

    this.currentLevel = 0

    this.mouseX = 0
    this.mouseY = 0
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.diffX = 0
    this.diffY = 0

    this.maxX = 80
    this.maxY = 50
    this.velX = 1.5
    this.minAltitude = 200 // meters
    this.altitude = this.minAltitude
    this.curAltitude = this.altitude
    this.destPos = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 2
    this.collidableMeshList = []
    this.direction = new THREE.Vector3(0, 0, 10)
    this.direction.normalize()
    this.coins = []
    this.coin = new Coin()
    this.paused = false

    this.levels = [
      {
        ship: new Parachute(),
        altitude: this.minAltitude
      },
      {
        ship: new Plane(),
        altitude: 10000000
      },
      {
        ship: new Spaceship(),
        altitude: 400000000
      }
    ]

    this._camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    this._camera.position.set(-100, 50, 0)
    this._camera.lookAt(0, 0, 100)

    this._scene = new THREE.Scene()
    this._scene.background = new THREE.Color(0xcaf8f1)
    this._scene.fog = new THREE.FogExp2(0xcaf8f1, 0.001)

    this._renderer = new THREE.WebGLRenderer()
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    this.stats = new Stats()
    this.stats.showPanel(0)// fps,
    // this.stats.showPanel(1)// ms
    // this.stats.showPanel(2)// mb
    document.body.appendChild(this.stats.dom)

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
    /*
    var wireframe = new THREE.WireframeGeometry(geometry)
    var line = new THREE.LineSegments(wireframe)
    line.material.depthTest = false
    line.material.opacity = 0.25
    line.material.transparent = true
    this.ground.add(line)
    */
    const earthRadius = 6000000 // 6000 km
    this.ground.scale.set(earthRadius, earthRadius, earthRadius)
    this.ground.position.y = -earthRadius
    this.ground.rotation.z = Math.PI * 0.5

    // add ship models to scene
    for (var i = 0; i < this.levels.length; i++) {
      this.levels[i].ship.on('onModelLoaded', function (model) {
        t._scene.add(model)
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

    this.animate()
  }

  onMouseMove (event) {
    this.mouseX = event.pageX
    this.mouseY = event.pageY
  }

  onMouseDown () {
    this.nextLevel()
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
    this.stats.begin()

    if (!this.paused) {
      // mouse
      this.diffX += (this.mouseX - this.prevMouseX) / 100
      this.diffY += (this.mouseY - this.prevMouseY) / 100
      this.diffX = Math.clamp(this.diffX, -1, 1)
      this.diffY = Math.clamp(this.diffY, -1, 1)
      this.prevMouseX = this.mouseX
      this.prevMouseY = this.mouseY

      // altitude
      this.altitude -= 0.005
      if (this.altitude < this.minAltitude) this.altitude = this.minAltitude
      this.curAltitude += (this.altitude - this.curAltitude) * 0.05
      // console.log(this.altitude)

      // instantiate coins
      if (this.coin.model) {
        while (this.coins.length < 5 && Math.random() > 0.97) {
          var coin = this.coin.model.clone()
          coin.rotation.z = Math.random() * Math.PI
          coin.position.set(
            (Math.random() - 0.5) * 2 * this.maxX,
            Math.random() * (this.maxY - 20) + 20 + this.curAltitude,
            this._camera.position.z + 250 + Math.random() * 60)
          this._scene.add(coin)
          this.coins.push(coin)
          this.collidableMeshList.push(coin)
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
        var collider = this.levels[this.currentLevel].ship.collider
        for (var i = 0; i < collider.vertices.length; i++) {
          if (i % 3 !== 0) continue
          var vertex = collider.vertices[i].clone()
          this.raycaster.set(vertex.applyMatrix4(model.matrix), this.direction)
          var collisionResults = this.raycaster.intersectObjects(this.collidableMeshList)
          for (var j = 0; j < collisionResults.length; j++) {
            this.onResourceCollide(collisionResults[j].object)
          }
        }
      } // if model
    } // if !this.paused

    this._renderer.render(this._scene, this._camera)

    this.stats.end()

    requestAnimationFrame(this.animate.bind(this))
  }

  nextLevel () {
    var nextLevel = this.currentLevel + 1
    if (nextLevel >= this.levels.length) nextLevel = 0

    this.levels[nextLevel].ship.model.position.copy(this.levels[this.currentLevel].ship.model.position)
    this.currentLevel = nextLevel
  }

  onResourceCollide (resource) {
    var increase = 20

    // bonus = fast coin catch
    if (this.curAltitude < this.altitude) increase *= 2

    this.altitude += increase * (this.currentLevel + 1)
    this.removeCoin(resource)
  }

  removeCoin (coin) {
    var index = this.collidableMeshList.indexOf(coin)
    if (index > -1) {
      this.collidableMeshList.splice(index, 1)
    }

    index = this.coins.indexOf(coin)
    if (index > -1) {
      this.coins.splice(index, 1)
    }

    this._scene.remove(coin)
  }
}

export default Main
