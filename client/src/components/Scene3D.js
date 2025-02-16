import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import React from 'react'
import * as THREE from 'three'
import { useState } from 'react'

const testData = {
    arousal: [1.0, 0.5623, 0.8391, 0.587, 0.6122, 0.3325, 0.1177, 0.4345, 0.956, 0.8919],
    dominance: [0.9571, 0.5887, 0.7914, 0.5969, 0.597, 0.4325, 0.2521, 0.5236, 0.9302, 0.9012],
    valence: [0.2811, 0.4389, 0.3126, 0.513, 0.693, 0.346, 0.1785, 0.2195, 0.1624, 0.2003],
    stress: [0.9495, 0.316, 0.6812, 0.3339, 0.3416, 0.1309, 0.033, 0.2171, 0.8934, 0.7807],
    three_d: [
        [0.21, 0.2811, 1.0],
        [0.5887, 0.389, 0.5623],
        [0.7914, 0.3126, 0.8391],
        [0.169, 0.513, 0.587],
        [0.697, 0.693, 0.6122],
        [0.2325, 0.346, 0.3325],
        [0.2521, 0.7785, 0.1177],
        [0.5236, 0.2195, 0.1345],
        [0.9302, 0.1624, 0.456],
        [0.1012, 0.2003, 0.8919]
    ]
};

