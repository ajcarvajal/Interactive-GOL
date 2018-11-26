let width = window.innerWidth;
let height = window.innerHeight;

let pixelRatio = 1;//window.devicePixelRatio;

let rtWidth = width * pixelRatio;
let rtHeight = height * pixelRatio;

let mouseposition = {
  x: 0,
  y: 0
};

let ControlMenu = function() {
  this.Size = 10;
  this.Reset = function() {
    onWindowResize();
  }
  this.Clear = function() {
    onWindowResize();
    uniforms.u_frameCount.value = 3;
  };
  
};

let ControlPanel = new ControlMenu();
let gui = new dat.GUI();
gui.width = 500;
gui.add(ControlPanel, 'Size', 1, 200);
gui.add(ControlPanel, 'Reset');
gui.add(ControlPanel, 'Clear');

init();
loop();


function init() {
  renderer = new THREE.WebGLRenderer();
  //renderer.setPixelRatio(pixelRatio);
  renderer.setSize( width, height );
  document.body.appendChild(renderer.domElement);

  camera = new THREE.Camera();
  camera.position.z = 0;

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(2, 2);
  
  //setup renderTargets
  let parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, stencilBuffer: false };

  rtFront = new THREE.WebGLRenderTarget(rtWidth, rtHeight, parameters);
  rtBack = new THREE.WebGLRenderTarget(rtWidth, rtHeight, parameters);


  //setup shaderMaterials
  uniforms = {
    u_resolution: { type: "v2", value: new THREE.Vector2(width,height) },
    u_currentTexture: { type: "t", value: rtFront.texture},
    u_mouse: { type: "v3", value: new THREE.Vector3() },
    u_frameCount: { type: "i", value: -1. },
    u_mouseSize: { type: "f", value: ControlPanel.cursorSize}
  };

  let material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  } );


  let mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  window.addEventListener( 'resize', onWindowResize, false );
  
  document.addEventListener('pointermove', (e)=> {
    let ratio = height / width;
    if(height > width) {
      mouseposition.x = (e.pageX - width / 2) / width;
      mouseposition.y = (e.pageY - height / 2) / height * -1 * ratio;
    } else {
      mouseposition.x = (e.pageX - width / 2) / width / ratio;
      mouseposition.y = (e.pageY - height / 2) / height * -1;
    }
    document.addEventListener('pointerdown', ()=> {
      uniforms.u_mouse.value.z = 1;
      console.log();
    });
    document.addEventListener('pointerup', ()=> {
      uniforms.u_mouse.value.z = 0;
    });
    
    e.preventDefault();
  });
}

function onWindowResize( event ) {

  let width = window.innerWidth;
  let height = window.innerHeight;

  renderer.setSize( width, height );
  uniforms.u_resolution.value.x = width;
  uniforms.u_resolution.value.y = height;
  uniforms.u_mouse.value = new THREE.Vector3();
  
  
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

  uniforms.u_frameCount.value++;
  uniforms.u_mouse.value.x += ( mouseposition.x - uniforms.u_mouse.value.x );
  uniforms.u_mouse.value.y += ( mouseposition.y - uniforms.u_mouse.value.y );
  uniforms.u_mouseSize.value = ControlPanel.Size;

  renderer.render( scene, camera );
  stepBuffer();
  
}