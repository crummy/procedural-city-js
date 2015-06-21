var scene, camera, renderer;
var light, controls;
var lastTime;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x343);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
    
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x454, 0.005);
  
  camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 3000);
  camera.position.set(-32, 32, 1);
  
  controls = new THREE.FirstPersonControls( camera );
  controls.movementSpeed = 20;
  controls.lookSpeed = 0.05;
  controls.lookVertical = true;
  
  light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
  light.position.set(0.75, 1, 0.25);
  scene.add(light);
  
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({color: 0x111}));
  plane.rotation.x = -90 *Math.PI/180;
  scene.add(plane);
  
  var buildings = new Buildings();
  var city = new THREE.Geometry();
  var cityBlocksX = 10;
  var cityBlocksZ = 10;
  
  var center = new THREE.Matrix4().makeTranslation( 0, 0.5, 0 );
  var scale = new THREE.Matrix4().makeScale(20, 20, 20);
  for (var x = 0; x < cityBlocksX; ++x) {
    for (var z = 0; z < cityBlocksZ; ++z) {
      var building = buildings.random();
      building.applyMatrix(scale);
      building.applyMatrix(new THREE.Matrix4().makeTranslation(32 * x, 0, 32 * z));
      city.merge(building, building.matrix);
    }
  }
  
  var texture = new THREE.Texture(generateTexture());
  texture.anisotropy = renderer.getMaxAnisotropy();
  texture.needsUpdate = true;

  var mesh = new THREE.Mesh(city, new THREE.MeshLambertMaterial({map: texture, vertexColors: THREE.VertexColors}));
  
  scene.add(mesh);
  
  lastTime = performance.now();
}

function Buildings() {
  
  var baseBox = new THREE.BoxGeometry(1, 1, 1);
  var black = new THREE.Color().setRGB(0, 0, 0);
  baseBox.faces[4].color = black;
  baseBox.faces[5].color = black;
  baseBox.applyMatrix(new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ));
  
  this.random = function() {
    var cubeChance = 0.5;
    var stackChance = cubeChance + 0.3;
    
    var choice = Math.random();
    if (choice < cubeChance) {
       return this.cube();
    } else if (choice < stackChance) {
      return this.stack(); 
    } else {
      return this.blocky(); 
    }
  }
  
  this.cube = function(width, height) {
    var cubeHeightMin = 1;
    var cubeHeightMax = 2;
    var roofChance = 0.3;
    
    var geometry = baseBox.clone();
    
    var heightAddition = Math.random() * Math.random() * (cubeHeightMax - cubeHeightMin);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(1, cubeHeightMin + heightAddition, 1));
    
    if (Math.random() < roofChance) {
      var roof = makeCap(geometry);
      geometry.merge(roof, roof.matrix);
    }
  
    return geometry;
  }
  
  this.blocky = function() {
    var blockAmount = Math.ceil(Math.random() * 2) + 2;
    var cubeHeightMin = 1;
    var cubeHeightMax = 3;
    
    var geometry = new THREE.Geometry();
    for (var blockNumber = 0; blockNumber < blockAmount; ++blockNumber) {
      var width = 0.1 + Math.random() * 0.9;
      var depth = 0.1 + Math.random() * 0.9;
      var height = Math.random() * (cubeHeightMax - cubeHeightMin);
      var box = baseBox.clone();
      box.applyMatrix(new THREE.Matrix4().makeScale(width, cubeHeightMin + height, depth));
      var xShift = Math.random() * (1-width) - (1-width)/2;
      var zShift = Math.random() * (1-depth) - (1-depth)/2;
      box.applyMatrix(new THREE.Matrix4().makeTranslation(xShift, 0, zShift));
      geometry.merge(box, box.matrix);
    }
    return geometry;
  }
  
  
  this.stack = function() {
    var stackAmount = Math.ceil(Math.random() * 3) + 1;
    var stackHeightMin = 0.7;
    var stackHeightMax = 1.5;
    
    var geometry = new THREE.Geometry();
    var lastSize = 1;
    var lastTop = 0;
    for (var stackNumber = 0; stackNumber < stackAmount; ++stackNumber) {
      var size = (1 - Math.random() * Math.random()) * lastSize;
      var height = Math.random() * (stackHeightMax - stackHeightMin);
      var box = baseBox.clone();
      box.applyMatrix(new THREE.Matrix4().makeScale(size, stackHeightMin + height, size));
      box.applyMatrix(new THREE.Matrix4().makeTranslation(0, lastTop, 0));
      if (stackNumber != stackAmount - 1) {
        var cap = makeCap(box);
        box.merge(cap, cap.matrix);
      }
      
      lastSize = size;
      box.computeBoundingBox();
      lastTop = box.boundingBox.max.y;
      geometry.merge(box, box.matrix);
    }
    return geometry;
  }
  
  function makeCap(building) {
    var roofHeight = 0.01 + Math.random() * 0.1;
    var roofOverhang = Math.random() * 0.05;
    
    building.computeBoundingBox();
    var bbox = building.boundingBox;
    var size = building.boundingBox.size();
    var cube = baseBox.clone();
    cube.applyMatrix(new THREE.Matrix4().makeScale(size.x + roofOverhang*2, roofHeight, size.z + roofOverhang*2));
    
    var center = building.center();
    cube.applyMatrix(new THREE.Matrix4().makeTranslation(0, bbox.max.y, 0));
    
    for (var index = 0; index < cube.faces.length; ++index) {
      cube.faces[index].color = new THREE.Color().setRGB(0, 0, 0);
    }
    
    return cube;
  }
  
}

function animate() {
  requestAnimationFrame( animate );
  var time = performance.now() / 1000;
  controls.update(time - lastTime);
  renderer.render(scene, camera); 
  lastTime = time;
}

function generateTexture() {
  var canvas = document.createElement( 'canvas' );
  canvas.width = 32;
  canvas.height = 64;

  var context = canvas.getContext( '2d' );
  context.fillStyle = '#111';
  context.fillRect( 0, 0, 32, 64 );

  for ( var y = 2; y < 64; y += 2 ) {
    for ( var x = 0; x < 32; x += 2 ) {
      var value = Math.floor( Math.random() * 128 );
      context.fillStyle = 'rgb(' + [ value, value, value ].join( ',' )  + ')';
      context.fillRect( x, y, 2, 1 );
    }
  }

  var canvas2 = document.createElement( 'canvas' );
  canvas2.width = 512;
  canvas2.height = 1024;

  var context = canvas2.getContext( '2d' );
  context.imageSmoothingEnabled = false;
  context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );

  return canvas2;
}