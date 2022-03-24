// /** @type {HTMLCanvasElement} */
// const canvas=document.querySelector("#canvas1");
// const ctx = canvas.getContext('2d');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// import * as THREE from './three.js-master/build/three.module.js'
// import {GLTFExporter} from './examples/jsm/exporters/GLTFExporter.js'

import * as THREE from 'three';

		import { OBJLoader } from './examples/jsm/loaders/OBJLoader.js';
		import { GLTFExporter } from './examples/jsm/exporters/GLTFExporter.js';
        import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';


let button = document.querySelector("button");
let downloadButton = document.querySelector("#download-button");
// let cloneButton = document.querySelector("#clone-button");
let pInput = document.querySelector("#positivity-input");
let jInput = document.querySelector("#jitter-input");
let timeInput = document.querySelector("#time-input");

// let jitter = 1.2; // keep between 0.25 to 1.5 for less to more jitter

let tubeRadius = 1.75;
let speedXZone, speedYZone, tubeColor, jitter;

let pZone, jZone, time, pZoneNum, jZoneNum, tube, newTube, angle;

let x = 0;
let y = 0;
let z = 0;

// 3d

let threeDDiv = document.querySelector("#three");

async function threeD() {

    let dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
        margin: {
        top: 100,
        right: 70,
        bottom: 100,
        left: 70,
        },
    };
 
    threeDDiv.setAttribute("style", "width :" + dimensions.width + "px; height :" + dimensions.height + "px");

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xFFFFFF);

    const camera = new THREE.PerspectiveCamera(10, dimensions.width/dimensions.height, 1, 10000);

    const renderer = new THREE.WebGLRenderer({antialias : true});

    renderer.setSize(dimensions.width, dimensions.height);
    threeDDiv.appendChild(renderer.domElement);

    const lights = new THREE.HemisphereLight(0xFFFFFF, 0.8);
    scene.add(lights);

    const lightsDown = new THREE.HemisphereLight(0x000000, 0xffffff, 0.4);
    scene.add(lightsDown);

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    scene.add( directionalLight );

    camera.position.set(-dimensions.height/2,dimensions.height,dimensions.height*3);

    // orbit controls

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;

    // three.js sphere object

    var sphereRadius = 10;

    const geometrySphere = new THREE.SphereGeometry(sphereRadius, 64, 32);

    const materialSphere = new THREE.MeshPhongMaterial({color : tubeColor, opacity : 1, transparent : true,});
    materialSphere.flatShading = false;

    const sphere = new THREE.Mesh(geometrySphere, materialSphere);

    // scene.add(sphere);

    const size = 500;
    const divisions = 25;

    const gridHelper = new THREE.GridHelper( size, divisions );
    // scene.add( gridHelper );

    // for random 3d line

    let pointsArray = [new THREE.Vector3(0,0,0)];

    class Root3D {
        constructor (x,y,z) {
            this.x = x;
            this.y = y;
            this.z = z;

            if(pZone === "zone4") {
                speedXZone = Math.random() * 0.75 + 0; // 0 to 0.75
                speedYZone = Math.random() * 0.75 + 1.5; // 1.5 to 2.25
            } else if(pZone === "zone3") {
                speedXZone = Math.random() * 0.75 + 0.5; // 0.5 to 1.25
                speedYZone = Math.random() * 0.75 + 1; // 1 to 1.75
            } else if(pZone === "zone2") {
                speedXZone = Math.random() * 0.75 + 1; // 1 to 1.75
                speedYZone = Math.random() * 0.75 + 0.5; // 0.5 to 1.25
            } else if(pZone === "zone1") {
                speedXZone = Math.random() * 0.75 + 1.5; // 1.5 to 2.25
                speedYZone = Math.random() * 0.75 + 0; // 0 to 0.75
            } else if(pZone === "zone-1") {
                speedXZone = Math.random() * 0.75 + 1.5; // 1.5 to 2.25
                speedYZone = Math.random() * 0.75 - 0.75; // -0.75 to 0
            } else if(pZone === "zone-2") {
                speedXZone = Math.random() * 0.75 + 1; // 1 to 1.75
                speedYZone = Math.random() * 0.75 - 1.25; // -1.25 to -0.5
            } else if(pZone === "zone-3") {
                speedXZone = Math.random() * 0.75 + 0.5; // 0.5 to 1.25
                speedYZone = Math.random() * 0.75 - 1.75; // - 1.75 to -1
            } else if(pZone === "zone-4") {
                speedXZone = Math.random() * 0.75 + 0; // 0 to 0.75
                speedYZone = Math.random() * 0.75 - 2.25; // -2.25 to -1.5
            }

            this.speedX = speedXZone;
            this.speedY = speedYZone;
            this.speedZ = Math.random() * 1.5 - 0.75; // from -0.75 to +0.75, basically z value is 0
    
            this.angleX = Math.random() * 6.2;
            this.vax = Math.random() - .5; 
            this.angleY = Math.random() * 6.2;
            this.vay = Math.random() - .5;
            this.angleZ = Math.random() * 6.2;
            this.vaz = Math.random() - .5;
    
            this.t = 0;
    
        }
        update() {
            let startPoint = new THREE.Vector3(this.x,this.y,this.z);

            this.x += this.speedX + Math.sin(this.angleX) * jitter;
            this.y += this.speedY + Math.sin(this.angleY) * jitter;
            this.z += this.speedZ + Math.sin(this.angleZ) * jitter; // three variables, jitter and positivity control the line shape and time controls length

            this.t += 1; // 1 second

            this.angleX += this.vax;
            this.angleY += this.vay;
            this.angleZ += this.vaz;
    
            if(this.t < time) {

                // pointsArray.push( new THREE.Vector3(this.x,this.y,this.z));
                // const geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);
                // const material = new THREE.LineBasicMaterial({color:0x000000});
                // const curveObject = new THREE.Line(geometry, material);
                // scene.add(curveObject);

                    let endPoint = new THREE.Vector3(this.x,this.y,this.z);
            
                    let curveForTube = new THREE.LineCurve3(startPoint, endPoint);
                    const tubeGeometry = new THREE.TubeGeometry(curveForTube, 8, tubeRadius, 8 ,true);

                    if(pZone === "zone4") {
                        tubeColor = 0xffffff;
                    } else if(pZone === "zone3") {
                        tubeColor = 0xffffff;
                    } else if(pZone === "zone2") {
                        tubeColor = 0xffffff;
                    } else if(pZone === "zone1") {
                        tubeColor = 0xffffff;
                    } else if(pZone === "zone-1") {
                        tubeColor = 0x171717;
                    } else if(pZone === "zone-2") {
                        tubeColor = 0x171717;
                    } else if(pZone === "zone-3") {
                        tubeColor = 0x171717;
                    } else if(pZone === "zone-4") {
                        tubeColor = 0x171717;
                    }

                    var materialTube = new THREE.MeshLambertMaterial({color : tubeColor, opacity : 1, transparent : false,});

                    tube = new THREE.Mesh(tubeGeometry, materialTube);

                    scene.add(tube);   

                    for(let i=1; i<8; i++) {

                        angle = Math.PI/2 * (i/2);

                        newTube = tube.clone();
                        newTube.position.set(0,0,0);
                        newTube.rotateY(angle);
                        scene.add(newTube);
                    }


                requestAnimationFrame(this.update.bind(this));

            } else if(this.t >= 60) {
                // pointsArray.length = 0;
            }

            // zone = `zone${Math.floor(Math.random()*9) -4}`;

        }

    } // just lines
    
    button.addEventListener('click', function(e) {

            pZoneNum = parseInt(pInput.value);
            jZoneNum = parseInt(jInput.value);

            time = timeInput.value * 6; // in seconds
            pZone = `zone${pZoneNum}`; // for positivity
            jZone = `zone${jZoneNum}`; // for jitter
            
            if(jZone === "zone4") {
                jitter = 1.5;
            } else if(jZone === "zone3") {
                jitter = 1.3;
            } else if(jZone === "zone2") {
                jitter = 1.1;
            } else if(jZone === "zone1") {
                jitter = 0.9;
            } else if(jZone === "zone-1") {
                jitter = 0.7;
            } else if(jZone === "zone-2") {
                jitter = 0.5;
            } else if(jZone === "zone-3") {
                jitter = 0.3;
            } else if(jZone === "zone-4") {
                jitter = 0.1;
            }

            for(let i=0;i<1;i++) {
                let root3D = new Root3D(x,y,z);
                root3D.update();
            }

    })

    // download

    downloadButton.addEventListener('click', download);

    function download() {
        const exporter = new GLTFExporter();
        exporter.parse(
            scene,
            function(result) {
                saveArrayBuffer(result, 'ThreejsScene.glb')
            },
            {
                binary:true
            }
        )
    }

    function saveArrayBuffer(buffer, fileName) {
        save(new Blob([buffer]), fileName)
    }

    const link = document.createElement('a');
    document.body.appendChild(link);

    function save(blob, fileName) {
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()
    }
 

    // clone

    // var newTube;

    // cloneButton.addEventListener('click', function(e) {
    //     newTube = tube.clone();
    //     newTube.position.set(-100,100,100);
    //     scene.add(newTube)
    // })


    // rendering function 

    function animate() {

        requestAnimationFrame(animate);
        renderer.render(scene , camera);

    }

    animate();

}

