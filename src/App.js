import { useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls } from "@react-three/drei";
import "./App.css";

const findByName = (meshs, name) => meshs.find((mesh) => mesh.name === name);

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

function App() {
  return (
    <div>
      <Canvas
        gl={{
          outputEncoding: THREE.sRGBEncoding,
          alpha: false,
          setClearColor: new THREE.Color(0, 0, 0),
        }}
      >
        <OrbitControls />

        <Suspense fallback={null}>
          <Portal />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
