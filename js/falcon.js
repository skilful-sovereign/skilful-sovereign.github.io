//colors

var Colors = {
    white:0xd8d0d1,
    gray:0x666666,
    blue:0x68c3c0,
    black:0x000000
};

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

//basic initialization

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

//handle screen events

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  renderer.shadowMapType = THREE.PCFSoftShadowMap;
}

//lights

var ambientLight, hemisphereLight, shadowLight1;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  
  shadowLight1 = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight1.position.set(150, 350, 100);
  shadowLight1.castShadow = true;
  shadowLight1.shadow.camera.left = -1000;
  shadowLight1.shadow.camera.right = 1000;
  shadowLight1.shadow.camera.top = 1000;
  shadowLight1.shadow.camera.bottom = -1000;
  shadowLight1.shadow.camera.near = 1;
  shadowLight1.shadow.camera.far = 1000;
  shadowLight1.shadow.mapSize.width = 1200;
  shadowLight1.shadow.mapSize.height = 1200;

  scene.add(hemisphereLight);
  scene.add(shadowLight1);
}

//functions that create 3d models

var ReturnStage = function(){
	this.mesh = new THREE.Object3D();
  this.mesh.name = "returnStage";


	var geomLowerFuel = new THREE.CylinderGeometry(30,30,440,32,1);
  var matLowerFuel = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var lowerFuel = new THREE.Mesh(geomLowerFuel, matLowerFuel);
	lowerFuel.castShadow = true;
  lowerFuel.receiveShadow = true;
  this.mesh.add(lowerFuel);


  var geomLowerEngine = new THREE.CylinderGeometry(30,20,15,32,1);
  var matLowerEngine = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine = new THREE.Mesh(geomLowerEngine, matLowerEngine);
  lowerEngine.position.set(0,-227,0);
  lowerEngine.castShadow = true;
  lowerEngine.receiveShadow = true;
	this.mesh.add(lowerEngine);

  var geomLowerEngine1 = new THREE.CylinderGeometry(4,7,7,32,1);
  var matLowerEngine1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine1 = new THREE.Mesh(geomLowerEngine1, matLowerEngine1);
  lowerEngine1.position.set(-14,-238,0);
  lowerEngine1.castShadow = true;
  lowerEngine1.receiveShadow = true;
  this.mesh.add(lowerEngine1);

  var geomLowerEngine2 = new THREE.CylinderGeometry(4,7,7,32,1);
  var matLowerEngine2 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine2 = new THREE.Mesh(geomLowerEngine2, matLowerEngine2);
  lowerEngine2.position.set(14,-238,0);
  lowerEngine2.castShadow = true;
  lowerEngine2.receiveShadow = true;
  this.mesh.add(lowerEngine2);

  var geomLowerEngine3 = new THREE.CylinderGeometry(4,7,7,32,1);
  var matLowerEngine3 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine3 = new THREE.Mesh(geomLowerEngine3, matLowerEngine3);
  lowerEngine3.position.set(0,-238,0);
  lowerEngine3.castShadow = true;
  lowerEngine3.receiveShadow = true;
  this.mesh.add(lowerEngine3);

  var geomLowerEngine4 = new THREE.CylinderGeometry(4,7,7,32,1);
  var matLowerEngine4 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine4 = new THREE.Mesh(geomLowerEngine4, matLowerEngine4);
  lowerEngine4.position.set(0,-238,-14);
  lowerEngine4.castShadow = true;
  lowerEngine4.receiveShadow = true;
  this.mesh.add(lowerEngine4);

  var geomLowerEngine5 = new THREE.CylinderGeometry(4,7,7,32,1);
  var matLowerEngine5 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine5 = new THREE.Mesh(geomLowerEngine5, matLowerEngine5);
  lowerEngine5.position.set(0,-238,14);
  lowerEngine5.castShadow = true;
  lowerEngine5.receiveShadow = true;
  this.mesh.add(lowerEngine5);

};

