let width = window.innerWidth;
let height = window.innerHeight;

let camera = new THREE.OrthographicCamera();
let mouseposition = {
  x: 0,
  y: 0
};

let ControlMenu = function() {
  this.Size = 10;
  this.NewLifeColor = [255,255,255];
  this.SurvivorColor = [255,255,255];
  this.Pause = function() {
    uniforms.u_paused.value *= -1;
  };
  this.Reset = function() {
    onWindowResize();
  };
  this.Clear = function() {
    onWindowResize();
    uniforms.u_frameCount.value = 3;
  };
};

let ControlPanel = new ControlMenu();
let gui = new dat.GUI();
gui.width = window.innerWidth / 4;
gui.add(ControlPanel, 'Reset');
gui.add(ControlPanel, 'Clear');
gui.add(ControlPanel, 'Pause');
gui.add(ControlPanel, 'Size', 1, 200);
gui.addColor(ControlPanel, 'NewLifeColor');
gui.addColor(ControlPanel, 'SurvivorColor');


init();
loop();


function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height );
  document.body.appendChild(renderer.domElement);
  camera.position.z = 1;
  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(2, 2);
  
  //setup renderTargets
  let parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, stencilBuffer: false };

  rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
  rtBack = new THREE.WebGLRenderTarget(width, height, parameters);


  //setup shaderMaterials
  uniforms = {
    u_resolution: { type: "v2", value: new THREE.Vector2(width,height) },
    u_currentTexture: { type: "t", value: rtFront.texture},
    u_mouse: { type: "v3", value: new THREE.Vector3() },
    u_frameCount: { type: "i", value: -1. },
    u_mouseSize: { type: "f", value: ControlPanel.cursorSize},
    u_newLifeColor: {type: "v3", value: ControlPanel.NewLifeColor},
    u_survivorColor: {type: "v3", value: ControlPanel.SurvivorColor},
    u_paused: {type: 'i', value: 1},
  };

  let material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  } );


  let mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener('pointermove', onPointerMove, false);
}

function onPointerMove(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let ratio = height / width;
  if(height > width) {
    mouseposition.x = (event.pageX - width / 2) / width;
    mouseposition.y = (event.pageY - height / 2) / height * -1 * ratio;
  } else {
    mouseposition.x = (event.pageX - width / 2) / width / ratio;
    mouseposition.y = (event.pageY - height / 2) / height * -1;
  }
  window.addEventListener('pointerdown', ()=> {
    uniforms.u_mouse.value.z = 1;
  });
  window.addEventListener('pointerup', ()=> {
    uniforms.u_mouse.value.z = 0;
  });
  
  event.preventDefault();
}

function onWindowResize( event ) {

  let width = window.innerWidth;
  let height = window.innerHeight;

  renderer.setSize( width, height );
  uniforms.u_resolution.value.x = width;
  uniforms.u_resolution.value.y = height;
  uniforms.u_mouse.value = new THREE.Vector3();
  gui.width = window.innerWidth/4;
  
  uniforms.u_frameCount.value = 0;
  
  let parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, stencilBuffer: false };

  rtFront = new THREE.WebGLRenderTarget(width, height, parameters);
  rtBack = new THREE.WebGLRenderTarget(width, height, parameters);

}


function loop() {
  requestAnimationFrame( loop );
  render();
}


function stepBuffer() {

  uniforms.u_currentTexture.value = rtBack.texture;
  
  renderer.render( scene, camera, rtFront, true );
  
  let buffer = rtFront
  rtFront = rtBack;
  rtBack = buffer;

  uniforms.u_currentTexture.value = rtFront.texture;
}

function render() {
  //update uniforms
  uniforms.u_frameCount.value++;
  uniforms.u_mouse.value.x += ( mouseposition.x - uniforms.u_mouse.value.x );
  uniforms.u_mouse.value.y += ( mouseposition.y - uniforms.u_mouse.value.y );
  uniforms.u_mouseSize.value = ControlPanel.Size;
  //update colors
  uniforms.u_newLifeColor.value = ControlPanel.NewLifeColor;
  uniforms.u_survivorColor.value = ControlPanel.SurvivorColor;

  renderer.render( scene, camera );
  stepBuffer();
  
}