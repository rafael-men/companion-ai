import { setExpr, animarAvatar, prepararAvatar } from '../../src/lib/vrm.js'

jest.mock('@pixiv/three-vrm', () => ({
  VRMUtils: {
    removeUnnecessaryVertices: jest.fn(),
    combineSkeletons: jest.fn(),
    combineMorphs: jest.fn(),
    rotateVRM0: jest.fn(),
  },
}))

function makeMockExpressionManager() {
  const expressions = new Map(['joy', 'sorrow', 'anger', 'neutral', 'blink', 'aa', 'ih', 'uu', 'eh', 'oh'].map(n => [n, 0]))
  return {
    getExpression: jest.fn((name) => expressions.has(name) ? name : null),
    setValue: jest.fn((name, value) => { expressions.set(name, value) }),
    _expressions: expressions,
  }
}

function makeMockVRM() {
  const bones = new Map()
  const makeBone = () => ({ rotation: { set: jest.fn(), x: 0, y: 0, z: 0 } })

  for (const name of ['head', 'leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm', 'chest', 'spine']) {
    bones.set(name, makeBone())
  }

  return {
    humanoid: {
      getNormalizedBoneNode: jest.fn((name) => bones.get(name) || null),
    },
    expressionManager: makeMockExpressionManager(),
    scene: { traverse: jest.fn() },
    meta: { metaVersion: '1.0' },
    _isVRM0: false,
    _headBind: { x: 0, y: 0 },
    update: jest.fn(),
  }
}

describe('setExpr', () => {
  test('chama setValue para cada nome encontrado', () => {
    const expr = {
      getExpression: jest.fn((name) => name === 'aa' ? 'aa' : null),
      setValue: jest.fn(),
    }

    setExpr(expr, ['aa', 'A', 'a'], 0.5)
    expect(expr.setValue).toHaveBeenCalledTimes(1)
    expect(expr.setValue).toHaveBeenCalledWith('aa', 0.5)
  })

  test('não chama setValue para nomes não encontrados', () => {
    const expr = {
      getExpression: jest.fn(() => null),
      setValue: jest.fn(),
    }

    setExpr(expr, ['aa', 'A'], 0.8)
    expect(expr.setValue).not.toHaveBeenCalled()
  })

  test('chama setValue para múltiplos nomes válidos', () => {
    const expr = {
      getExpression: jest.fn(() => 'found'),
      setValue: jest.fn(),
    }

    setExpr(expr, ['aa', 'A', 'a'], 1.0)
    expect(expr.setValue).toHaveBeenCalledTimes(3)
  })
})

describe('prepararAvatar', () => {
  test('chama VRMUtils funções de otimização', () => {
    const { VRMUtils } = require('@pixiv/three-vrm')
    const scene = { traverse: jest.fn() }
    const vrm = makeMockVRM()
    vrm.scene = scene

    prepararAvatar(scene, vrm)

    expect(VRMUtils.removeUnnecessaryVertices).toHaveBeenCalledWith(scene)
    expect(VRMUtils.combineSkeletons).toHaveBeenCalledWith(scene)
    expect(VRMUtils.combineMorphs).toHaveBeenCalledWith(vrm)
    expect(VRMUtils.rotateVRM0).toHaveBeenCalledWith(vrm)
  })

  test('desabilita frustumCulled em todos os objetos', () => {
    const mockObj = { frustumCulled: true }
    const scene = { traverse: jest.fn((cb) => cb(mockObj)) }
    const vrm = makeMockVRM()
    vrm.scene = scene

    prepararAvatar(scene, vrm)
    expect(mockObj.frustumCulled).toBe(false)
  })

  test('detecta VRM0 e salva head bind', () => {
    const scene = { traverse: jest.fn() }
    const vrm = makeMockVRM()
    vrm.meta = { metaVersion: '0' }
    vrm.scene = scene

    prepararAvatar(scene, vrm)
    expect(vrm._isVRM0).toBe(true)
  })
})

describe('animarAvatar', () => {
  test('chama vrm.update com delta', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 0, 0.016, null, 1.0, null, false, null, 'neutral')
    expect(vrm.update).toHaveBeenCalledWith(0.016)
  })

  test('aplica lip-sync quando intensidades fornecidas', () => {
    const vrm = makeMockVRM()
    const intensities = { aa: 1, ih: 0, uu: 0, eh: 0, oh: 0 }
    animarAvatar(vrm, 0, 0.016, intensities)
    expect(vrm.expressionManager.setValue).toHaveBeenCalled()
  })

  test('aplica emoção', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 0, 0.016, null, 1.0, null, false, null, 'happy')
    expect(vrm.expressionManager.setValue).toHaveBeenCalled()
  })

  test('aplica gesto nod ao head', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 1, 0.016, null, 1.0, 'nod', false, null)
    expect(vrm.humanoid.getNormalizedBoneNode).toHaveBeenCalledWith('head')
  })

  test('aplica gesto shake ao head', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 1, 0.016, null, 1.0, 'shake', false, null)
    expect(vrm.humanoid.getNormalizedBoneNode).toHaveBeenCalledWith('head')
  })

  test('aplica mouse tracking quando fornecido', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 1, 0.016, null, 1.0, null, false, { x: 0.5, y: 0.5 })
    expect(vrm.humanoid.getNormalizedBoneNode).toHaveBeenCalledWith('head')
  })

  test('aplica blink quando eyesClosed true', () => {
    const vrm = makeMockVRM()
    animarAvatar(vrm, 0, 0.016, null, 1.0, null, true, null)
    expect(vrm.expressionManager.setValue).toHaveBeenCalled()
  })

  test('atualiza o mixer quando existe', () => {
    const vrm = makeMockVRM()
    vrm._mixer = { update: jest.fn() }
    animarAvatar(vrm, 0, 0.016)
    expect(vrm._mixer.update).toHaveBeenCalledWith(0.016)
  })

  test('quando VRMA ativo não aplica pose procedural mas mantém expressões', () => {
    const vrm = makeMockVRM()
    vrm._vrmaAtivo = true
    vrm._mixer = { update: jest.fn() }

    animarAvatar(vrm, 0, 0.016, { aa: 1 }, 1.0, 'nod', false, null, 'happy')

    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm')
    expect(leftUpperArm.rotation.set).not.toHaveBeenCalled()
    expect(vrm.expressionManager.setValue).toHaveBeenCalled()
    expect(vrm.update).toHaveBeenCalledWith(0.016)
  })
})
