import * as THREE from 'three'
import * as Stats from 'stats.js'
import '../../static/js/GLTFLoader'
// import shaderVert from 'shaders/custom.vert'
// import shaderFrag from 'shaders/custom.frag'

class Main {
  constructor () {
    var t = this

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

    this.goUp = false
    this.goDown = false
    this.goLeft = false
    this.goRight = false
    this.maxX = 30
    this.maxY = 50
    this.velX = 1.5
    this.destPos = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 2
    this.collidableMeshList = []
    this.direction = new THREE.Vector3(0, 0, 10)
    this.direction.normalize()
    this.coins = []
    this.coin = null

    this.levels = [
      {
        modelUrl: 'parachute.gltf',
        scale: 2.5,
        rotation: 0
      },
      {
        modelUrl: 'plane.gltf',
        scale: 6,
        rotation: Math.PI + Math.PI * 0.5
      },
      {
        modelUrl: 'spaceship.gltf',
        scale: 30,
        rotation: Math.PI
      },
      {
        modelUrl: 'spaceship2.gltf',
        scale: 10,
        rotation: 0
      }
    ]

    for (var i = 0; i < this.levels.length; i++) {
      this.loadModel(i)
    }

    this.loadCoin()

    this._renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    this._renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    this._renderer.domElement.addEventListener('touchstart', this.onMouseDown.bind(this), false)
    this._renderer.domElement.addEventListener('touchend', this.onMouseUp.bind(this), false)

    document.addEventListener('keydown', this.onKeyDown.bind(this), false)
    document.addEventListener('keyup', this.onKeyUp.bind(this), false)

    window.addEventListener('resize', this.onWindowResize.bind(this), false)

    this.animate()
  }

  onMouseDown () {
    this.goUp = true
    this.goDown = false
  }

  onMouseUp () {
    this.goUp = false
    this.goDown = true
  }

  onKeyDown (e) {
    e = e || window.event
    if (e.keyCode === 38) this.goUp = true
    else if (e.keyCode === 40) this.goDown = true
    else if (e.keyCode === 37) this.goLeft = true
    else if (e.keyCode === 39) this.goRight = true
  }

  onKeyUp (e) {
    e = e || window.event
    if (e.keyCode === 38) this.goUp = false
    else if (e.keyCode === 40) this.goDown = false
    else if (e.keyCode === 37) this.goLeft = false
    else if (e.keyCode === 39) this.goRight = false
  }

  onWindowResize () {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate () {
    this.stats.begin()

    var currentLevel = 1

    // instantiate coins
    if (this.coin) {
      while (this.coins.length < 10 && Math.random() > 0.95) {
        var coin = this.coin.clone()
        coin.rotation.z = Math.random() * Math.PI
        coin.position.set((Math.random() - 0.5) * 2 * this.maxX, Math.random() * this.maxY + 20, this._camera.position.z + 250 + Math.random() * 60)
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

    var model = this.levels[currentLevel].model
    if (model) {
      var oldModelPos = model.position.clone()

      // position
      model.position.z += this.velX
      if (this.goUp && this.destPos.y < this.maxY) this.destPos.y += 0.4
      else if (this.goDown && this.destPos.y > 0) this.destPos.y -= 0.3
      if (this.goLeft && this.destPos.x < this.maxX) this.destPos.x += 0.3
      else if (this.goRight && this.destPos.x > -this.maxX) this.destPos.x -= 0.3
      model.position.x += (this.destPos.x - model.position.x) * 0.05
      model.position.y += (this.destPos.y - model.position.y) * 0.05

      this._camera.position.z = model.position.z - 50

      // direction
      var dir = new THREE.Vector3()
      dir.subVectors(model.position, oldModelPos)
      dir.add(model.position)
      model.lookAt(dir)
      model.rotation.y += this.levels[currentLevel].rotation

      // collider
      var collider = this.levels[currentLevel].collider
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

  loadModel (levelIndex) {
    var t = this
    var level = t.levels[levelIndex]
    var loader = new THREE.GLTFLoader()
    loader.load('static/models/' + level.modelUrl, function (gltf) {
      level.model = gltf.scene.children[0]
      level.model.scale.set(level.scale, level.scale, level.scale)
      t._scene.add(level.model)

      // collider
      if (level.model instanceof THREE.Group) {
        var combined = new THREE.Geometry()
        for (var i = 0; i < level.model.children.length; i++) {
          THREE.GeometryUtils.merge(combined, new THREE.Geometry().fromBufferGeometry(level.model.children[i].geometry))
        }
        level.collider = combined
      } else if (level.model instanceof THREE.Mesh) {
        level.collider = new THREE.Geometry().fromBufferGeometry(level.model.geometry)
      }
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    function (error) {
      console.error('GLTF LOADER:', error)
    })
  }

  loadCoin () {
    var t = this
    var loader = new THREE.GLTFLoader()
    loader.load('static/models/coin.gltf', function (gltf) {
      t.coin = gltf.scene.children[0].clone()
      t.coin.scale.set(10, 10, 10)
      t.coin.lookAt(0, 1, 0)
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    function (error) {
      console.error('GLTF LOADER:', error)
    })
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
