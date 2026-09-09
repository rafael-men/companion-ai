import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationMixer, LoopOnce, LoopRepeat } from 'three'
import { createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from '@pixiv/three-vrm-animation'

let _loader = null

function getLoader() {
  if (!_loader) {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser))
    _loader = loader
  }
  return _loader
}

const FADE_DURACAO = 0.3

export function carregarVRMA(url) {
  return new Promise((resolve, reject) => {
    getLoader().load(
      url,
      (gltf) => resolve(gltf.userData?.vrmAnimations?.[0] ?? null),
      undefined,
      (error) => reject(error)
    )
  })
}

export function criarMixerAnimacao(vrm) {
  const mixer = new AnimationMixer(vrm.scene)
  vrm._mixer = mixer
  vrm._actionAtual = null
  vrm._vrmaAtivo = false

  if (vrm.lookAt) {
    const proxy = new VRMLookAtQuaternionProxy(vrm.lookAt)
    proxy.name = 'lookAtQuaternionProxy'
    vrm.scene.add(proxy)
  }

  return mixer
}

export function tocarAnimacaoVRMA(vrm, vrmAnimation, { loop = true, onEnd = null } = {}) {
  const mixer = vrm._mixer ?? criarMixerAnimacao(vrm)
  const clip = createVRMAnimationClip(vrmAnimation, vrm)
  const action = mixer.clipAction(clip)

  if (vrm._actionAtual && vrm._actionAtual !== action) {
    const anterior = vrm._actionAtual
    if (anterior._aoTerminar) {
      mixer.removeEventListener('finished', anterior._aoTerminar)
      anterior._aoTerminar = null
    }
    anterior.fadeOut(FADE_DURACAO)
  }

  action.reset()

  if (loop) {
    action.setLoop(LoopRepeat)
    action._aoTerminar = null
  } else {
    action.setLoop(LoopOnce)
    action.clampWhenFinished = false
    action._aoTerminar = (event) => {
      if (event.action !== action) return
      mixer.removeEventListener('finished', action._aoTerminar)
      action._aoTerminar = null
      action.stop()
      if (vrm._actionAtual === action) {
        vrm._actionAtual = null
        vrm._vrmaAtivo = false
        onEnd?.()
      }
    }
    mixer.addEventListener('finished', action._aoTerminar)
  }

  action.play()

  if (vrm._actionAtual && vrm._actionAtual !== action) {
    action.fadeIn(FADE_DURACAO)
  } else {
    action.setEffectiveWeight(1)
  }

  vrm._actionAtual = action
  vrm._vrmaAtivo = true

  return { mixer, action, clip }
}

export function pararAnimacaoVRMA(vrm) {
  if (!vrm._mixer) return

  if (vrm._actionAtual) {
    if (vrm._actionAtual._aoTerminar) {
      vrm._mixer.removeEventListener('finished', vrm._actionAtual._aoTerminar)
      vrm._actionAtual._aoTerminar = null
    }
    vrm._actionAtual.fadeOut(FADE_DURACAO)
    vrm._actionAtual = null
  }
  vrm._vrmaAtivo = false
}