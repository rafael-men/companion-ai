jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    load: jest.fn(),
  })),
}))

jest.mock('three', () => {
  const actual = jest.requireActual('three')
  return {
    ...actual,
    AnimationMixer: jest.fn().mockImplementation(() => ({
      clipAction: jest.fn(() => ({
        reset: jest.fn(),
        setLoop: jest.fn(),
        clampWhenFinished: true,
        play: jest.fn(),
        fadeIn: jest.fn(),
        fadeOut: jest.fn(),
        setEffectiveWeight: jest.fn(),
        stop: jest.fn(),
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
    LoopOnce: Symbol('LoopOnce'),
    LoopRepeat: Symbol('LoopRepeat'),
  }
})

jest.mock('@pixiv/three-vrm-animation', () => ({
  createVRMAnimationClip: jest.fn(() => ({ name: 'clip-vrma' })),
  VRMAnimationLoaderPlugin: class VRMAnimationLoaderPluginMock {},
  VRMLookAtQuaternionProxy: class VRMLookAtQuaternionProxyMock {},
}))

let vrma
let loaderInst

beforeEach(() => {
  jest.resetModules()
  loaderInst = { register: jest.fn(), load: jest.fn() }
  require('three/examples/jsm/loaders/GLTFLoader.js').GLTFLoader.mockImplementation(() => loaderInst)
  vrma = require('../../src/lib/vrma.js')
})

function makeMockVRM() {
  return {
    scene: { add: jest.fn() },
    lookAt: { dummy: true },
  }
}

describe('carregarVRMA', () => {
  test('resolve com a primeira animação VRMA do gltf', async () => {
    loaderInst.load.mockImplementation((url, onLoad) => {
      onLoad({ userData: { vrmAnimations: [{ nome: 'anim1' }, { nome: 'anim2' }] } })
    })

    const animacao = await vrma.carregarVRMA('assets/animations/VRMA_01.vrma')
    expect(animacao).toEqual({ nome: 'anim1' })
    expect(loaderInst.load).toHaveBeenCalledWith(
      'assets/animations/VRMA_01.vrma',
      expect.any(Function),
      undefined,
      expect.any(Function),
    )
  })

  test('resolve null quando o gltf não tem animações', async () => {
    loaderInst.load.mockImplementation((url, onLoad) => onLoad({ userData: {} }))

    const animacao = await vrma.carregarVRMA('assets/animations/VRMA_02.vrma')
    expect(animacao).toBeNull()
  })

  test('rejeita quando o loader falha', async () => {
    loaderInst.load.mockImplementation((url, onLoad, onProgress, onError) => onError(new Error('404')))

    await expect(vrma.carregarVRMA('assets/animations/VRMA_03.vrma')).rejects.toThrow('404')
  })

  test('registra o VRMAnimationLoaderPlugin no loader', () => {
    vrma.carregarVRMA('assets/animations/VRMA_04.vrma')
    expect(loaderInst.register).toHaveBeenCalled()
  })
})

describe('criarMixerAnimacao', () => {
  test('cria mixer único no vrm e adiciona proxy de lookAt', () => {
    const { AnimationMixer } = require('three')
    const vrm = makeMockVRM()

    const mixer = vrma.criarMixerAnimacao(vrm)
    expect(AnimationMixer).toHaveBeenCalledWith(vrm.scene)
    expect(vrm._mixer).toBe(mixer)
    expect(vrm._vrmaAtivo).toBe(false)
    expect(vrm.scene.add).toHaveBeenCalled()
  })

  test('não adiciona proxy quando o vrm não tem lookAt', () => {
    const vrm = { scene: { add: jest.fn() } }

    vrma.criarMixerAnimacao(vrm)
    expect(vrm.scene.add).not.toHaveBeenCalled()
  })
})

describe('tocarAnimacaoVRMA', () => {
  test('cria ação para o clip e marca vrm como ativo', () => {
    const vrm = makeMockVRM()
    vrma.criarMixerAnimacao(vrm)

    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' })

    expect(vrm._vrmaAtivo).toBe(true)
    expect(vrm._actionAtual).toBe(action)
    expect(action.reset).toHaveBeenCalled()
    expect(action.play).toHaveBeenCalled()
    expect(action.setEffectiveWeight).toHaveBeenCalledWith(1)
  })

  test('faz crossfade quando já existe ação anterior', () => {
    const vrm = makeMockVRM()
    const mixer = vrma.criarMixerAnimacao(vrm)

    const primeira = vrma.tocarAnimacaoVRMA(vrm, { nome: 'a' })
    const clips = mixer.clipAction.mock.results
    expect(clips).toHaveLength(1)

    const segunda = vrma.tocarAnimacaoVRMA(vrm, { nome: 'b' })

    expect(segunda.action).not.toBe(primeira.action)
    expect(primeira.action.fadeOut).toHaveBeenCalledWith(0.3)
    expect(segunda.action.fadeIn).toHaveBeenCalledWith(0.3)
  })

  test('cria o mixer implicitamente se ainda não existe', () => {
    const vrm = makeMockVRM()

    const { mixer } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' })
    expect(vrm._mixer).toBe(mixer)
  })

  test('loop padrão usa LoopRepeat', () => {
    const { LoopRepeat } = require('three')
    const vrm = makeMockVRM()
    vrma.criarMixerAnimacao(vrm)

    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' })
    expect(action.setLoop).toHaveBeenCalledWith(LoopRepeat)
  })

  test('with loop:false usa LoopOnce e registra o término no mixer', () => {
    const { LoopOnce } = require('three')
    const vrm = makeMockVRM()
    const mixer = vrma.criarMixerAnimacao(vrm)

    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' }, { loop: false })
    expect(action.setLoop).toHaveBeenCalledWith(LoopOnce)
    expect(action.clampWhenFinished).toBe(false)
    expect(mixer.addEventListener).toHaveBeenCalledWith('finished', expect.any(Function))
  })

  test('ao terminar uma animação única, para e volta ao procedural', () => {
    const vrm = makeMockVRM()
    const mixer = vrma.criarMixerAnimacao(vrm)

    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' }, { loop: false, onEnd: jest.fn() })
    const [, handler] = mixer.addEventListener.mock.calls.find(([evento]) => evento === 'finished')
    handler({ type: 'finished', action })

    expect(mixer.removeEventListener).toHaveBeenCalledWith('finished', expect.any(Function))
    expect(action.stop).toHaveBeenCalled()
    expect(vrm._vrmaAtivo).toBe(false)
    expect(vrm._actionAtual).toBeNull()
  })

  test('ignora o término de outra ação que não seja a atual', () => {
    const vrm = makeMockVRM()
    const mixer = vrma.criarMixerAnimacao(vrm)
    const onEnd = jest.fn()

    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'anim' }, { loop: false, onEnd })
    const [, handler] = mixer.addEventListener.mock.calls.find(([evento]) => evento === 'finished')

    const outra = { outro: true }
    handler({ type: 'finished', action: outra })

    expect(action.stop).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  test('trocar animação remove o listener de término da anterior', () => {
    const vrm = makeMockVRM()
    const mixer = vrma.criarMixerAnimacao(vrm)

    const primeira = vrma.tocarAnimacaoVRMA(vrm, { nome: 'a' }, { loop: false })
    const segunda = vrma.tocarAnimacaoVRMA(vrm, { nome: 'b' }, { loop: true })

    expect(mixer.removeEventListener).toHaveBeenCalledWith('finished', expect.any(Function))
    expect(mixer.clipAction).toHaveBeenCalledTimes(2)
    expect(segunda.action).not.toBe(primeira.action)
  })
})

describe('pararAnimacaoVRMA', () => {
  test('faz fade-out da ação atual e desativa o modo VRMA', () => {
    const vrm = makeMockVRM()
    vrma.criarMixerAnimacao(vrm)
    const { action } = vrma.tocarAnimacaoVRMA(vrm, { nome: 'a' })

    vrma.pararAnimacaoVRMA(vrm)

    expect(action.fadeOut).toHaveBeenCalledWith(0.3)
    expect(vrm._vrmaAtivo).toBe(false)
    expect(vrm._actionAtual).toBeNull()
  })

  test('não faz nada quando não há mixer', () => {
    const vrm = makeMockVRM()
    vrma.pararAnimacaoVRMA(vrm)
    expect(vrm._vrmaAtivo).toBeUndefined()
  })
})