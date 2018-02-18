// forked from https://threejs.org/examples/?q=vr#webvr_cubes

import * as THREE from 'three'
import 'three/src/loaders/ObjectLoader'
import AbstractVRApplication from 'views/AbstractVRApplication'

class Main extends AbstractVRApplication {
  constructor () {
    super()
    var t = this

    t.clock = new THREE.Clock()
    t.isMouseDown = false
    t.INTERSECTED = null

    var loader = new THREE.OBJLoader()
    loader.load('static/models/Parachute.obj', function (object) {
      t.scene.add(object)
    })

    t.room = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6, 8, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true })
    )

    t.scene.add(t.room)

    t.scene.add(new THREE.HemisphereLight(0x606060, 0x404040))

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    t.scene.add(light)

    t.raycaster = new THREE.Raycaster()

    t.renderer.setClearColor(0x505050)
    t.renderer.sortObjects = false

    t.renderer.domElement.addEventListener('mousedown', t.onMouseDown.bind(t), false)
    t.renderer.domElement.addEventListener('mouseup', t.onMouseUp.bind(t), false)
    t.renderer.domElement.addEventListener('touchstart', t.onMouseDown.bind(t), false)
    t.renderer.domElement.addEventListener('touchend', t.onMouseUp.bind(t), false)

    t.animate()
  }

  onMouseDown () {
    this.isMouseDown = true
  }

  onMouseUp () {
    this.isMouseDown = false
  }

  onWindowResize () {
    super.onWindowResize()
    this.effect.setSize(window.innerWidth, window.innerHeight)
  }

  animate () {
    this.effect.requestAnimationFrame(this.animate.bind(this))
    this.render()
  }

  render () {
    const delta = this.clock.getDelta() * 60

    if (this.isMouseDown === true) {
      const cube = this.room.children[ 0 ]
      this.room.remove(cube)

      cube.position.set(0, 0, -0.75)
      cube.position.applyQuaternion(this.camera.quaternion)
      cube.userData.velocity.x = (Math.random() - 0.5) * 0.02 * delta
      cube.userData.velocity.y = (Math.random() - 0.5) * 0.02 * delta
      cube.userData.velocity.z = (Math.random() * 0.01 - 0.05) * delta
      cube.userData.velocity.applyQuaternion(this.camera.quaternion)
      this.room.add(cube)
    }

    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)

    const intersects = this.raycaster.intersectObjects(this.room.children)

    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[ 0 ].object) {
        if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

        this.INTERSECTED = intersects[ 0 ].object
        this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
        this.INTERSECTED.material.emissive.setHex(0xff0000)
      }
    } else {
      if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

      this.INTERSECTED = undefined
    }

    // Keep cubes inside room

    for (let i = 0; i < this.room.children.length; i++) {
      const cube = this.room.children[ i ]

      cube.userData.velocity.multiplyScalar(1 - (0.001 * delta))

      cube.position.add(cube.userData.velocity)

      if (cube.position.x < -3 || cube.position.x > 3) {
        cube.position.x = THREE.Math.clamp(cube.position.x, -3, 3)
        cube.userData.velocity.x = -cube.userData.velocity.x
      }

      if (cube.position.y < -3 || cube.position.y > 3) {
        cube.position.y = THREE.Math.clamp(cube.position.y, -3, 3)
        cube.userData.velocity.y = -cube.userData.velocity.y
      }

      if (cube.position.z < -3 || cube.position.z > 3) {
        cube.position.z = THREE.Math.clamp(cube.position.z, -3, 3)
        cube.userData.velocity.z = -cube.userData.velocity.z
      }

      cube.rotation.x += cube.userData.velocity.x * 2 * delta
      cube.rotation.y += cube.userData.velocity.y * 2 * delta
      cube.rotation.z += cube.userData.velocity.z * 2 * delta
    }

    this.controls.update()
    this.effect.render(this.scene, this.camera)
  }
}
export default Main