var LegOne = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legOne";

  var geomLeg1 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg1 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var leg1 = new THREE.Mesh(geomLeg1, matLeg1);
  leg1.position.set(0,-170,30);
  leg1.castShadow = true;
  leg1.receiveShadow = true;
  this.mesh.add(leg1);
};
var LegTwo = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legTwo";

  var geomLeg2 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg2 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var leg2 = new THREE.Mesh(geomLeg2, matLeg2);
  leg2.position.set(30,-170,0);
  leg2.castShadow = true;
  leg2.receiveShadow = true;
  this.mesh.add(leg2);
};
var LegThree = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legThree";

  var geomLeg3 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg3 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var leg3 = new THREE.Mesh(geomLeg3, matLeg3);
  leg3.position.set(-30,-170,0);
  leg3.castShadow = true;
  leg3.receiveShadow = true;
  this.mesh.add(leg3);
};
var LegFour = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legFour";

  var geomLeg4 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg4 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var leg4 = new THREE.Mesh(geomLeg4, matLeg4);
  leg4.position.set(0,-170,-30);
  leg4.castShadow = true;
  leg4.receiveShadow = true;
  this.mesh.add(leg4);
};


var OrbitalStage = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "orbitalStage";

  var geomUpperFuel = new THREE.CylinderGeometry(30,30,80,32,1);
  var matUpperFuel = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var upperFuel = new THREE.Mesh(geomUpperFuel, matUpperFuel);
  upperFuel.position.y = 260;
  upperFuel.castShadow = true;
  upperFuel.receiveShadow = true;
  this.mesh.add(upperFuel);


  var geomSideWing = new THREE.CylinderGeometry(40,30,20,32,1);
  var matSideWing = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.position.set(0,290,0);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);


  var geomCaspule = new THREE.CylinderGeometry(40,40,120,32,1);
  var matCapsule = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var capsule = new THREE.Mesh(geomCaspule, matCapsule);
  capsule.position.set(0,360,0);
  capsule.castShadow = true;
  capsule.receiveShadow = true;
  this.mesh.add(capsule);

  var geomCone = new THREE.CylinderGeometry(5,40,40,32,1);
  var matCone = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var cone = new THREE.Mesh(geomCone, matCone);
  cone.position.set(0,440,0);
  cone.castShadow = true;
  cone.receiveShadow = true;
  this.mesh.add(cone);

  var geomUpperEngine = new THREE.CylinderGeometry(15,25,30,32,1);
  var matUpperEngine = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var upperEngine = new THREE.Mesh(geomUpperEngine, matUpperEngine);
  upperEngine.position.set(0,200,0);
  upperEngine.castShadow = false;
  upperEngine.receiveShadow = false;
  this.mesh.add(upperEngine);

};
LandingSite = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "landingSite";

  var geomLanding = new THREE.CylinderGeometry(300,300,10,128,1);
  var matLanding = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var landingSite = new THREE.Mesh(geomLanding, matLanding);
  landingSite.position.y=-232;
  landingSite.castShadow = false;
  landingSite.receiveShadow = true;
  this.mesh.add(landingSite);
};

LaunchSite = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "launchSite";

  var geomLaunch = new THREE.CylinderGeometry(300,300,10,128,1);
  var matLaunch = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var launchSite = new THREE.Mesh(geomLaunch, matLaunch);
  launchSite.position.y=-240;
  launchSite.castShadow = false;
  launchSite.receiveShadow = true;
  this.mesh.add(launchSite);
};



Sea = function(){
  var geom = new THREE.BoxGeometry(10000,1225,10000);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.6,
    shading:THREE.FlatShading,
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}

var sea;
var returnStage;
var orbitalStage;
var landingSite;
var launchSite;
var legOne;
var legTwo;
var legThree;
var legFour;

//calls to functions to create 3D objects

