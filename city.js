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
  var center = new THREE.Matrix4().makeTranslation( 0, 0.5, 0 );
  var tall = new THREE.Matrix4().makeScale(1, 2, 1);
  geometry.applyMatrix(center);
  geometry.applyMatrix(tall);
  
  var buildings = new Buildings();
  var city = new THREE.Geometry();
  for (var x = 0; x < cityBlocksX; ++x) {
    for (var z = 0; z < cityBlocksZ; ++z) {
      var building = buildings.random(x, z);
      city.merge(building, building.matrix);
    }
  }

  var mesh = new THREE.Mesh(city, new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors}));
  
  scene.add(mesh);
  
  lastTime = performance.now();
}

function Buildings() {
  var blockSize = 0.8;
  var box = new THREE.BoxGeometry(1, 1, 1);
  var initialMatrix = new THREE.Matrix4().makeTranslation(0, 0.5, 0);
  
  this.random = function(x, z) {
    return Math.random() > 0.5 ? this.bland(x,z) : this.modern(x,z); 
  }
  
  this.bland = function(x, z, width, height) {
    if (width == undefined) width = blockSize;
    if (height == undefined) height = blockSize;
    
    // start from a simple box
    var geometry = box.clone();
    // shift center, so transforms occur from bottom of box
    geometry.applyMatrix(initialMatrix);
    // grow it upwards, and squeeze it to allow for streets in between
    var heightAddition = Math.random() * Math.random() * 2;
    var scaleMatrix = new THREE.Matrix4().makeScale(1 * width, 1 + heightAddition, 1 * height);
    geometry.applyMatrix(scaleMatrix);
    // shift it into place
    var translationMatrix = new THREE.Matrix4().makeTranslation(x, 0, z);
    geometry.applyMatrix(translationMatrix);
    return geometry;
  }
  
  this.modern = function(x, z) {
    var geometry = new THREE.Geometry();
    var box1 = this.bland(x, z, Math.random(), Math.random());
    var box2 = this.bland(x, z, Math.random(), Math.random());
    var box3 = this.bland(x, z, Math.random(), Math.random());
    geometry.merge(box1, box1.matrix);
    geometry.merge(box2, box2.matrix);
    geometry.merge(box3, box3.matrix);
    return geometry;
  }
}

function animate() {
  requestAnimationFrame( animate );
  var time = performance.now() / 1000;
  controls.update( time - lastTime );
  renderer.render( scene, camera ); 
  lastTime = time;
}