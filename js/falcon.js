//colors

var Colors = {
    white:0xffffff,
    gray:0x888888,
    blue:0x68c3c0,
    black:0x000000,
    orange:0xffa64d
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
  scene.fog = new THREE.Fog(0xf7d9aa, 650,950);
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

  var geomLowerEngine1 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine1 = new THREE.Mesh(geomLowerEngine1, matLowerEngine1);
  lowerEngine1.position.set(-14,-240,0);
  lowerEngine1.castShadow = true;
  lowerEngine1.receiveShadow = true;
  this.mesh.add(lowerEngine1);

  var geomLowerEngine2 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine2 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine2 = new THREE.Mesh(geomLowerEngine2, matLowerEngine2);
  lowerEngine2.position.set(14,-240,0);
  lowerEngine2.castShadow = true;
  lowerEngine2.receiveShadow = true;
  this.mesh.add(lowerEngine2);

  var geomLowerEngine3 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine3 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine3 = new THREE.Mesh(geomLowerEngine3, matLowerEngine3);
  lowerEngine3.position.set(0,-240,0);
  lowerEngine3.castShadow = true;
  lowerEngine3.receiveShadow = true;
  this.mesh.add(lowerEngine3);

  var geomLowerEngine4 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine4 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine4 = new THREE.Mesh(geomLowerEngine4, matLowerEngine4);
  lowerEngine4.position.set(7,-240,-14);
  lowerEngine4.castShadow = true;
  lowerEngine4.receiveShadow = true;
  this.mesh.add(lowerEngine4);

  var geomLowerEngine5 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine5 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine5 = new THREE.Mesh(geomLowerEngine5, matLowerEngine5);
  lowerEngine5.position.set(7,-240,14);
  lowerEngine5.castShadow = true;
  lowerEngine5.receiveShadow = true;
  this.mesh.add(lowerEngine5);

  var geomLowerEngine6 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine6 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine6 = new THREE.Mesh(geomLowerEngine6, matLowerEngine6);
  lowerEngine6.position.set(-7,-240,-14);
  lowerEngine6.castShadow = true;
  lowerEngine6.receiveShadow = true;
  this.mesh.add(lowerEngine6);

  var geomLowerEngine7 = new THREE.CylinderGeometry(5,7,10,32,1);
  var matLowerEngine7 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var lowerEngine7 = new THREE.Mesh(geomLowerEngine7, matLowerEngine7);
  lowerEngine7.position.set(-7,-240,14);
  lowerEngine7.castShadow = true;
  lowerEngine7.receiveShadow = true;
  this.mesh.add(lowerEngine7);
};

var ReturnFlame = function(){
	this.mesh = new THREE.Object3D();
	this.mesh.name = "returnFlame";

  var geomReturnFlame1 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame1 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame1 = new THREE.Mesh(geomReturnFlame1, matReturnFlame1);
  returnFlame1.position.set(-14,-265,0);
  returnFlame1.castShadow = true;
  returnFlame1.receiveShadow = true;
  this.mesh.add(returnFlame1);

  var geomReturnFlame2 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame2 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame2 = new THREE.Mesh(geomReturnFlame2, matReturnFlame2);
  returnFlame2.position.set(14,-265,0);
  returnFlame2.castShadow = true;
  returnFlame2.receiveShadow = true;
  this.mesh.add(returnFlame2);

  var geomReturnFlame3 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame3 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame3 = new THREE.Mesh(geomReturnFlame3, matReturnFlame3);
  returnFlame3.position.set(7,-265,14);
  returnFlame3.castShadow = true;
  returnFlame3.receiveShadow = true;
  this.mesh.add(returnFlame3);

  var geomReturnFlame4 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame4 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame4 = new THREE.Mesh(geomReturnFlame4, matReturnFlame4);
  returnFlame4.position.set(7,-265,-14);
  returnFlame4.castShadow = true;
  returnFlame4.receiveShadow = true;
  this.mesh.add(returnFlame4);

  var geomReturnFlame5 = new THREE.CylinderGeometry(5,1,50,32,1);
  var matReturnFlame5 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame5 = new THREE.Mesh(geomReturnFlame5, matReturnFlame5);
  returnFlame5.position.set(0,-270,0);
  returnFlame5.castShadow = true;
  returnFlame5.receiveShadow = true;
  returnFlame5.opacity = 0.3;
  this.mesh.add(returnFlame5);

  var geomReturnFlame6 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame6 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame6 = new THREE.Mesh(geomReturnFlame6, matReturnFlame6);
  returnFlame6.position.set(-7,-265,14);
  returnFlame6.castShadow = true;
  returnFlame6.receiveShadow = true;
  this.mesh.add(returnFlame6);

  var geomReturnFlame7 = new THREE.CylinderGeometry(5,1,40,32,1);
  var matReturnFlame7 = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var returnFlame7 = new THREE.Mesh(geomReturnFlame7, matReturnFlame7);
  returnFlame7.position.set(-7,-265,-14);
  returnFlame7.castShadow = true;
  returnFlame7.receiveShadow = true;
  this.mesh.add(returnFlame7);
  
}

