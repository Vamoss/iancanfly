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
    this.destPos = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 2
    this.collidableMeshList = []
    this.direction = new THREE.Vector3(0, 0, 10)
    this.direction.normalize()
    this.coins = []
    this.coin = new Coin()

    this.levels = [
      {
        ship: new Parachute()
      },
      {
        ship: new Plane()
      },
      {
        ship: new Spaceship()
      }
    ]

    this._camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    this._camera.position.set(-100, 50, 0)
    this._camera.lookAt(0, 0, 100)

    this._scene = new THREE.Scene()
    this._scene.background = new THREE.Color(0xcaf8f1)
    this._scene.fog = new THREE.FogExp2(0xcaf8f1, 0.006)

    this._renderer = new THREE.WebGLRenderer()
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    this.stats = new Stats()
    this.stats.showPanel(0)// fps,
    // this.stats.showPanel(1)// ms
    // this.stats.showPanel(2)// mb
    document.body.appendChild(this.stats.dom)

    // 'ovni.gltf' 100
    // 'balloon.gltf' 10

    var light = new THREE.HemisphereLight(0xbbbbff, 0x444422)
    light.position.set(0, 1, 0)
    t._scene.add(light)

    var dirLight = new THREE.DirectionalLight(0xffffff)
    dirLight.position.set(-10, 6, -10)
    t._scene.add(dirLight)
    const texture = new THREE.TextureLoader().load('static/textures/crate.gif')

    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshBasicMaterial({ map: texture })
    /*
    const material2 = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
    })
    */

    this._mesh = new THREE.Mesh(geometry, material)
    this._scene.add(this._mesh)

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

    // mouse
    this.diffX += (this.mouseX - this.prevMouseX) / 100
    this.diffY += (this.mouseY - this.prevMouseY) / 100
    this.diffX = Math.clamp(this.diffX, -1, 1)
    this.diffY = Math.clamp(this.diffY, -1, 1)
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY

    // instantiate coins
    if (this.coin.model) {
      while (this.coins.length < 5 && Math.random() > 0.97) {
        var coin = this.coin.model.clone()
        coin.rotation.z = Math.random() * Math.PI
        coin.position.set(
          (Math.random() - 0.5) * 2 * this.maxX,
          Math.random() * (this.maxY - 20) + 20,
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
      model.position.z += this.velX
      model.position.x += (Math.map(-this.diffX, -1, 1, -this.maxX, this.maxX) - model.position.x) * 0.05
      model.position.y += (Math.map(-this.diffY, -1, 1, 0, this.maxY) - model.position.y) * 0.05

      // camera
      this._camera.position.z = model.position.z - 50

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
          this.removeCoin(collisionResults[j].object)
        }
      }
    }

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
