var scene, camera, renderer;
var light, controls;
var lastTime;
var cityBlocksX = 10;
var cityBlocksZ = 10;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xd8e7ff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
    
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);
  
  camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 3000);
  camera.position.set(-5, 1.1, 1);
  
  controls = new THREE.FirstPersonControls( camera );
  controls.movementSpeed = 20;
  controls.lookSpeed = 0.05;
  controls.lookVertical = true;
  
  light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
  light.position.set(0.75, 1, 0.25);
  scene.add(light);
  
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({color: 0x333333}));
  plane.rotation.x = -90 *Math.PI/180;
  scene.add(plane);
  
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
  
  var building = new THREE.Mesh(geometry);
  var city = new THREE.Geometry();
  
  var color = new THREE.Color().setRGB(0.5, 0.2, 0.8);

  var geometry = building.geometry;
  building.updateMatrix();
  city.merge(building.geometry, building.matrix);
  
  var mesh = new THREE.Mesh(city, new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors}));
  
  scene.add(mesh);
  
  lastTime = performance.now();
}

function animate() {
  requestAnimationFrame( animate );
  var time = performance.now() / 1000;
  controls.update( time - lastTime );
  renderer.render( scene, camera ); 
  lastTime = time;
}