var OrbitalFlame = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "orbitalFlame";

  var geomOribtalFlame = new THREE.CylinderGeometry(15,1,40,32,1);
  var matOrbitalFlame = new THREE.MeshPhongMaterial({color:Colors.orange, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var orbitalFlame = new THREE.Mesh(geomOribtalFlame, matOrbitalFlame);
  orbitalFlame.position.set(0,180,0);
  orbitalFlame.castShadow = true;
  orbitalFlame.receiveShadow = true;
  this.mesh.add(orbitalFlame);
}

var LegOne = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legOne";

  var geomLeg1 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var leg1 = new THREE.Mesh(geomLeg1, matLeg1);
  leg1.position.set(0,-170,29);
  leg1.castShadow = true;
  leg1.receiveShadow = true;
  this.mesh.add(leg1);
};
var LegTwo = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legTwo";

  var geomLeg2 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg2 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var leg2 = new THREE.Mesh(geomLeg2, matLeg2);
  leg2.position.set(29,-170,0);
  leg2.castShadow = true;
  leg2.receiveShadow = true;
  this.mesh.add(leg2);
};
var LegThree = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legThree";

  var geomLeg3 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg3 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var leg3 = new THREE.Mesh(geomLeg3, matLeg3);
  leg3.position.set(-29,-170,0);
  leg3.castShadow = true;
  leg3.receiveShadow = true;
  this.mesh.add(leg3);
};
var LegFour = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "legFour";

  var geomLeg4 = new THREE.CylinderGeometry(8,5,100,3,1);
  var matLeg4 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var leg4 = new THREE.Mesh(geomLeg4, matLeg4);
  leg4.position.set(0,-170,-29);
  leg4.castShadow = true;
  leg4.receiveShadow = true;
  this.mesh.add(leg4);
};

var BrakeOne = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "brakeOne";

  var geomBrake1 = new THREE.BoxGeometry(20,30,5);
  var matBrake1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var brake1 = new THREE.Mesh(geomBrake1, matBrake1);
  brake1.position.set(0,150,30);
  brake1.castShadow = true;
  brake1.receiveShadow = true;
  this.mesh.add(brake1);
};

var BrakeTwo = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "brakeTwo";

  var geomBrake2 = new THREE.BoxGeometry(20,30,5);
  var matBrake2 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var brake2 = new THREE.Mesh(geomBrake2, matBrake2);
  brake2.position.set(0,150,-30);
  brake2.castShadow = true;
  brake2.receiveShadow = true;
  this.mesh.add(brake2);
};

var BrakeThree = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "brakeThree";

  var geomBrake3 = new THREE.BoxGeometry(5,30,20);
  var matBrake3 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var brake3 = new THREE.Mesh(geomBrake3, matBrake3);
  brake3.position.set(30,150,0);
  brake3.castShadow = true;
  brake3.receiveShadow = true;
  this.mesh.add(brake3);
};

