import { VRMUtils } from '@pixiv/three-vrm'


const POSE = {
  spread: 0.12, 
  forward: 0.18, 
  elbow: 0.25,    
}


const VOWEL_NAMES = {
  aa: ["aa", "A", "a"],
  ih: ["ih", "I", "i"],
  uu: ["ou", "U", "uu", "u"],
  eh: ["ee", "E", "eh", "e"],
  oh: ["oh", "O", "o"],
}

export function setExpr(expr, names, value) {
  for (const name of names) {
    if (expr.getExpression?.(name)) {
      expr.setValue(name, value)
    }
  }
}


export function prepararAvatar(scene, vrm) {
  VRMUtils.removeUnnecessaryVertices(scene)
  VRMUtils.combineSkeletons(scene)
  VRMUtils.combineMorphs(vrm)

  VRMUtils.rotateVRM0(vrm)

  vrm.scene.traverse((obj) => {
    obj.frustumCulled = false
  })

  
  vrm._isVRM0 = vrm.meta?.metaVersion === "0"

 
  const head = vrm.humanoid?.getNormalizedBoneNode("head")
  vrm._headBind = head ? { x: head.rotation.x, y: head.rotation.y } : { x: 0, y: 0 }
}

function applyArmPose(humanoid, armAngle, sway, isVRM0) {
  const sign = isVRM0 ? 1 : -1
  const leftUpperArm = humanoid?.getNormalizedBoneNode("leftUpperArm")
  const rightUpperArm = humanoid?.getNormalizedBoneNode("rightUpperArm")
  const leftLowerArm = humanoid?.getNormalizedBoneNode("leftLowerArm")
  const rightLowerArm = humanoid?.getNormalizedBoneNode("rightLowerArm")

  if (leftUpperArm) {
    leftUpperArm.rotation.set(POSE.forward, 0, sign * (armAngle - POSE.spread + sway))
  }
  if (rightUpperArm) {
    rightUpperArm.rotation.set(POSE.forward, 0, sign * (-armAngle + POSE.spread - sway))
  }
  if (leftLowerArm) leftLowerArm.rotation.set(0, -POSE.elbow, 0)
  if (rightLowerArm) rightLowerArm.rotation.set(0, POSE.elbow, 0)
}


function applyIdleMotion(humanoid, t, breath) {
  const chest = humanoid?.getNormalizedBoneNode("chest")
  if (chest) chest.rotation.x = breath * 0.02

  const spine = humanoid?.getNormalizedBoneNode("spine")
  if (spine) spine.rotation.y = Math.sin(t * 0.6) * 0.03
}


function applyHead(humanoid, bind, t, gesture, mouse) {
  const head = humanoid?.getNormalizedBoneNode("head")
  if (!head) return

  let offX = Math.sin(t * 0.8) * 0.02 
  let offY = 0

  if (gesture) {
    const osc = Math.sin(t * 9) * 0.25
    if (gesture === "nod") offX = osc
    else if (gesture === "shake") offY = osc
  } else if (mouse) {
    offX = -mouse.y * 0.12
    offY = mouse.x * 0.18
  }

  head.rotation.x = bind.x + offX
  head.rotation.y = bind.y + offY
}


function applyEmotion(expr, emotion) {
  const values = {
    happy: { joy: 1, neutral: 0, sorrow: 0, anger: 0 },
    sad: { joy: 0, neutral: 0, sorrow: 1, anger: 0 },
    angry: { joy: 0, neutral: 0, sorrow: 0, anger: 1 },
    playful: { joy: 0.8, neutral: 0, sorrow: 0, anger: 0 },
    neutral: { joy: 0, neutral: 1, sorrow: 0, anger: 0 },
  }[emotion] || { joy: 0, neutral: 1, sorrow: 0, anger: 0 }

  setExpr(expr, ["joy", "Joy"], values.joy)
  setExpr(expr, ["sorrow", "Sorrow"], values.sorrow)
  setExpr(expr, ["anger", "Angry"], values.anger)
  setExpr(expr, ["neutral", "Neutral"], values.neutral)
}

function applyBlink(expr, t, eyesClosed = false) {
  const blink = eyesClosed ? 1 : (Math.sin(t * 2.5) > 0.97 ? 1 : 0)
  setExpr(expr, ["blink", "Blink"], blink)
}
function applyLipSync(expr, intensities) {
  const v = intensities || {}
  setExpr(expr, VOWEL_NAMES.aa, v.aa ?? 0)
  setExpr(expr, VOWEL_NAMES.ih, v.ih ?? 0)
  setExpr(expr, VOWEL_NAMES.uu, v.uu ?? 0)
  setExpr(expr, VOWEL_NAMES.eh, v.eh ?? 0)
  setExpr(expr, VOWEL_NAMES.oh, v.oh ?? 0)
}

/**
 * @param {object} vrm 
 * @param {number} t 
 * @param {number} delta 
 * @param {object} intensities 
 * @param {number} armAngle 
 * @param {string|null} gesture 
 * @param {boolean} eyesClosed 
 * @param {{x:number,y:number}|null} mouse 
 */
export function animarAvatar(vrm, t, delta, intensities, armAngle = 1.0, gesture = null, eyesClosed = false, mouse = null, emotion = "neutral") {
  const humanoid = vrm.humanoid
  const breath = Math.sin(t * 1.5)

  applyArmPose(humanoid, armAngle, breath * 0.02, vrm._isVRM0)
  applyIdleMotion(humanoid, t, breath)
  applyHead(humanoid, vrm._headBind ?? { x: 0, y: 0 }, t, gesture, mouse)

  const expr = vrm.expressionManager
  if (expr) {
    applyBlink(expr, t, eyesClosed)
    applyLipSync(expr, intensities)
    applyEmotion(expr, emotion)
  }

  vrm.update(delta)
}