function AxisVisualization() {
  const meshRef = useRef()
  const isClicking = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationMode = useRef('default')
  const zoomLevel = useRef(50)

  // Define color stops for the rainbow gradient
  const colorStops = [
    new THREE.Color('#FF0000'), // red
    new THREE.Color('#FF7F00'), // orange
    new THREE.Color('#FFFF00'), // yellow
    new THREE.Color('#00FF00'), // green
    new THREE.Color('#87CEFA'), // light blue
    new THREE.Color('#0000FF'), // blue
    new THREE.Color('#800080')  // purple
  ];
  
  // Convert three_d data to array of points, swapping x and y
  const points = testData.three_d.map(point => [
    point[1] * 5 - 2.5,  // Now using point[1] for x (previously y)
    point[0] * 5 - 2.5,  // Now using point[0] for y (previously x)
    point[2] * 5 - 2.5   // z stays the same
  ])

  // Create a smooth curve through all points with increased curvature
  const curve = new THREE.CatmullRomCurve3(
    points.map(point => new THREE.Vector3(...point)),
    false,
    'catmullrom', // changed from 'centripetal' for smoother curve
    0.5 // reduced tension for smoother curve
  );

  // Increase number of segments and reduce radius for smoother appearance
  const tubeGeometry = new THREE.TubeGeometry(
    curve,
    200,  // increased segments for smoother curve
    0.02, // reduced radius
    12,   // increased radial segments
    false
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 colorStops[7];
    
    vec3 getGradientColor(float t) {
      float index = t * 6.0;  // Removed the reversal, now matches dots
      int i = int(index);
      float f = fract(index);
      
      if (i >= 6) return colorStops[6];
      return mix(colorStops[i], colorStops[i + 1], f);
    }
    
    void main() {
      vec3 color = getGradientColor(vUv.x);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isClicking.current) return

      const deltaX = (e.clientX - previousMousePosition.current.x) * 0.01

      if (e.shiftKey) {
        // Z-axis rotation
        meshRef.current.rotateZ(deltaX)
      } else if (e.altKey) {
        // No vertical rotation in alt mode
      } else {
        // Only horizontal rotation around world Y axis
        meshRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), deltaX)
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isClicking.current = false
    }

    const handleKeyDown = (e) => {
      if (e.shiftKey) rotationMode.current = 'shift'
      if (e.altKey) rotationMode.current = 'alt'
    }

    const handleKeyUp = () => {
      rotationMode.current = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handlePointerDown = (e) => {
    isClicking.current = true
    previousMousePosition.current = { x: e.clientX, y: e.clientY }
  }

  return (
    <group ref={meshRef} onPointerDown={handlePointerDown}>
      {/* Cube Edges */}
      {[
        // Bottom face
        [[-2.5, -2.5, -2.5], [2.5, -2.5, -2.5]],
        [[-2.5, -2.5, -2.5], [-2.5, -2.5, 2.5]],
        [[2.5, -2.5, -2.5], [2.5, -2.5, 2.5]],
        [[-2.5, -2.5, 2.5], [2.5, -2.5, 2.5]],
        
        // Top face
        [[-2.5, 2.5, -2.5], [2.5, 2.5, -2.5]],
        [[-2.5, 2.5, -2.5], [-2.5, 2.5, 2.5]],
        [[2.5, 2.5, -2.5], [2.5, 2.5, 2.5]],
        [[-2.5, 2.5, 2.5], [2.5, 2.5, 2.5]],
        
        // Vertical edges
        [[-2.5, -2.5, -2.5], [-2.5, 2.5, -2.5]],
        [[2.5, -2.5, -2.5], [2.5, 2.5, -2.5]],
        [[-2.5, -2.5, 2.5], [-2.5, 2.5, 2.5]],
        [[2.5, -2.5, 2.5], [2.5, 2.5, 2.5]]
      ].map(([start, end], index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...start, ...end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#404040" opacity={0.3} transparent />
        </line>
      ))}

      {/* Corner Labels */}
      <Text 
         position={[-2.5, -2.5, -2.5]} 
         fontSize={0.2}
         color="black"
         anchorX="right"
         anchorY="bottom"
         renderOrder={6}
         depthTest={false}
         outlineWidth={0.005}
         outlineColor="#FFFFFF"
      >
        Sad
      </Text>

      <Text 
        position={[2.5, -2.5, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Relieved
      </Text>

      <Text 
        position={[-2.5, 2.5, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Angry
      </Text>

      <Text 
        position={[-2.5, -2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Dejected
      </Text>

      <Text 
        position={[2.5, 2.5, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Elated
      </Text>

      <Text 
        position={[2.5, -2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Over-confident
      </Text>

      <Text 
        position={[-2.5, 2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Anxious
      </Text>

      {/* New Alerted label at midpoint */}
      <Text 
        position={[0, 2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Alerted
      </Text>

      <Text 
        position={[2.5, 2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Excited
      </Text>

      {/* New Enjoying label between Elated and Excited */}
      <Text 
        position={[2.5, 2.5, 0]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Enjoying
      </Text>

      {/* New Surprised label between Elated and Angry */}
      <Text 
        position={[0, 2.5, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Surprised
      </Text>

      {/* New Distressed label between Angry and Anxious */}
      <Text 
        position={[-2.5, 2.5, 0]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Distressed
      </Text>

      {/* New Pessimistic label between Anxious and Dejected */}
      <Text 
        position={[-2.5, 0, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Pessimistic
      </Text>

      {/* New Deceived label between Sad and Angry */}
      <Text 
        position={[-2.5, 0, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Deceived
      </Text>

      {/* New Optimistic label between Excited and Overconfident */}
      <Text 
        position={[2.5, 0, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Optimistic
      </Text>

      {/* New Satisfied label between Elated and Relieved */}
      <Text 
        position={[2.5, 0, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Satisfied
      </Text>

      {/* New Calm label between Dejected and Overconfident */}
      <Text 
        position={[0, -2.5, 2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Calm
      </Text>

      {/* New Relaxed label between Overconfident and Relieved */}
      <Text 
        position={[2.5, -2.5, 0]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Relaxed
      </Text>

      {/* New Fatigued label between Sad and Relieved */}
      <Text 
        position={[0, -2.5, -2.5]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Fatigued
      </Text>

      {/* New Bored label between Sad and Dejected */}
      <Text 
        position={[-2.5, -2.5, 0]} 
        fontSize={0.2}
        color="black"
        anchorX="right"
        anchorY="bottom"
        renderOrder={6}
        depthTest={false}
        outlineWidth={0.005}
        outlineColor="#FFFFFF"
      >
        Bored
      </Text>

      {/* Points and tube segments section - replace the existing mapping with this */}
      {points.map((point, index) => {
        // Calculate color based on position in sequence
        const t = index / (points.length - 1);
        const colorIndex = t * (colorStops.length - 1);
        const lowerIndex = Math.floor(colorIndex);
        const upperIndex = Math.min(lowerIndex + 1, colorStops.length - 1);
        const fraction = colorIndex - lowerIndex;

        const color = new THREE.Color();
        color.lerpColors(
          colorStops[lowerIndex],
          colorStops[upperIndex],
          fraction
        );

        return (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.05]} /> {/* Reduced sphere size */}
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.8} // Reduced intensity
            />
          </mesh>
        );
      })}

      {/* Single continuous tube */}
      <mesh>
        <primitive object={tubeGeometry} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            colorStops: { value: colorStops }
          }}
        />
      </mesh>

      {/* Add Time Legend */}
      <group position={[2.8, 0, -2.5]}>
        {/* Front plane */}
        <mesh position={[0, 0, 0.001]}>  {/* Slightly offset forward */}
          <planeGeometry args={[0.3, 2.5]} />
          <shaderMaterial
            fragmentShader={`
              varying vec2 vUv;
              uniform vec3 colorStops[7];
              
              vec3 getGradientColor(float t) {
                float index = t * 6.0;
                int i = int(index);
                float f = fract(index);
                
                if (i >= 6) return colorStops[6];
                return mix(colorStops[i], colorStops[i + 1], f);
              }
              
              void main() {
                vec3 color = getGradientColor(vUv.y);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            uniforms={{
              colorStops: { value: colorStops }
            }}
          />
        </mesh>

        {/* Back plane */}
        <mesh position={[0, 0, -0.001]}>  {/* Slightly offset backward */}
          <planeGeometry args={[0.3, 2.5]} />
          <shaderMaterial
            fragmentShader={`
              varying vec2 vUv;
              uniform vec3 colorStops[7];
              
              vec3 getGradientColor(float t) {
                float index = t * 6.0;
                int i = int(index);
                float f = fract(index);
                
                if (i >= 6) return colorStops[6];
                return mix(colorStops[i], colorStops[i + 1], f);
              }
              
              void main() {
                vec3 color = getGradientColor(vUv.y);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            uniforms={{
              colorStops: { value: colorStops }
            }}
          />
        </mesh>
        
        {/* Legend Labels */}
        <Text
          position={[0.3, 1.2, 0]}
          fontSize={0.2}
          color="#000000"
          anchorX="left"
          anchorY="middle"
          renderOrder={6}
          depthTest={false}
          outlineWidth={0.005}
          outlineColor="#FFFFFF"
        >
          t=1
        </Text>
        <Text
          position={[0.3, -1.2, 0]}
          fontSize={0.2}
          color="#000000"
          anchorX="left"
          anchorY="middle"
          renderOrder={6}
          depthTest={false}
          outlineWidth={0.005}
          outlineColor="#FFFFFF"
        >
          t=0
        </Text>
      </group>
    </group>
  )
}

function Scene3D() {
  const [zoom, setZoom] = useState(50)

  const handleWheel = (e) => {
    e.preventDefault()
    setZoom(prevZoom => {
      const newZoom = prevZoom - e.deltaY * 0.1
      return Math.min(Math.max(newZoom, 20), 100)
    })
  }

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '400px',
        border: '2px solid #3498db',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)',
        overflow: 'hidden'
      }}
      onWheel={handleWheel}
    >
      <Canvas 
        orthographic 
        camera={{ 
          position: [7.5, 7.5, 7.5],  // Changed y coordinate to 7.5 to rotate 90 degrees CCW
          zoom: zoom,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AxisVisualization />
      </Canvas>
    </div>
  )
}

export default Scene3D