var BrakeFour = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "brakeFour";

  var geomBrake4 = new THREE.BoxGeometry(5,30,20);
  var matBrake4 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var brake4 = new THREE.Mesh(geomBrake4, matBrake4);
  brake4.position.set(-30,150,0);
  brake4.castShadow = true;
  brake4.receiveShadow = true;
  this.mesh.add(brake4);
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

  var geomCup = new THREE.CylinderGeometry(40,30,20,32,1);
  var matCup = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.SmoothShading});
  var cup = new THREE.Mesh(geomCup, matCup);
  cup.position.set(0,290,0);
  cup.castShadow = true;
  cup.receiveShadow = true;
  this.mesh.add(cup);

  var geomUpperEngine = new THREE.CylinderGeometry(15,25,30,32,1);
  var matUpperEngine = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var upperEngine = new THREE.Mesh(geomUpperEngine, matUpperEngine);
  upperEngine.position.set(0,210,0);
  upperEngine.castShadow = false;
  upperEngine.receiveShadow = false;
  this.mesh.add(upperEngine);

};

Fairing = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "fairing";

  var geomCaspule = new THREE.CylinderGeometry(40,40,120,32,1,true);
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
  
}

Satelite = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "satelite";

  var geomSatelite = new THREE.CylinderGeometry(35,35,100,8,1);
  var matSatelite = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var satelite = new THREE.Mesh(geomSatelite, matSatelite);
  satelite.position.set(0,350,0);
  satelite.castShadow = true;
  satelite.receiveShadow = true;
  this.mesh.add(satelite);

}

SolarWing1 = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "solarWing1";

  var geomSolarWing1 = new THREE.BoxGeometry(45,35,10);
  var matSolarWing1 = new THREE.MeshPhongMaterial({color:Colors.blue, shading:THREE.FlatShading});
  var solarWing1 = new THREE.Mesh(geomSolarWing1, matSolarWing1);
  solarWing1.position.set(0,350,0);
  solarWing1.castShadow = true;
  solarWing1.receiveShadow = true;
  this.mesh.add(solarWing1);

}

LandingSite = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "landingSite";

  var geomLanding = new THREE.CylinderGeometry(300,300,10,128,1);
  var matLanding = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var landingSite = new THREE.Mesh(geomLanding, matLanding);
  landingSite.position.y=-240;
  landingSite.castShadow = false;
  landingSite.receiveShadow = true;
  this.mesh.add(landingSite);
};

LaunchSite = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "launchSite";

  var geomLaunch = new THREE.CylinderGeometry(300,300,10,128,1);
  var matLaunch = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.SmoothShading});
  var launchSite = new THREE.Mesh(geomLaunch, matLaunch);
  launchSite.position.y=-232;
  launchSite.castShadow = false;
  launchSite.receiveShadow = true;
  this.mesh.add(launchSite);

  var geomLaunchStrutSupport1 = new THREE.BoxGeometry(40,50,40);
  var matLaunchStrutSupport1 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrutSupport1 = new THREE.Mesh(geomLaunchStrutSupport1, matLaunchStrutSupport1);
  launchStrutSupport1.position.y=-220;
  launchStrutSupport1.castShadow = false;
  launchStrutSupport1.receiveShadow = true;
  launchStrutSupport1.position.x=(-65)
  this.mesh.add(launchStrutSupport1);

  var geomLaunchStrutSupport2 = new THREE.BoxGeometry(40,50,40);
  var matLaunchStrutSupport2 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrutSupport2 = new THREE.Mesh(geomLaunchStrutSupport2, matLaunchStrutSupport2);
  launchStrutSupport2.position.y=-220;
  launchStrutSupport2.castShadow = false;
  launchStrutSupport2.receiveShadow = true;
  launchStrutSupport2.position.x=(65)
  this.mesh.add(launchStrutSupport2);
};