function createFalcon(){
  returnStage = new ReturnStage();
  orbitalStage = new OrbitalStage();
  legOne = new LegOne();
  legTwo = new LegTwo();
  legThree = new LegThree();
  legFour = new LegFour();
  returnStage.mesh.scale.set(.25,.25,.25);
  returnStage.mesh.position.y = 80;
  orbitalStage.mesh.scale.set(.25,.25,.25);
  orbitalStage.mesh.position.y = 80;
  legOne.mesh.scale.set(.25,.25,.25);
  legOne.mesh.position.y = 80;
  legTwo.mesh.scale.set(.25,.25,.25);
  legTwo.mesh.position.y = 80;
  legThree.mesh.scale.set(.25,.25,.25);
  legThree.mesh.position.y = 80;
  legFour.mesh.scale.set(.25,.25,.25);
  legFour.mesh.position.y = 80;
  group1 = new THREE.Object3D();
  group = new THREE.Object3D();

  group1.add(legOne.mesh);
  group1.add(legTwo.mesh);
  group1.add(legThree.mesh);
  group1.add(legFour.mesh);
  group1.add(returnStage.mesh);

  group.add(group1);
  group.add(orbitalStage.mesh)
  scene.add(group);
}

function createLandingSite(){
  landingSite= new LandingSite();
  landingSite.mesh.scale.set(.25,.25,.25);
  landingSite.mesh.position.y = 75;
  scene.add(landingSite.mesh);
}

function createLaunchSite(){
  launchSite= new LaunchSite();
  launchSite.mesh.scale.set(.25,.25,.25);
  launchSite.mesh.position.y = 75;
  launchSite.mesh.position.x = 565;
  scene.add(launchSite.mesh);
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -600;
  scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = 10200;
  sky.mesh.position.z = -5300;
  sky.mesh.rotateX( -Math.PI/2 );
  scene.add(sky.mesh);
}


//i is the clock

var i=-120;

//the loop function is used to animate objects

function loop(){

  if  (i<500 && i>=0){

    group.translateY( 2 );
    camera.translateY( 2 );
    camera.translateZ( 0.2 );

  }
  if  (i<1250 && i>500){
    group.rotateZ( -Math.PI*2/3000 );
    group.translateY( 0.2 );
    if (i<800){
      camera.translateY( 0 );
    }
    camera.translateX(0.2);
  }
  if  (i<1350 && i>1250){
    group.translateY( 1 );
    camera.translateX(1);
  }
  if  (i<1550 && i>1350){

    group1.translateY( 1 );
    orbitalStage.mesh.translateY( 2 );

    camera.translateX(1);
  }
    if  (i<1650 && i>1550){

    group.translateY( 1 );
    orbitalStage.mesh.translateY( 1 );

    camera.translateX(1);
  }
  
  if  (i<2400 && i>1650){
    group1.rotateZ( Math.PI*2/3000 );
    group.translateY( 0.1 );
    if (i<2000){
      camera.translateY(0.15);
    }

  }

  if  (i<3400 && i>2400){
    group1.translateY( -1 );
    camera.translateY(-1);
    camera.translateZ( -0.1 );
  }

  if  (i<3520 && i>3400){
    
    group1.translateY( -0.5 );
    camera.translateY(-0.5);
    legOne.mesh.rotateX( -Math.PI*2/1350 );
    legOne.mesh.translateZ(-0.17);
    legOne.mesh.translateY(-0.11);
    

    legTwo.mesh.rotateZ( Math.PI*2/1350 );
    legTwo.mesh.translateX(-0.17);
    legTwo.mesh.translateY(-0.11);

    legThree.mesh.rotateZ( -Math.PI*2/1350 );
    legThree.mesh.translateX(0.17);
    legThree.mesh.translateY(-0.11);

    legFour.mesh.rotateX( Math.PI*2/1350 );
    legFour.mesh.translateZ(0.17);
    legFour.mesh.translateY(-0.11);
    
  }
  if  (i<3580 && i>3520){
  
    group1.translateY( -0.5 );
    camera.translateY(-0.4);
  }
  if  (i<3620 && i>3580){
  
    group1.translateY( -0.25 );
    camera.translateY(-0.2);
  }
  if  (i<3643 && i>3620){
  
    group1.translateY( -0.06 );
    camera.translateY(-0.1);
  }
  i++;
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

//init is the first function called

function init(event){

  createScene();
  createLights();
  createFalcon();
  createSea();
  createLaunchSite();
  createLandingSite();
  loop();
}

window.addEventListener('load', init, false);
