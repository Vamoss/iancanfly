import * as THREE from 'three'
const EventEmitter = require('events')

class ParticleManager extends EventEmitter {
  constructor (scene, camera) {
    super()

    this._scene = scene
    this._camera = camera
    this.prevCamX = 0
    this.prevCamY = 0
    this.prevCamZ = 0

    this.maxParticles = 1000

    this.spread = 300

    this.particles = new THREE.Geometry()

    for (let p = 0; p < this.maxParticles; p++) {
      let particle = new THREE.Vector3(
        Math.random() * this.spread - this.spread * 0.5,
        Math.random() * this.spread - this.spread * 0.5,
        Math.random() * this.spread - this.spread * 0.5
      )

      this.particles.vertices.push(particle)
    }

    let pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 2,
      map: THREE.ImageUtils.loadTexture(
        'static/textures/particle.png'
      ),
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    this.particleSystem = new THREE.Points(this.particles, pMaterial)
    this.particleSystem.sortParticles = true;

    this._scene.add(this.particleSystem)
  }

  set (name) {
    if (name === 'Star') {

    }
  }

  update () {

    let xDiff = this._camera.position.x - this.prevCamX
    let yDiff = this._camera.position.y - this.prevCamY
    let zDiff = this._camera.position.z - this.prevCamZ

    this.prevCamX = this._camera.position.x
    this.prevCamY = this._camera.position.y
    this.prevCamZ = this._camera.position.z

    this.particleSystem.position.set(this._camera.position.x, this._camera.position.y, this._camera.position.z)
    console.log(this.particleSystem.position)

    for (let i = 0; i < this.particleSystem.geometry.vertices.length; i++) {
      let particle = this.particleSystem.geometry.vertices[i]
      particle.x -= xDiff
      particle.y -= yDiff
      particle.z -= zDiff

      if (particle.z < -30) {
        particle.x = Math.random() * this.spread - this.spread * 0.5
        particle.y = Math.random() * this.spread - this.spread * 0.5
        particle.z = 300 + Math.random() * 60
      }
    }

    this.particleSystem.geometry.verticesNeedUpdate = true;
  }
}

export default ParticleManager