LaunchStrut1 = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "launchStrut1";

  var geomLaunchStrut1 = new THREE.BoxGeometry(15,550,15);
  var matLaunchStrut1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var launchStrut1 = new THREE.Mesh(geomLaunchStrut1, matLaunchStrut1);
  launchStrut1.position.y=0;
  launchStrut1.castShadow = false;
  launchStrut1.receiveShadow = true;
  launchStrut1.position.x=(-65)
  this.mesh.add(launchStrut1);

  var geomLaunchStrut2 = new THREE.BoxGeometry(10,60,10);
  var matLaunchStrut2 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut2 = new THREE.Mesh(geomLaunchStrut2, matLaunchStrut2);
  launchStrut2.position.y=245;
  launchStrut2.castShadow = false;
  launchStrut2.receiveShadow = true;
  launchStrut2.position.x=(-55)
  this.mesh.add(launchStrut2);

  var geomLaunchStrut3 = new THREE.BoxGeometry(10,40,10);
  var matLaunchStrut3 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut3 = new THREE.Mesh(geomLaunchStrut3, matLaunchStrut3);
  launchStrut3.position.y=255;
  launchStrut3.castShadow = false;
  launchStrut3.receiveShadow = true;
  launchStrut3.position.x=(-45)
  this.mesh.add(launchStrut3);

  var geomLaunchStrut4 = new THREE.BoxGeometry(10,20,10);
  var matLaunchStrut4 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut4 = new THREE.Mesh(geomLaunchStrut4, matLaunchStrut4);
  launchStrut4.position.y=265;
  launchStrut4.castShadow = false;
  launchStrut4.receiveShadow = true;
  launchStrut4.position.x=(-35)
  this.mesh.add(launchStrut4);

}

LaunchStrut2 = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "launchStrut2";

  var geomLaunchStrut1 = new THREE.BoxGeometry(15,550,15);
  var matLaunchStrut1 = new THREE.MeshPhongMaterial({color:Colors.gray, shading:THREE.FlatShading});
  var launchStrut1 = new THREE.Mesh(geomLaunchStrut1, matLaunchStrut1);
  launchStrut1.position.y=0;
  launchStrut1.castShadow = false;
  launchStrut1.receiveShadow = true;
  launchStrut1.position.x=(65)
  this.mesh.add(launchStrut1);

  var geomLaunchStrut2 = new THREE.BoxGeometry(10,60,10);
  var matLaunchStrut2 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut2 = new THREE.Mesh(geomLaunchStrut2, matLaunchStrut2);
  launchStrut2.position.y=245;
  launchStrut2.castShadow = false;
  launchStrut2.receiveShadow = true;
  launchStrut2.position.x=(55)
  this.mesh.add(launchStrut2);

  var geomLaunchStrut3 = new THREE.BoxGeometry(10,40,10);
  var matLaunchStrut3 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut3 = new THREE.Mesh(geomLaunchStrut3, matLaunchStrut3);
  launchStrut3.position.y=255;
  launchStrut3.castShadow = false;
  launchStrut3.receiveShadow = true;
  launchStrut3.position.x=(45)
  this.mesh.add(launchStrut3);

  var geomLaunchStrut4 = new THREE.BoxGeometry(10,20,10);
  var matLaunchStrut4 = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
  var launchStrut4 = new THREE.Mesh(geomLaunchStrut4, matLaunchStrut4);
  launchStrut4.position.y=265;
  launchStrut4.castShadow = false;
  launchStrut4.receiveShadow = true;
  launchStrut4.position.x=(35)
  this.mesh.add(launchStrut4);

}

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

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geomCloud = new THREE.BoxGeometry(200,100,100);
  var matCloud = new THREE.MeshPhongMaterial({color:Colors.white, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, shading:THREE.SmoothShading});
  var cloud = new THREE.Mesh(geomCloud, matCloud);
  cloud.position.y=(1000);
  cloud.castShadow = false;
  cloud.receiveShadow = false;
  cloud.position.x=(35);
  this.mesh.add(cloud);
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
var returnFlame;
var brakeOne;
var brakeTwo;
var brakeThree;
var brakeFour;
var orbitalFlame;
var fairing;
var satelite;
var solarWing1;
var solarWing2;
var solarWing3;
var solarWing4;
var solarWing5;
var solarWing6;
var cloud1;
var cloud2;
var cloud3;
var cloud4;
var cloud5;
//calls to functions to create and position 3D models