threeD();


// class Root {
//     constructor (x,y) {
//         this.x = x;
//         this.y = y;
//         this.speedX = Math.random() * 4 - 2;
//         this.speedY = Math.random() * 4 - 2;
//         this.maxSize = Math.random() * 7 + 5;
//         this.size = Math.random() * 1 + 2;
//         this.angleX = Math.random() * 6.2;
//         this.vax = Math.random() * .6 - 0.3;
//         this.angleY = Math.random() * 6.2;
//         this.vay = Math.random() * 0.6 - 0.3;
//     }
//     update() {
//         this.x += this.speedX + Math.sin(this.angleX);
//         this.y += this.speedY + Math.sin(this.angleY);
//         this.size += 0.1;
//         this.angleX += this.vax;
//         this.angleY += this.vay;
//         if(this.size < this.maxSize) {
//             ctx.beginPath();
//             ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // making a circle
//             ctx.fillStyle = 'hsl(140, 100%, 50%';
//             ctx.fill();
//             ctx.stroke();
//             requestAnimationFrame(this.update.bind(this));
//         }
//     }
// } // original

// class Root2 {
//     constructor (x,y) {
//         this.x = x;
//         this.y = y;
//         this.speedX = Math.random() * 1.5 + 1.5;
//         this.speedY = Math.random() * 1.5 + 1.5;

//         this.angleX = Math.random() * 6.2;
//         this.vax = Math.random() - .5; 
//         this.angleY = Math.random() * 6.2;
//         this.vay = Math.random() - .5;

//         this.t = 0;

//     }
//     update() {
        
//         ctx.beginPath();
//         ctx.moveTo(this.x,this.y);

//         this.x += this.speedX + Math.sin(this.angleX) * jitter;
//         this.y += this.speedY + Math.sin(this.angleY) * jitter;
//         this.t += 1; // 1 second
//         this.angleX += this.vax;
//         this.angleY += this.vay;

//         if(this.t < 60) {
                     
//             ctx.lineTo(this.x,this.y);
//             ctx.stroke();

//             requestAnimationFrame(this.update.bind(this));
//         }
//     }
// } // just lines

// let x = 0;
// let y = 0;

// window.addEventListener('click', function(e) {

//     for(let i=0; i<1; i++) {
//         let root2 = new Root2(x,y);
//         root2.update();
//     }
// })

