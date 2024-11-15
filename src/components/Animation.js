import React, { useEffect, useRef } from 'react'; 
// Import React and necessary hooks, useEffect and useRef, for managing side effects and references

import * as THREE from 'three'; 
// Import the entire THREE.js library for 3D graphics rendering

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
// Import OrbitControls, which allows for interactive camera control in the scene

import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'; 
// Import FBXLoader for loading FBX models into the scene

const Animation = () => { 
    // Define a functional component called Animation
    const mountRef = useRef(null); 
    // useRef hook to create a reference to mount the renderer's DOM element

    let mixer; 
    // Declare a variable to store the AnimationMixer for handling animations

    useEffect(() => { 
        // useEffect hook for running side effects like setting up the scene when the component mounts

        const manager = new THREE.LoadingManager(); 
        // Create a LoadingManager to handle the loading process of assets

        let camera, scene, renderer, controls; 
        // Declare variables for the camera, scene, renderer, and controls

        const clock = new THREE.Clock(); 
        // Create a clock instance to track time for animation updates

        const params = { asset: 'Samba Dancing' };  
        // Declare the asset to load (this will be the default model name)

        const init = () => { 
            // Initialize the scene and its components
            if (mountRef.current) { 
                // Check if the mountRef is assigned to a DOM element
                mountRef.current.innerHTML = ''; 
                // Clear any previous contents inside the DOM element referenced by mountRef
            }

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000); 
            // Set up a perspective camera with a 45-degree field of view and the aspect ratio based on the window size
            camera.position.set(100, 200, 300); 
            // Set the camera's initial position in the 3D space

            scene = new THREE.Scene(); 
            // Create a new scene to hold all 3D objects, lights, and camera
            scene.background = new THREE.Color(0xa0a0a0); 
            // Set the scene's background color to a light gray
            scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000); 
            // Add fog to the scene with specific start and end distances

            // Lighting setup
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5); 
            // Create a hemisphere light with color on the sky and ground
            hemiLight.position.set(0, 200, 0); 
            // Set its position in the 3D space
            scene.add(hemiLight); 
            // Add the hemisphere light to the scene

            const dirLight = new THREE.DirectionalLight(0xffffff, 5); 
            // Create a directional light (like sunlight) with a white color and intensity 5
            dirLight.position.set(0, 200, 100); 
            // Set its position
            dirLight.castShadow = true; 
            // Enable shadow casting for the directional light
            scene.add(dirLight); 
            // Add the directional light to the scene

            // Ground setup
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })); 
            // Create a large plane to represent the ground, with a gray color and no depth writing
            mesh.rotation.x = -Math.PI / 2; 
            // Rotate the plane to lie flat on the ground (90 degrees around X-axis)
            mesh.receiveShadow = true; 
            // Allow the plane to receive shadows
            scene.add(mesh); 
            // Add the ground mesh to the scene

            const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000); 
            // Create a grid helper to display a grid pattern on the ground
            grid.material.opacity = 0.2; 
            // Set the grid's opacity to make it semi-transparent
            grid.material.transparent = true; 
            // Enable transparency for the grid
            scene.add(grid); 
            // Add the grid to the scene

            // Load the asset (model) using FBXLoader
            const loader = new FBXLoader(manager); 
            loadAsset(params.asset, loader, scene); // Load the default asset (e.g., Samba Dancing)

            renderer = new THREE.WebGLRenderer({ antialias: true }); 
            // Create a WebGL renderer with antialiasing enabled for smoother edges
            renderer.setPixelRatio(window.devicePixelRatio); 
            // Set the pixel ratio based on the device's devicePixelRatio
            renderer.setSize(window.innerWidth, window.innerHeight); 
            // Set the renderer's size to fill the entire window
            renderer.shadowMap.enabled = true; 
            // Enable shadow mapping in the renderer

            // Append the renderer's DOM element to the mountRef element
            mountRef.current.appendChild(renderer.domElement);

            // Initialize controls for interacting with the scene
            controls = new OrbitControls(camera, renderer.domElement); 
            // Set up OrbitControls to allow the user to control the camera with mouse movement
            controls.target.set(0, 100, 0); 
            // Set the target point for camera rotation (center of the scene)
            controls.update(); 
            // Update the controls to apply the changes

            // Disable user interaction with the scene for better control
            controls.enableZoom = false; 
            controls.enableRotate = false; 
            controls.enablePan = false; 

            // Listen for window resizing and update the renderer accordingly
            window.addEventListener('resize', onWindowResize);
        };

        const loadAsset = (asset, loader, scene) => { 
            // Function to load an asset (model) using the loader
            loader.load(`/fbx/${asset}.fbx`, (group) => { 
                // Load the FBX model from the specified path and handle it as a group
                // Clear previous object if present
                if (scene.children.some((obj) => obj.type === 'Group')) { 
                    scene.remove(scene.children.find((obj) => obj.type === 'Group')); 
                }

                const object = group; 
                // Set the loaded group as the object to be added to the scene

                if (object.animations && object.animations.length) { 
                    // If the object has animations, set up the animation mixer
                    mixer = new THREE.AnimationMixer(object); 
                    // Create a new animation mixer to control animations for the object
                    const action = mixer.clipAction(object.animations[0]); 
                    // Get the first animation and create an action for it
                    action.play(); 
                    // Play the animation
                }

                scene.add(object); 
                // Add the loaded object to the scene
            });
        };

        const onWindowResize = () => { 
            // Function to handle window resizing
            camera.aspect = window.innerWidth / window.innerHeight; 
            // Update the camera's aspect ratio to match the new window size
            camera.updateProjectionMatrix(); 
            // Update the camera's projection matrix to reflect the new aspect ratio
            renderer.setSize(window.innerWidth, window.innerHeight); 
            // Resize the renderer to match the new window size
        };

        const animate = () => { 
            // Animation loop function to continuously render the scene
            requestAnimationFrame(animate); 
            // Request the next frame of animation

            const delta = clock.getDelta(); 
            // Get the time difference between the current and previous frame
            if (mixer) mixer.update(delta * 0.65); 
            // Update the animation mixer with the time difference, multiplying for speed control
            renderer.render(scene, camera); 
            // Render the scene from the camera's perspective
        };

        init(); 
        // Call the init function to set up the scene
        animate(); 
        // Start the animation loop

        return () => { 
            // Cleanup function to run when the component unmounts
            window.removeEventListener('resize', onWindowResize); 
            // Remove the resize event listener
            if (renderer) renderer.dispose(); 
            // Dispose of the renderer to free up resources
            if (mixer) mixer.uncacheRoot(scene); 
            // Uncache the scene's root from the mixer to stop animation updates
        };
    }, []); 
    // The empty dependency array ensures the effect runs only once, when the component mounts

    return <div ref={mountRef} />; 
    // Render the div element that will hold the Three.js canvas (via the mountRef)
};

export default Animation; 
// Export the Animation component to be used in other parts of the application
