import { useRef, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls, Stats } from "@react-three/drei";
import { useControls, button } from "leva";
import "./App.css";

// eslint-disable-next-line import/no-webpack-loader-syntax
import firefliesVertexShader from "!!raw-loader!./shaders/fireflies.vert";
// eslint-disable-next-line import/no-webpack-loader-syntax
import firefliesFragmentShader from "!!raw-loader!./shaders/fireflies.frag";

const findByName = (meshs, name) => meshs.find((mesh) => mesh.name === name);

function Dev() {
  const three = useThree();

  useControls({ camera: button(() => console.log(three)) });

  return <Stats />;
}

function Portal() {
  const { scene } = useGLTF("portal.glb");
  const backedTexture = useTexture("baked.jpg");

  useEffect(() => {
    const { children } = scene;

    // backed
    const backedMesh = findByName(children, "Plane001");
    backedMesh.material = new THREE.MeshBasicMaterial({ map: backedTexture });
    backedTexture.flipY = false;
    backedTexture.encoding = THREE.sRGBEncoding;

    // lights
    const portalMaterial = new THREE.MeshBasicMaterial({ color: "#fefefe" });
    const poleLightMaterial = new THREE.MeshBasicMaterial({ color: "#fffffc" });

    const portalLight = findByName(children, "portalLight");
    const poleLightRight = findByName(children, "poleLightRight");
    const poleLightLeft = findByName(children, "poleLightLeft");

    portalLight.material = portalMaterial;
    poleLightRight.material = poleLightMaterial;
    poleLightLeft.material = poleLightMaterial;
  }, [scene, backedTexture]);

  return <primitive object={scene} />;
}

function Fireflies() {
  const pointsRef = useRef(null);

  const { count } = useControls("fireflies", {
    count: {
      value: 30,
      min: 0,
      max: 100,
      step: 1,
    },
    size: {
      value: 100,
      min: 0,
      max: 500,
      onChange: (value) => {
        pointsRef.current.material.uniforms.uSize.value = Number(value);
      },
    },
  });


  useFrame((state) => {
    pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  })

  const fireflies = useMemo(() => {
    const position = new Float32Array(count * 3);
    const scale = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      position[i * 3 + 0] = (Math.random() - 0.5) * 4;
      position[i * 3 + 1] = Math.random() * 1.5;
      position[i * 3 + 2] = (Math.random() - 0.5) * 4;
      scale[i] = Math.random();
    }

    return { position, scale };
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      const updatedPixelRatio = Math.min(window.devicePixelRatio, 2);
      pointsRef.current.material.uniforms.uSize.value = updatedPixelRatio;
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [pointsRef]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry
        attributes={{
          position: new THREE.BufferAttribute(fireflies.position, 3),
          aScale: new THREE.BufferAttribute(fireflies.scale, 1),
        }}
      />
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={firefliesFragmentShader}
        transparent={true}
        uniforms={{
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uSize: { value: 100 },
          uTime: { value: 0 },
        }}
        vertexShader={firefliesVertexShader}
      />
    </points>
  );
}

function App() {
  return (
    <div>
      <Canvas
        camera={{ position: [3, 2, 3.5] }}
        gl={{
          alpha: false,
          outputEncoding: THREE.sRGBEncoding,
          setClearColor: new THREE.Color(0, 0, 0),
        }}
      >
        <Dev />
        <OrbitControls />

        <Suspense fallback={null}>
          <Portal />
        </Suspense>

        <Fireflies />
      </Canvas>
    </div>
  );
}

export default App;