function createFalcon(){
  returnStage = new ReturnStage();
  orbitalStage = new OrbitalStage();
  legOne = new LegOne();
  legTwo = new LegTwo();
  legThree = new LegThree();
  legFour = new LegFour();
  brakeOne = new BrakeOne();
  brakeTwo = new BrakeTwo();
  brakeThree = new BrakeThree();
  brakeFour = new BrakeFour();
  returnFlame = new ReturnFlame();
  orbitalFlame = new OrbitalFlame();
  fairing = new Fairing();
  satelite = new Satelite();
  solarWing1 = new SolarWing1();
  solarWing2 = new SolarWing1();
  solarWing3 = new SolarWing1();
  solarWing4 = new SolarWing1();
  solarWing5 = new SolarWing1();
  solarWing6 = new SolarWing1();
  satelite.mesh.scale.set(.25,.25,.25);
  satelite.mesh.position.y = 80;
  solarWing1.mesh.scale.set(.25,.25,.25);
  solarWing1.mesh.position.y = 80;
  solarWing2.mesh.scale.set(.25,.25,.25);
  solarWing2.mesh.position.y = 80;
  solarWing3.mesh.scale.set(.25,.25,.25);
  solarWing3.mesh.position.y = 80;
  solarWing4.mesh.scale.set(.25,.25,.25);
  solarWing4.mesh.position.y = 80;
  solarWing5.mesh.scale.set(.25,.25,.25);
  solarWing5.mesh.position.y = 80;
  solarWing6.mesh.scale.set(.25,.25,.25);
  solarWing6.mesh.position.y = 80;
  fairing.mesh.scale.set(.25,.25,.25);
  fairing.mesh.position.y = 80;
  orbitalFlame.mesh.scale.set(.25,.25,.25);
  orbitalFlame.mesh.position.y = 80;
  returnStage.mesh.scale.set(.25,.25,.25);
  returnStage.mesh.position.y = 80;
  returnFlame.mesh.scale.set(.25,.25,.25);
  returnFlame.mesh.position.y = 80;
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
  brakeOne.mesh.scale.set(.25,.25,.25);
  brakeOne.mesh.position.y = 80;
  brakeTwo.mesh.scale.set(.25,.25,.25);
  brakeTwo.mesh.position.y = 80;
  brakeThree.mesh.scale.set(.25,.25,.25);
  brakeThree.mesh.position.y = 80;
  brakeFour.mesh.scale.set(.25,.25,.25);
  brakeFour.mesh.position.y = 80;
  group1 = new THREE.Object3D();
  group2 = new THREE.Object3D();
  group = new THREE.Object3D();
  sateliteGroup= new THREE.Object3D();

  group1.add(legOne.mesh);
  group1.add(legTwo.mesh);
  group1.add(legThree.mesh);
  group1.add(legFour.mesh);
  group1.add(returnStage.mesh);
  group1.add(returnFlame.mesh);
  group1.add(brakeOne.mesh);
  group1.add(brakeTwo.mesh);
  group1.add(brakeThree.mesh);
  group1.add(brakeFour.mesh);

  group2.add(orbitalFlame.mesh);
  group2.add(orbitalStage.mesh);
  group2.add(fairing.mesh);

  sateliteGroup.add(satelite.mesh);
  sateliteGroup.add(solarWing1.mesh);
  sateliteGroup.add(solarWing2.mesh);
  sateliteGroup.add(solarWing3.mesh);
  sateliteGroup.add(solarWing4.mesh);
  sateliteGroup.add(solarWing5.mesh);
  sateliteGroup.add(solarWing6.mesh);

  group2.add(sateliteGroup);

  group.add(group1);
  group.add(group2);
  scene.add(group);
}

