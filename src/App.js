import { useRef, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls } from "@react-three/drei";
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

  return null;
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

  const positionArray = useMemo(() => {
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3 + 0] = (Math.random() - 0.5) * 4;
      array[i * 3 + 1] = Math.random() * 1.5;
      array[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    return array;
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      pointsRef.current.material.uniforms.uSize.value = Math.min(
        window.devicePixelRatio,
        2
      );
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [pointsRef]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry
        attributes={{ position: new THREE.BufferAttribute(positionArray, 3) }}
      />
      <shaderMaterial
        uniforms={{
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uSize: { value: 100 },
        }}
        vertexShader={firefliesVertexShader}
        fragmentShader={firefliesFragmentShader}
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
