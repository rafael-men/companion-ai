import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { useEffect, useRef } from "react";
import { prepararAvatar, animarAvatar } from "@/lib/vrm";
import { useTextLipSync } from "@/hooks/useTextLipSync";

export const VRMAvatar = ({ avatar, speaking = false, speechText = "", armAngle = 1.0, gesture = null, emotion = "neutral", lipSyncIntensity = 1, eyesClosed = false, ...props }) => {
    const { scene, userData } = useGLTF(`models/${avatar}`, undefined, undefined, (loader) => {
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });
    });


    const intensities = useTextLipSync(speechText, speaking, lipSyncIntensity);
    const intensitiesRef = useRef(intensities);
    intensitiesRef.current = intensities;


    const armAngleRef = useRef(armAngle);
    armAngleRef.current = armAngle;
    const gestureRef = useRef(gesture);
    gestureRef.current = gesture;
    const eyesClosedRef = useRef(eyesClosed);
    eyesClosedRef.current = eyesClosed;


    const mouseRef = useRef({ x: 0, y: 0 });
    useEffect(() => {
        const onMove = (e) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    useEffect(() => {
        prepararAvatar(scene, userData.vrm);
    }, [scene]);

    useFrame((state, delta) => {
        const vrm = userData.vrm;
        if (!vrm) return;
        animarAvatar(
            vrm,
            state.clock.elapsedTime,
            delta,
            intensitiesRef.current,
            armAngleRef.current,
            gestureRef.current,
            eyesClosedRef.current,
            mouseRef.current,
            emotion
        );
    });

    return (
        <group {...props}>
            <primitive object={scene} />
        </group>
    );
};