function createLaunchSite(){
  launchSite= new LaunchSite();
  launchSite.mesh.scale.set(.25,.25,.25);
  launchSite.mesh.position.y = 75;
  scene.add(launchSite.mesh);
  launchStrut1 = new LaunchStrut1();
  launchStrut1.mesh.scale.set(.25,.25,.25);
  launchStrut1.mesh.position.y = 75;
  scene.add(launchStrut1.mesh);
  launchStrut2 = new LaunchStrut2();
  launchStrut2.mesh.scale.set(.25,.25,.25);
  launchStrut2.mesh.position.y = 75;
  scene.add(launchStrut2.mesh);

}

function createLandingSite(){
  landingSite= new LandingSite();
  landingSite.mesh.scale.set(.25,.25,.25);
  landingSite.mesh.position.y = 75;
  landingSite.mesh.position.x = 765;
  scene.add(landingSite.mesh);
}

function createSeaAndSky(){
  sea = new Sea();
  sea.mesh.position.y = -600;
  scene.add(sea.mesh);
  cloud1 = new Cloud();
  cloud1.mesh.position.y= -500;
  cloud1.mesh.position.z= -400;
  scene.add(cloud1.mesh);
  cloud2 = new Cloud();
  cloud2.mesh.position.y= -700;
  cloud2.mesh.position.z= -300;
  cloud2.mesh.position.x= 1000;
  scene.add(cloud2.mesh);
  cloud3 = new Cloud();
  cloud3.mesh.position.y= -200;
  cloud3.mesh.position.z= -200;
  cloud3.mesh.position.x= 500;
  scene.add(cloud3.mesh);
  cloud4 = new Cloud();
  cloud4.mesh.position.y= -300;
  cloud4.mesh.position.z= -100;
  cloud4.mesh.position.x= 800;
  scene.add(cloud4.mesh);

  cloud5 = new Cloud();
  cloud5.mesh.position.y= -600;
  cloud5.mesh.position.z= -100;
  cloud5.mesh.position.x= -300;
  scene.add(cloud5.mesh);
}

//i is the clock

var i=-120;

//the loop function is used to animate objects

function loop(){
  //release struts
  if(i>-20 && i<10){
    launchStrut1.mesh.translateX(-0.15);
    launchStrut1.mesh.rotateZ(Math.PI*2/3000);
    launchStrut2.mesh.translateX(0.15);
    launchStrut2.mesh.rotateZ(-Math.PI*2/3000);

  }
  //animate engine flames
  if((i%4)==0){
    returnFlame.mesh.translateY(1.5);
    orbitalFlame.mesh.translateY(1.5);
  }

  if(((i-2)%4)==0){
    returnFlame.mesh.translateY(-1.5);
    orbitalFlame.mesh.translateY(-1.5);
  }
  //rocket ascension
  if  (i<500 && i>=0){

    group.translateY( 2 );
    camera.translateY( 2 );
    camera.translateZ( 0.2 );

  }
  //rotate rocket to horizontal position
  if  (i<1250 && i>500){
    group.rotateZ( -Math.PI*2/3000 );

    if (i<800){
 	  group.translateY( 0.8 );
      group.translateX(0.8);
      camera.translateY( 0.3 );
      camera.translateX(1.15);
    }
    
  }
  //main engine cut off
  if  (i<1350 && i>1250){
    group.translateY( 1 );
    camera.translateX(1);
    returnFlame.mesh.translateY(0.5);
  }
  //second stage separation
  if  (i<1550 && i>1350){

    group1.translateY( 1 );
    group2.translateY( 2 );

    camera.translateX(1);
  }

  if  (i<1650 && i>1550){

    group.translateY( 1 );
    group2.translateY( 1 );

    camera.translateX(1);
  }
  //first stage begins re-entry rotation
  if  (i<2400 && i>1650){
    group1.rotateZ( Math.PI*2/3000 );
    group.translateY( 0.1 );
    group2.translateY( 1 );
    if (i<2000){
      camera.translateY(0.15);
    }

  }
  //rotate to re-entry angle and main engine start up
  if  (i<2650 && i>2400){
    group1.rotateZ( Math.PI*2/3000 );

    if (i>2550){
      returnFlame.mesh.translateY(-0.5);
    }

  }
  //rotate first stage to vertical position
    if  (i<3500 && i>2750){
    group1.rotateZ( -Math.PI*2/9000 );

  }
  //main engine cut off and air brake deployment
  if  (i<4500 && i>3500){

  	if (i<3600){
      returnFlame.mesh.translateY(0.5);
    }


  	if (i>4400){
      returnFlame.mesh.translateY(-0.5);
    }
  	
    group1.translateY( -1 );
    camera.translateY(-1);
    camera.translateZ( -0.1 );

    if (i<3750){
      brakeOne.mesh.rotateX( Math.PI*2/1000 );
      brakeOne.mesh.translateZ(-0.218);
      brakeOne.mesh.translateY(0.045);
      brakeTwo.mesh.rotateX( -Math.PI*2/1000 );
      brakeTwo.mesh.translateZ(0.218);
      brakeTwo.mesh.translateY(0.045);
      brakeThree.mesh.rotateZ( -Math.PI*2/1000 );
      brakeThree.mesh.translateX(-0.218);
      brakeThree.mesh.translateY(0.045);  
      brakeFour.mesh.rotateZ( Math.PI*2/1000 );
      brakeFour.mesh.translateX(0.218);
      brakeFour.mesh.translateY(0.045);     
    }
  }
  //landing legs deployed
  if  (i<4620 && i>4500){
    
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
  if  (i<4680 && i>4620){
  
    group1.translateY( -0.5 );
    camera.translateY(-0.4);
  }
  if  (i<4720 && i>4680){
  
    group1.translateY( -0.25 );
    camera.translateY(-0.2);
  }
  //landing and main engine cut off
  if  (i<5053 && i>4720){
  
    group1.translateY( -0.17 );
    camera.translateY(-0.175);
    if (i>5028){
      returnFlame.mesh.translateY(1);
    }
  }
  //camera pans to the second stage
  if  (i==5200){
  	camera.translateY(1050);
  	camera.translateX(1220);
  	camera.translateZ( 0 );
  }
  //second stage engine cut off
  if (i>5200 && i<5350){
  	if(i>5300){
    orbitalFlame.mesh.translateY(0.4)
    }
  }
  //fairing deployed
  if (i>5350 && i<5700){
  	fairing.mesh.translateY(1.5);


  	if(i>5400){
          fairing.mesh.rotateZ(-Math.PI*2/2000);
  		
  	}
  }
  //satelite deployed and solar wings extended
  if (i>5700 && i<6100){

    sateliteGroup.translateY(0.5);
    camera.translateX(0.5);
    if(i>5970){
      solarWing1.mesh.translateX(0.1);
      solarWing2.mesh.translateX(0.2);
      solarWing3.mesh.translateX(0.3);
      solarWing4.mesh.translateX(-0.1);
      solarWing5.mesh.translateX(-0.2);
      solarWing6.mesh.translateX(-0.3);
    }
  }
  //satelite spin start
  if(i>6100){
    sateliteGroup.rotateY(Math.PI*2/1500);
    sateliteGroup.translateY(0.5);
    camera.translateX(0.5);
  }

  i++;

  requestAnimationFrame(loop);

  renderer.render(scene, camera);
}

//init is the first function called

function init(event){

  createScene();
  createLights();
  createFalcon();
  createSeaAndSky();
  createLaunchSite();
  createLandingSite();
  loop();
}

window.addEventListener('load', init, false);
