/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};
		var size = renderer.getSize();
		renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[i].setSize( width, height );

		}

	}

} );


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen
	this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

	setSize: function( width, height ) {},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		console.error( "THREE.Pass: .render() must be implemented in derived pass." );

	}

} );

/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 */
/** @namespace */
var THREEx	= THREEx || {}

/**
 * provide info on THREE.WebGLRenderer
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
*/
THREEx.RendererStats	= function (){

	var msMin	= 100;
	var msMax	= 0;

	var container	= document.createElement( 'div' );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var msDiv	= document.createElement( 'div' );
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200;';
	container.appendChild( msDiv );

	var msText	= document.createElement( 'div' );
	msText.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML= 'WebGLRenderer';
	msDiv.appendChild( msText );
	
	var msTexts	= [];
	var nLines	= 9;
	for(var i = 0; i < nLines; i++){
		msTexts[i]	= document.createElement( 'div' );
		msTexts[i].style.cssText = 'color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
		msDiv.appendChild( msTexts[i] );		
		msTexts[i].innerHTML= '-';
	}


	var lastTime	= Date.now();
	return {
		domElement: container,

		update: function(webGLRenderer){
			// sanity check
			console.assert(webGLRenderer instanceof THREE.WebGLRenderer)

			// refresh only 30time per second
			if( Date.now() - lastTime < 1000/30 )	return;
			lastTime	= Date.now()

			var i	= 0;
			msTexts[i++].textContent = "== Memory =====";
			msTexts[i++].textContent = "Programs: "	+ webGLRenderer.info.memory.programs;
			msTexts[i++].textContent = "Geometries: "+webGLRenderer.info.memory.geometries;
			msTexts[i++].textContent = "Textures: "	+ webGLRenderer.info.memory.textures;

			msTexts[i++].textContent = "== Render =====";
			msTexts[i++].textContent = "Calls: "	+ webGLRenderer.info.render.calls;
			msTexts[i++].textContent = "Vertices: "	+ webGLRenderer.info.render.vertices;
			msTexts[i++].textContent = "Faces: "	+ webGLRenderer.info.render.faces;
			msTexts[i++].textContent = "Points: "	+ webGLRenderer.info.render.points;
		}
	}	
};
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

    var scope = this;

    this.object = object;
    this.object.rotation.reorder( "YXZ" );

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;

    this.hasOrientation = false;

    var onDeviceOrientationChangeEvent = function( event ) {

        scope.deviceOrientation = event;
        scope.hasOrientation = true;

    };

    var onScreenOrientationChangeEvent = function() {

        scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function() {

        var zee = new THREE.Vector3( 0, 0, 1 );

        var euler = new THREE.Euler();

        var q0 = new THREE.Quaternion();

        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

        return function( quaternion, alpha, beta, gamma, orient ) {

            euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

            quaternion.setFromEuler( euler ); // orient the device

            quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

            quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

        }

    }();

    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

        scope.enabled = true;

    };

    this.disconnect = function() {

        window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

        scope.enabled = false;

    };

    this.update = function() {

        if ( scope.enabled === false ) return;

        var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
        var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
        var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
        var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

        setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
        this.alpha = alpha;

    };

    this.updateAlphaOffsetAngle = function( angle ) {

        this.alphaOffsetAngle = angle;
        this.update();

    };

    this.dispose = function() {

        this.disconnect();

    };

    this.connect();

};
/**
* @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
* @author Tony Parisi / http://www.tonyparisi.com/
*/

THREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = null;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};
	var lights = {};

	var animData;
	var kinematics;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	function load ( url, readyCallback, progressCallback, failCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {

				if ( request.readyState === 4 ) {

					if ( request.status === 0 || request.status === 200 ) {

						if ( request.response ) {

							readyCallbackFunc = readyCallback;
							parse( request.response, undefined, url );

						} else {

							if ( failCallback ) {

								failCallback( { type: 'error', url: url } );

							} else {

								console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

							}

						}

					}else{

						if( failCallback ){

							failCallback( { type: 'error', url: url } );

						}else{

							console.error( 'ColladaLoader: Couldn\'t load "' + url + '" (' + request.status + ')' );

						}

					}

				} else if ( request.readyState === 3 ) {

					if ( progressCallback ) {

						if ( length === 0 ) {

							length = request.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: request.responseText.length } );

					}

				}

			};

			request.open( "GET", url, true );
			request.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	}

	function parse( text, callBack, url ) {

		COLLADA = new DOMParser().parseFromString( text, 'text/xml' );
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "library_images image", _Image, "image" );
		materials = parseLib( "library_materials material", Material, "material" );
		effects = parseLib( "library_effects effect", Effect, "effect" );
		geometries = parseLib( "library_geometries geometry", Geometry, "geometry" );
		cameras = parseLib( "library_cameras camera", Camera, "camera" );
		lights = parseLib( "library_lights light", Light, "light" );
		controllers = parseLib( "library_controllers controller", Controller, "controller" );
		animations = parseLib( "library_animations animation", Animation, "animation" );
		visualScenes = parseLib( "library_visual_scenes visual_scene", VisualScene, "visual_scene" );
		kinematicsModels = parseLib( "library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model" );

		morphs = [];
		skins = [];

		visualScene = parseScene();
		scene = new THREE.Group();

		for ( var i = 0; i < visualScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( visualScene.nodes[ i ] ) );

		}

		// unit conversion
		scene.scale.multiplyScalar( colladaUnit );

		createAnimations();

		kinematicsModel = parseKinematicsModel();
		createKinematics();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			kinematics: kinematics,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				lights: lights,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				visualScene: visualScene,
				scene: visualScene,
				kinematicsModels: kinematicsModels,
				kinematicsModel: kinematicsModel
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	}

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	}

	function parseAsset () {

		var elements = COLLADA.querySelectorAll('asset');

		var element = elements[0];

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	}

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.querySelectorAll(q);

		var lib = {};

		var i = 0;

		var elementsLength = elements.length;

		for ( var j = 0; j < elementsLength; j ++ ) {

			var element = elements[j];
			var daeElement = ( new classSpec() ).parse( element );

			if ( !daeElement.id || daeElement.id.length === 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

		}

		return lib;

	}

	function parseScene() {

		var sceneElement = COLLADA.querySelectorAll('scene instance_visual_scene')[0];

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	}

	function parseKinematicsModel() {

		var kinematicsModelElement = COLLADA.querySelectorAll('instance_kinematics_model')[0];

		if ( kinematicsModelElement ) {

			var url = kinematicsModelElement.getAttribute( 'url' ).replace(/^#/, '');
			return kinematicsModels[ url.length > 0 ? url : 'kinematics_model0' ];

		} else {

			return null;

		}

	}

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	}

	function recurseHierarchy( node ) {

		var n = visualScene.getChildById( node.colladaId, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( var i = 0, il = n.keys.length; i < il; i ++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i ++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	}

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;
		var ID;
		for ( var id in animations ) {

			var animation = animations[ id ];
			ID = ID || animation.id;
			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];

				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames,ID:ID };

	}

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	}

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = visualScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

			}

		}

	}

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.localworld = node.localworld || new THREE.Matrix4();
		node.world.copy( node.matrix );
		node.localworld.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );
				node.localworld.copy(m);
				if (frame === 0)
					node.matrix.copy(m);
			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	}

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid === skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices(bone.world, inv); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4();

				bone.animatrix.copy(bone.localworld);
				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++ ) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint === found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				console.warn( "ColladaLoader: Could not find joint '" + bone.sid + "'." );

				bone.skinningMatrix = new THREE.Matrix4();
				bone.weights = [];

			}
		}

	}

	//Walk the Collada tree and flatten the bones into a list, extract the position, quat and scale from the matrix
	function flattenSkeleton(skeleton) {

		var list = [];
		var walk = function(parentid, node, list) {

			var bone = {};
			bone.name = node.sid;
			bone.parent = parentid;
			bone.matrix = node.matrix;
			var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
			bone.matrix.decompose(data[0], data[1], data[2]);

			bone.pos = [ data[0].x,data[0].y,data[0].z ];

			bone.scl = [ data[2].x,data[2].y,data[2].z ];
			bone.rotq = [ data[1].x,data[1].y,data[1].z,data[1].w ];
			list.push(bone);

			for (var i in node.nodes) {

				walk(node.sid, node.nodes[i], list);

			}

		};

		walk(-1, skeleton, list);
		return list;

	}

	//Move the vertices into the pose that is proper for the start of the animation
	function skinToBindPose(geometry,skeleton,skinController) {

		var bones = [];
		setupSkeleton( skeleton, bones, -1 );
		setupSkinningMatrices( bones, skinController.skin );
		var v = new THREE.Vector3();
		var skinned = [];

		for (var i = 0; i < geometry.vertices.length; i ++) {

			skinned.push(new THREE.Vector3());

		}

		for ( i = 0; i < bones.length; i ++ ) {

			if ( bones[ i ].type != 'JOINT' ) continue;

			for ( var j = 0; j < bones[ i ].weights.length; j ++ ) {

				var w = bones[ i ].weights[ j ];
				var vidx = w.index;
				var weight = w.weight;

				var o = geometry.vertices[vidx];
				var s = skinned[vidx];

				v.x = o.x;
				v.y = o.y;
				v.z = o.z;

				v.applyMatrix4( bones[i].skinningMatrix );

				s.x += (v.x * weight);
				s.y += (v.y * weight);
				s.z += (v.z * weight);
			}

		}

		for (var i = 0; i < geometry.vertices.length; i ++) {

			geometry.vertices[i] = skinned[i];

		}

	}

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = visualScene.getChildById( instanceCtrl.skeleton[0], true ) || visualScene.getChildBySid( instanceCtrl.skeleton[0], true );

		//flatten the skeleton into a list of bones
		var bonelist = flattenSkeleton(skeleton);
		var joints = skinController.skin.joints;

		//sort that list so that the order reflects the order in the joint list
		var sortedbones = [];
		for (var i = 0; i < joints.length; i ++) {

			for (var j = 0; j < bonelist.length; j ++) {

				if (bonelist[j].name === joints[i]) {

					sortedbones[i] = bonelist[j];

				}

			}

		}

		//hook up the parents by index instead of name
		for (var i = 0; i < sortedbones.length; i ++) {

			for (var j = 0; j < sortedbones.length; j ++) {

				if (sortedbones[i].parent === sortedbones[j].name) {

					sortedbones[i].parent = j;

				}

			}

		}


		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape
		for ( i = 0; i < geometry.vertices.length; i ++ ) {
			geometry.vertices[i].applyMatrix4( skinController.skin.bindShapeMatrix );
		}

		var skinIndices = [];
		var skinWeights = [];
		var weights = skinController.skin.weights;

		// hook up the skin weights
		// TODO - this might be a good place to choose greatest 4 weights
		for ( var i =0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4(weights[i][0] ? weights[i][0].joint : 0,weights[i][1] ? weights[i][1].joint : 0,weights[i][2] ? weights[i][2].joint : 0,weights[i][3] ? weights[i][3].joint : 0);
			var weight = new THREE.Vector4(weights[i][0] ? weights[i][0].weight : 0,weights[i][1] ? weights[i][1].weight : 0,weights[i][2] ? weights[i][2].weight : 0,weights[i][3] ? weights[i][3].weight : 0);

			skinIndices.push(indicies);
			skinWeights.push(weight);

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// process animation, or simply pose the rig if no animation

		//create an animation for the animated bones
		//NOTE: this has no effect when using morphtargets
		var animationdata = { "name":animationBounds.ID,"fps":30,"length":animationBounds.frames / 30,"hierarchy":[] };

		for (var j = 0; j < sortedbones.length; j ++) {

			animationdata.hierarchy.push({ parent:sortedbones[j].parent, name:sortedbones[j].name, keys:[] });

		}

		console.log( 'ColladaLoader:', animationBounds.ID + ' has ' + sortedbones.length + ' bones.' );



		skinToBindPose(geometry, skeleton, skinController);


		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];
			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			for (var i = 0; i < bones.length; i ++) {

				for (var j = 0; j < animationdata.hierarchy.length; j ++) {

					if (animationdata.hierarchy[j].name === bones[i].sid) {

						var key = {};
						key.time = (frame / 30);
						key.matrix = bones[i].animatrix;

						if (frame === 0)
							bones[i].matrix = key.matrix;

						var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
						key.matrix.decompose(data[0], data[1], data[2]);

						key.pos = [ data[0].x,data[0].y,data[0].z ];

						key.scl = [ data[2].x,data[2].y,data[2].z ];
						key.rot = data[1];

						animationdata.hierarchy[j].keys.push(key);

					}

				}

			}

			geometry.animation = animationdata;

		}

	}

	function createKinematics() {

		if ( kinematicsModel && kinematicsModel.joints.length === 0 ) {
			kinematics = undefined;
			return;
		}

		var jointMap = {};

		var _addToMap = function( jointIndex, parentVisualElement ) {

			var parentVisualElementId = parentVisualElement.getAttribute( 'id' );
			var colladaNode = visualScene.getChildById( parentVisualElementId, true );
			var joint = kinematicsModel.joints[ jointIndex ];

			scene.traverse(function( node ) {

				if ( node.colladaId == parentVisualElementId ) {

					jointMap[ jointIndex ] = {
						node: node,
						transforms: colladaNode.transforms,
						joint: joint,
						position: joint.zeroPosition
					};

				}

			});

		};

		kinematics = {

			joints: kinematicsModel && kinematicsModel.joints,

			getJointValue: function( jointIndex ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					return jointData.position;

				} else {

					console.log( 'getJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			},

			setJointValue: function( jointIndex, value ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					var joint = jointData.joint;

					if ( value > joint.limits.max || value < joint.limits.min ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ')' );

					} else if ( joint.static ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' is static' );

					} else {

						var threejsNode = jointData.node;
						var axis = joint.axis;
						var transforms = jointData.transforms;

						var matrix = new THREE.Matrix4();

						for (i = 0; i < transforms.length; i ++ ) {

							var transform = transforms[ i ];

							// kinda ghetto joint detection
							if ( transform.sid && transform.sid.indexOf( 'joint' + jointIndex ) !== -1 ) {

								// apply actual joint value here
								switch ( joint.type ) {

									case 'revolute':

										matrix.multiply( m1.makeRotationAxis( axis, THREE.Math.degToRad(value) ) );
										break;

									case 'prismatic':

										matrix.multiply( m1.makeTranslation(axis.x * value, axis.y * value, axis.z * value ) );
										break;

									default:

										console.warn( 'setJointValue: unknown joint type: ' + joint.type );
										break;

								}

							} else {

								var m1 = new THREE.Matrix4();

								switch ( transform.type ) {

									case 'matrix':

										matrix.multiply( transform.obj );

										break;

									case 'translate':

										matrix.multiply( m1.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );

										break;

									case 'rotate':

										matrix.multiply( m1.makeRotationAxis( transform.obj, transform.angle ) );

										break;

								}
							}
						}

						// apply the matrix to the threejs node
						var elementsFloat32Arr = matrix.elements;
						var elements = Array.prototype.slice.call( elementsFloat32Arr );

						var elementsRowMajor = [
							elements[ 0 ],
							elements[ 4 ],
							elements[ 8 ],
							elements[ 12 ],
							elements[ 1 ],
							elements[ 5 ],
							elements[ 9 ],
							elements[ 13 ],
							elements[ 2 ],
							elements[ 6 ],
							elements[ 10 ],
							elements[ 14 ],
							elements[ 3 ],
							elements[ 7 ],
							elements[ 11 ],
							elements[ 15 ]
						];

						threejsNode.matrix.set.apply( threejsNode.matrix, elementsRowMajor );
						threejsNode.matrix.decompose( threejsNode.position, threejsNode.quaternion, threejsNode.scale );
					}

				} else {

					console.log( 'setJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			}

		};

		var element = COLLADA.querySelector('scene instance_kinematics_scene');

		if ( element ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				if ( child.nodeType != 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':

						var visualTarget = child.getAttribute( 'target' ).split( '/' ).pop();
						var axis = child.querySelector('axis param').textContent;
						var jointIndex = parseInt( axis.split( 'joint' ).pop().split( '.' )[0] );
						var visualTargetElement = COLLADA.querySelector( '[sid="' + visualTarget + '"]' );

						if ( visualTargetElement ) {
							var parentVisualElement = visualTargetElement.parentElement;
							_addToMap(jointIndex, parentVisualElement);
						}

						break;

					default:

						break;

				}

			}
		}

	}

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length === 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( !( instance_material.symbol in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ instance_material.symbol ] = _copied_material;

							}

							material3js = double_sided_materials[ instance_material.symbol ];

						}

						material3js.opacity = !material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MultiMaterial( used_materials_array );
					
					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined ) {


					applySkin( geom, skinController );

					if ( geom.morphTargets.length > 0 ) {

						material.morphTargets = true;
						material.skinning = false;

					} else {

						material.morphTargets = false;
						material.skinning = true;

					}


					mesh = new THREE.SkinnedMesh( geom, material, false );


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers[ skinController.url ];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					if ( geom.isLineStrip === true ) {

						mesh = new THREE.Line( geom );

					} else {

						mesh = new THREE.Mesh( geom, material );

					}

				}

				obj.add(mesh);

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			var cam = new THREE.PerspectiveCamera(cparams.yfov, parseFloat(cparams.aspect_ratio),
					parseFloat(cparams.znear), parseFloat(cparams.zfar));

			obj.add(cam);
		}

		for ( i = 0; i < node.lights.length; i ++ ) {

			var light = null;
			var instance_light = node.lights[i];
			var lparams = lights[instance_light.url];

			if ( lparams && lparams.technique ) {

				var color = lparams.color.getHex();
				var intensity = lparams.intensity;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;

				switch ( lparams.technique ) {

					case 'directional':

						light = new THREE.DirectionalLight( color, intensity, distance );
						light.position.set(0, 0, 1);
						break;

					case 'point':

						light = new THREE.PointLight( color, intensity, distance );
						break;

					case 'spot':

						light = new THREE.SpotLight( color, intensity, distance, angle );
						light.position.set(0, 0, 1);
						break;

					case 'ambient':

						light = new THREE.AmbientLight( color );
						break;

				}

			}

			if (light) {
				obj.add(light);
			}
		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

		if ( options.centerGeometry && obj.geometry ) {

			var delta = obj.geometry.center();
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	}

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] === id ) {

				return i;

			}

		}

	}

	function getLibraryNode( id ) {

		var nodes = COLLADA.querySelectorAll('library_nodes node');

		for ( var i = 0; i < nodes.length; i++ ) {

			var attObj = nodes[i].attributes.getNamedItem('id');

			if ( attObj && attObj.value === id ) {

				return nodes[i];

			}

		}

		return undefined;

	}

	function getChannelsForNode ( node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	}

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	}

	function calcMatrixAt( node, t ) {

		var animated = {};

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			var channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			var channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix.multiplyMatrices( matrix, value );

					} else {

						// FIXME: handle other types

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			} else {

				matrix.multiplyMatrices( matrix, transform.matrix );

			}

		}

		return matrix;

	}

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i ++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j ++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j ++ ) {

						var time = input[j],
							data = sampler.getData( transform.type, j, member ),
							key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx === -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i ++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j ++ ) {

					var key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	}

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal === null; i ++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	}

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx === -1; i ++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	}

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx - 1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx + 1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++ i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	}

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx ++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx -- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	function _Image() {

		this.id = "";
		this.init_from = "";

	}

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	}

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	}

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	}

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic === 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic === 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j ++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group();

	}

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	}

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid === transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id === id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid === sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid === sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');
		this.layer = element.getAttribute('layer');

		this.type = this.type === 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					this.lights.push( ( new InstanceLight() ).parse( child ) );
					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	}

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[3] );

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4();

		return function ( matrix ) {

			switch ( this.type ) {

				case 'matrix':

					matrix.multiply( this.obj );

					break;

				case 'translate':

					matrix.multiply( m1.makeTranslation( this.obj.x, this.obj.y, this.obj.z ) );

					break;

				case 'rotate':

					matrix.multiply( m1.makeRotationAxis( this.obj, this.angle ) );

					break;

				case 'scale':

					matrix.scale( this.obj );

					break;

			}

		};

	}();

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	}

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = child.querySelectorAll('instance_material');

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[j];
						this.instance_material.push( (new InstanceMaterial()).parse(instance) );

					}


					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	}

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	}

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName === 'bind_material' ) {

				var instances = child.querySelectorAll('instance_material');

				for ( var j = 0; j < instances.length; j ++ ) {

					var instance = instances[j];
					this.instance_material.push( (new InstanceMaterial()).parse(instance) );

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	}

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	}

	Mesh.prototype.parse = function ( element ) {

		this.primitives = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'linestrips':

					this.primitives.push( ( new LineStrips().parse( child ) ) );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		if ( this.vertices === null ) {

			// TODO (mrdoob): Study case when this is null (carrier.dae)

			return this;

		}

		var vertexData = sources[ this.vertices.input['POSITION'].source ].data;

		for ( var i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( var i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		return this;

	};

	Mesh.prototype.handlePrimitive = function ( primitive, geom ) {

		if ( primitive instanceof LineStrips ) {

			// TODO: Handle indices. Maybe easier with BufferGeometry?

			geom.isLineStrip = true;
			return;

		}

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];

			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset) ? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++ pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( !ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[3], ns.length ? [ ns[0].clone(), ns[1].clone(), ns[3].clone() ] : [], cs.length ? [ cs[0], cs[1], cs[3] ] : new THREE.Color() ) );

					faces.push( new THREE.Face3( vs[1], vs[2], vs[3], ns.length ? [ ns[1].clone(), ns[2].clone(), ns[3].clone() ] : [], cs.length ? [ cs[1], cs[2], cs[3] ] : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						faces.push( new THREE.Face3( vs[0], vs[k], vs[k + 1], ns.length ? [ ns[0].clone(), ns[k ++].clone(), ns[k].clone() ] : [], clr ) );

					}

				}

				if ( faces.length ) {

					for ( var ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k ++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx + 1], uv[ndx + 2] ];

							} else if ( vcount === 4 ) {

								if ( ndx === 0 ) {

									uvArr = [ uv[0], uv[1], uv[3] ];

								} else {

									uvArr = [ uv[1].clone(), uv[2], uv[3].clone() ];

								}

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( geom.faceVertexUvs[k] === undefined ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}

		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	}

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source === vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	}

	Polylist.prototype = Object.create( Polygons.prototype );
	Polylist.prototype.constructor = Polylist;

	function LineStrips() {

		Polygons.call( this );

		this.vcount = 1;

	}

	LineStrips.prototype = Object.create( Polygons.prototype );
	LineStrips.prototype.constructor = LineStrips;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	}

	Triangles.prototype = Object.create( Polygons.prototype );
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	}

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	}

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName === 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	}

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic === 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	}

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName === 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

		var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

		switch ( param.type ) {

			case 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				for ( var j = 0; j < this.data.length; j += 16 ) {

					var s = this.data.slice( j, j + 16 );
					var m = getConvertedMat4( s );
					result.push( m );
				}

				break;

			default:

				console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
				break;

		}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	}

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color();
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	}

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture === null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		if (element.nodeName === 'transparent') {

			this.opaque = element.getAttribute('opaque');

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color();
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );

					break;

				case 'wrapU':
				case 'wrapV':

					// some dae have a value of true which becomes NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						this.texOpts[ child.nodeName ] = 1;

					} else {

						this.texOpts[ child.nodeName ] = parseInt( child.textContent );

					}
					break;

				default:

					this.texOpts[ child.nodeName ] = child.textContent;

					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	}

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'bump':

					// If 'bumptype' is 'heightfield', create a 'bump' property
					// Else if 'bumptype' is 'normalmap', create a 'normal' property
					// (Default to 'bump')
					var bumpType = child.getAttribute( 'bumptype' );
					if ( bumpType ) {
						if ( bumpType.toLowerCase() === "heightfield" ) {
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						} else if ( bumpType.toLowerCase() === "normalmap" ) {
							this[ 'normal' ] = ( new ColorOrTexture() ).parse( child );
						} else {
							console.error( "Shader.prototype.parse: Invalid value for attribute 'bumptype' (" + bumpType + ") - valid bumptypes are 'HEIGHTFIELD' and 'NORMALMAP' - defaulting to 'HEIGHTFIELD'" );
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						}
					} else {
						console.warn( "Shader.prototype.parse: Attribute 'bumptype' missing from bump node - defaulting to 'HEIGHTFIELD'" );
						this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
					}

					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = child.querySelectorAll('float');

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};

		var transparent = false;

		if (this['transparency'] !== undefined && this['transparent'] !== undefined) {
			// convert transparent color RBG to average value
			var transparentColor = this['transparent'];
			var transparencyLevel = (this.transparent.color.r + this.transparent.color.g + this.transparent.color.b) / 3 * this.transparency;

			if (transparencyLevel > 0) {
				transparent = true;
				props[ 'transparent' ] = true;
				props[ 'opacity' ] = 1 - transparencyLevel;

			}

		}

		var keys = {
			'diffuse':'map',
			'ambient':'lightMap',
			'specular':'specularMap',
			'emission':'emissionMap',
			'bump':'bumpMap',
			'normal':'normalMap'
			};

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'normal':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler[samplerId];

							if ( surfaceId !== undefined && surfaceId.source !== undefined ) {

								var surface = this.effect.surface[surfaceId.source];

								if ( surface !== undefined ) {

									var image = images[ surface.init_from ];

									if ( image ) {

										var url = baseUrl + image.init_from;

										var texture;
										var loader = THREE.Loader.Handlers.get( url );

										if ( loader !== null ) {

											texture = loader.load( url );

										} else {

											texture = new THREE.Texture();

											loadTextureImage( texture, url );

										}

										texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props[keys[prop]] = texture;

										// Texture with baked lighting?
										if (prop === 'emission') props['emissive'] = 0xffffff;

									}

								}

							}

						} else if ( prop === 'diffuse' || !transparent ) {

							if ( prop === 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if ( props[ prop ] > 0.0 ) props['envMap'] = options.defaultEnvMap;
					props['combine'] = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props[ 'refractionRatio' ] = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props['envMap'] = options.defaultEnvMap;
					break;

				case 'transparency':
					// gets figured out up top
					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;
		props[ 'side' ] = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		if ( props.diffuse !== undefined ) {

			props.color = props.diffuse;
			delete props.diffuse;

		}

		switch ( this.type ) {

			case 'constant':

				if (props.emissive != undefined) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	}

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	}

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	}

	Effect.prototype.create = function () {

		if ( this.shader === null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[sid] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[sid] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;
				case 'extra':
					this.parseExtra(child);
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtra = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseExtraTechnique( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bump':
					this.shader.parse( element );
					break;
				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	}

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	}

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	}

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	}

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx, member ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++ i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

			if ( member && type === 'translate' ) {
				data = getConvertedTranslation( member, data );
			}

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	}

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0, l = this.targets.length; i < l; i ++ ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++ j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	// Camera
	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique === 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique === 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	}

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	// Light

	function Light() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Light.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				case 'technique':

					this.parseTechnique( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Light.prototype.parseCommon = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			switch ( element.childNodes[ i ].nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes[ i ].nodeName;

					var light = element.childNodes[ i ];

					for ( var j = 0; j < light.childNodes.length; j ++ ) {

						var child = light.childNodes[j];

						switch ( child.nodeName ) {

							case 'color':

								var rgba = _floats( child.textContent );
								this.color = new THREE.Color(0);
								this.color.setRGB( rgba[0], rgba[1], rgba[2] );
								this.color.a = rgba[3];
								break;

							case 'falloff_angle':

								this.falloff_angle = parseFloat( child.textContent );
								break;

							case 'quadratic_attenuation':
								var f = parseFloat( child.textContent );
								this.distance = f ? Math.sqrt( 1 / f ) : 0;
						}

					}

			}

		}

		return this;

	};

	Light.prototype.parseTechnique = function ( element ) {

		this.profile = element.getAttribute( 'profile' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'intensity':

					this.intensity = parseFloat(child.textContent);
					break;

			}

		}

		return this;

	};

	function InstanceLight() {

		this.url = "";

	}

	InstanceLight.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function KinematicsModel( ) {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.joints = [];
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon(child);
					break;

				default:
					break;

			}

		}

		return this;

	};

	KinematicsModel.prototype.parseCommon = function( element ) {

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( element.childNodes[ i ].nodeName ) {

				case 'joint':
					this.joints.push( (new Joint()).parse(child) );
					break;

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Joint( ) {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector('axis');
		var _axis = _floats(axisElement.textContent);
		this.axis = getConvertedVec3(_axis, 0);

		var min = element.querySelector('limits min') ? parseFloat(element.querySelector('limits min').textContent) : -360;
		var max = element.querySelector('limits max') ? parseFloat(element.querySelector('limits max').textContent) : 360;

		this.limits = {
			min: min,
			max: max
		};

		var jointTypes = [ 'prismatic', 'revolute' ];
		for (var i = 0; i < jointTypes.length; i ++ ) {

			var type = jointTypes[ i ];

			var jointElement = element.querySelector(type);

			if ( jointElement ) {

				this.type = type;

			}

		}

		// if the min is equal to or somehow greater than the max, consider the joint static
		if ( this.limits.min >= this.limits.max ) {

			this.static = true;

		}

		this.middlePosition = (this.limits.min + this.limits.max) / 2.0;
		return this;

	};

	function Link( ) {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.transforms = [];
		this.attachments = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					this.attachments.push( (new Attachment()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function Attachment( ) {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function( element ) {

		this.joint = element.getAttribute('joint').split('/').pop();
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	}

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix === "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	}

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] === 'true' || raw[i] === '1') ? true : false );

		}

		return data;

	}

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	}

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	}

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	}

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	}

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	}

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	}

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	}

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while ( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	}

	function loadTextureImage ( texture, url ) {

		var loader = new THREE.ImageLoader();

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

	}

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = element.querySelectorAll('extra double_sided')[0];

		if ( node ) {

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	}

	// Up axis conversion

	function setUpConversion() {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	}

	function fixCoords( data, sign ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	}

	function getConvertedTranslation( axis, data ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return data;

		}

		switch ( axis ) {
			case 'X':
				data = upConversion === 'XtoY' ? data * -1 : data;
				break;
			case 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX' ? data * -1 : data;
				break;
			case 'Z':
				data = upConversion === 'ZtoY' ? data * -1 : data ;
				break;
			default:
				break;
		}

		return data;
	}

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	}

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4().set(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	}

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = [ 'X', 'Y', 'Z' ],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	}

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	}

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

    this.materials = null;

    this.regexp = {
        // v float float float
        vertex_pattern           : /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vn float float float
        normal_pattern           : /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // vt float float
        uv_pattern               : /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        // f vertex vertex vertex
        face_vertex              : /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
        // f vertex/uv vertex/uv vertex/uv
        face_vertex_uv           : /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
        face_vertex_uv_normal    : /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
        // f vertex//normal vertex//normal vertex//normal
        face_vertex_normal       : /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
        // o object_name | g group_name
        object_pattern           : /^[og]\s*(.+)?/,
        // s boolean
        smoothing_pattern        : /^s\s+(\d+|on|off)/,
        // mtllib file_reference
        material_library_pattern : /^mtllib /,
        // usemtl material_name
        material_use_pattern     : /^usemtl /
    };

};

THREE.OBJLoader.prototype = {

    constructor: THREE.OBJLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var loader = new THREE.XHRLoader( scope.manager );
        loader.setPath( this.path );
        loader.load( url, function ( text ) {

            onLoad( scope.parse( text ) );

        }, onProgress, onError );

    },

    setPath: function ( value ) {

        this.path = value;

    },

    setMaterials: function ( materials ) {

        this.materials = materials;

    },

    _createParserState : function () {

        var state = {
            objects  : [],
            object   : {},

            vertices : [],
            normals  : [],
            uvs      : [],

            materialLibraries : [],

            startObject: function ( name, fromDeclaration ) {

                // If the current object (initial from reset) is not from a g/o declaration in the parsed
                // file. We need to use it for the first parsed g/o to keep things in sync.
                if ( this.object && this.object.fromDeclaration === false ) {

                    this.object.name = name;
                    this.object.fromDeclaration = ( fromDeclaration !== false );
                    return;

                }

                if ( this.object && typeof this.object._finalize === 'function' ) {

                    this.object._finalize();

                }

                var previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );

                this.object = {
                    name : name || '',
                    fromDeclaration : ( fromDeclaration !== false ),

                    geometry : {
                        vertices : [],
                        normals  : [],
                        uvs      : []
                    },
                    materials : [],
                    smooth : true,

                    startMaterial : function( name, libraries ) {

                        var previous = this._finalize( false );

                        // New usemtl declaration overwrites an inherited material, except if faces were declared
                        // after the material, then it must be preserved for proper MultiMaterial continuation.
                        if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

                            this.materials.splice( previous.index, 1 );

                        }

                        var material = {
                            index      : this.materials.length,
                            name       : name || '',
                            mtllib     : ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
                            smooth     : ( previous !== undefined ? previous.smooth : this.smooth ),
                            groupStart : ( previous !== undefined ? previous.groupEnd : 0 ),
                            groupEnd   : -1,
                            groupCount : -1,
                            inherited  : false,

                            clone : function( index ) {
                                return {
                                    index      : ( typeof index === 'number' ? index : this.index ),
                                    name       : this.name,
                                    mtllib     : this.mtllib,
                                    smooth     : this.smooth,
                                    groupStart : this.groupEnd,
                                    groupEnd   : -1,
                                    groupCount : -1,
                                    inherited  : false
                                };
                            }
                        };

                        this.materials.push( material );

                        return material;

                    },

                    currentMaterial : function() {

                        if ( this.materials.length > 0 ) {
                            return this.materials[ this.materials.length - 1 ];
                        }

                        return undefined;

                    },

                    _finalize : function( end ) {

                        var lastMultiMaterial = this.currentMaterial();
                        if ( lastMultiMaterial && lastMultiMaterial.groupEnd === -1 ) {

                            lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                            lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                            lastMultiMaterial.inherited = false;

                        }

                        // Guarantee at least one empty material, this makes the creation later more straight forward.
                        if ( end !== false && this.materials.length === 0 ) {
                            this.materials.push({
                                name   : '',
                                smooth : this.smooth
                            });
                        }

                        return lastMultiMaterial;

                    }
                };

                // Inherit previous objects material.
                // Spec tells us that a declared material must be set to all objects until a new material is declared.
                // If a usemtl declaration is encountered while this new object is being parsed, it will
                // overwrite the inherited material. Exception being that there was already face declarations
                // to the inherited material, then it will be preserved for proper MultiMaterial continuation.

                if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === "function" ) {

                    var declared = previousMaterial.clone( 0 );
                    declared.inherited = true;
                    this.object.materials.push( declared );

                }

                this.objects.push( this.object );

            },

            finalize : function() {

                if ( this.object && typeof this.object._finalize === 'function' ) {

                    this.object._finalize();

                }

            },

            parseVertexIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

            },

            parseNormalIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

            },

            parseUVIndex: function ( value, len ) {

                var index = parseInt( value, 10 );
                return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

            },

            addVertex: function ( a, b, c ) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ b + 2 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );
                dst.push( src[ c + 2 ] );

            },

            addVertexLine: function ( a ) {

                var src = this.vertices;
                var dst = this.object.geometry.vertices;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );

            },

            addNormal : function ( a, b, c ) {

                var src = this.normals;
                var dst = this.object.geometry.normals;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ a + 2 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ b + 2 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );
                dst.push( src[ c + 2 ] );

            },

            addUV: function ( a, b, c ) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );
                dst.push( src[ b + 0 ] );
                dst.push( src[ b + 1 ] );
                dst.push( src[ c + 0 ] );
                dst.push( src[ c + 1 ] );

            },

            addUVLine: function ( a ) {

                var src = this.uvs;
                var dst = this.object.geometry.uvs;

                dst.push( src[ a + 0 ] );
                dst.push( src[ a + 1 ] );

            },

            addFace: function ( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

                var vLen = this.vertices.length;

                var ia = this.parseVertexIndex( a, vLen );
                var ib = this.parseVertexIndex( b, vLen );
                var ic = this.parseVertexIndex( c, vLen );
                var id;

                if ( d === undefined ) {

                    this.addVertex( ia, ib, ic );

                } else {

                    id = this.parseVertexIndex( d, vLen );

                    this.addVertex( ia, ib, id );
                    this.addVertex( ib, ic, id );

                }

                if ( ua !== undefined ) {

                    var uvLen = this.uvs.length;

                    ia = this.parseUVIndex( ua, uvLen );
                    ib = this.parseUVIndex( ub, uvLen );
                    ic = this.parseUVIndex( uc, uvLen );

                    if ( d === undefined ) {

                        this.addUV( ia, ib, ic );

                    } else {

                        id = this.parseUVIndex( ud, uvLen );

                        this.addUV( ia, ib, id );
                        this.addUV( ib, ic, id );

                    }

                }

                if ( na !== undefined ) {

                    // Normals are many times the same. If so, skip function call and parseInt.
                    var nLen = this.normals.length;
                    ia = this.parseNormalIndex( na, nLen );

                    ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
                    ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

                    if ( d === undefined ) {

                        this.addNormal( ia, ib, ic );

                    } else {

                        id = this.parseNormalIndex( nd, nLen );

                        this.addNormal( ia, ib, id );
                        this.addNormal( ib, ic, id );

                    }

                }

            },

            addLineGeometry: function ( vertices, uvs ) {

                this.object.geometry.type = 'Line';

                var vLen = this.vertices.length;
                var uvLen = this.uvs.length;

                for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {

                    this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );

                }

                for ( var uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

                    this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );

                }

            }

        };

        state.startObject( '', false );

        return state;

    },

    parse: function ( text ) {

        console.time( 'OBJLoader' );

        var state = this._createParserState();

        if ( text.indexOf( '\r\n' ) !== - 1 ) {

            // This is faster than String.split with regex that splits on both
            text = text.replace( '\r\n', '\n' );

        }

        var lines = text.split( '\n' );
        var line = '', lineFirstChar = '', lineSecondChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = ( typeof ''.trimLeft === 'function' );

        for ( var i = 0, l = lines.length; i < l; i ++ ) {

            line = lines[ i ];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if ( lineLength === 0 ) continue;

            lineFirstChar = line.charAt( 0 );

            // @todo invoke passed in handler if any
            if ( lineFirstChar === '#' ) continue;

            if ( lineFirstChar === 'v' ) {

                lineSecondChar = line.charAt( 1 );

                if ( lineSecondChar === ' ' && ( result = this.regexp.vertex_pattern.exec( line ) ) !== null ) {

                    // 0                  1      2      3
                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.vertices.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] ),
                        parseFloat( result[ 3 ] )
                    );

                } else if ( lineSecondChar === 'n' && ( result = this.regexp.normal_pattern.exec( line ) ) !== null ) {

                    // 0                   1      2      3
                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.normals.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] ),
                        parseFloat( result[ 3 ] )
                    );

                } else if ( lineSecondChar === 't' && ( result = this.regexp.uv_pattern.exec( line ) ) !== null ) {

                    // 0               1      2
                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    state.uvs.push(
                        parseFloat( result[ 1 ] ),
                        parseFloat( result[ 2 ] )
                    );

                } else {

                    throw new Error( "Unexpected vertex/normal/uv line: '" + line  + "'" );

                }

            } else if ( lineFirstChar === "f" ) {

                if ( ( result = this.regexp.face_vertex_uv_normal.exec( line ) ) !== null ) {

                    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
                    // 0                        1    2    3    4    5    6    7    8    9   10         11         12
                    // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
                        result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
                        result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
                    );

                } else if ( ( result = this.regexp.face_vertex_uv.exec( line ) ) !== null ) {

                    // f vertex/uv vertex/uv vertex/uv
                    // 0                  1    2    3    4    5    6   7          8
                    // ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                        result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                    );

                } else if ( ( result = this.regexp.face_vertex_normal.exec( line ) ) !== null ) {

                    // f vertex//normal vertex//normal vertex//normal
                    // 0                     1    2    3    4    5    6   7          8
                    // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(
                        result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
                        undefined, undefined, undefined, undefined,
                        result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
                    );

                } else if ( ( result = this.regexp.face_vertex.exec( line ) ) !== null ) {

                    // f vertex vertex vertex
                    // 0            1    2    3   4
                    // ["f 1 2 3", "1", "2", "3", undefined]

                    state.addFace(
                        result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
                    );

                } else {

                    throw new Error( "Unexpected face line: '" + line  + "'" );

                }

            } else if ( lineFirstChar === "l" ) {

                var lineParts = line.substring( 1 ).trim().split( " " );
                var lineVertices = [], lineUVs = [];

                if ( line.indexOf( "/" ) === - 1 ) {

                    lineVertices = lineParts;

                } else {

                    for ( var li = 0, llen = lineParts.length; li < llen; li ++ ) {

                        var parts = lineParts[ li ].split( "/" );

                        if ( parts[ 0 ] !== "" ) lineVertices.push( parts[ 0 ] );
                        if ( parts[ 1 ] !== "" ) lineUVs.push( parts[ 1 ] );

                    }

                }
                state.addLineGeometry( lineVertices, lineUVs );

            } else if ( ( result = this.regexp.object_pattern.exec( line ) ) !== null ) {

                // o object_name
                // or
                // g group_name

                var name = result[ 0 ].substr( 1 ).trim();
                state.startObject( name );

            } else if ( this.regexp.material_use_pattern.test( line ) ) {

                // material

                state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

            } else if ( this.regexp.material_library_pattern.test( line ) ) {

                // mtl file

                state.materialLibraries.push( line.substring( 7 ).trim() );

            } else if ( ( result = this.regexp.smoothing_pattern.exec( line ) ) !== null ) {

                // smooth shading

                // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                // but does not define a usemtl for each face set.
                // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                // This requires some care to not create extra material on each smooth value for "normal" obj files.
                // where explicit usemtl defines geometry groups.
                // Example asset: examples/models/obj/cerberus/Cerberus.obj

                var value = result[ 1 ].trim().toLowerCase();
                state.object.smooth = ( value === '1' || value === 'on' );

                var material = state.object.currentMaterial();
                if ( material ) {

                    material.smooth = state.object.smooth;

                }

            } else {

                // Handle null terminated files without exception
                if ( line === '\0' ) continue;

                throw new Error( "Unexpected line: '" + line  + "'" );

            }

        }

        state.finalize();

        var container = new THREE.Group();
        container.materialLibraries = [].concat( state.materialLibraries );

        for ( var i = 0, l = state.objects.length; i < l; i ++ ) {

            var object = state.objects[ i ];
            var geometry = object.geometry;
            var materials = object.materials;
            var isLine = ( geometry.type === 'Line' );

            // Skip o/g line declarations that did not follow with any faces
            if ( geometry.vertices.length === 0 ) continue;

            var buffergeometry = new THREE.BufferGeometry();

            buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

            if ( geometry.normals.length > 0 ) {

                buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );

            } else {

                buffergeometry.computeVertexNormals();

            }

            if ( geometry.uvs.length > 0 ) {

                buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

            }

            // Create materials

            var createdMaterials = [];

            for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

                var sourceMaterial = materials[mi];
                var material = undefined;

                if ( this.materials !== null ) {

                    material = this.materials.create( sourceMaterial.name );

                    // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                    if ( isLine && material && ! ( material instanceof THREE.LineBasicMaterial ) ) {

                        var materialLine = new THREE.LineBasicMaterial();
                        materialLine.copy( material );
                        material = materialLine;

                    }

                }

                if ( ! material ) {

                    material = ( ! isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial() );
                    material.name = sourceMaterial.name;

                }

                material.shading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;

                createdMaterials.push(material);

            }

            // Create mesh

            var mesh;

            if ( createdMaterials.length > 1 ) {

                for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

                    var sourceMaterial = materials[mi];
                    buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

                }

                var multiMaterial = new THREE.MultiMaterial( createdMaterials );
                mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, multiMaterial ) : new THREE.Line( buffergeometry, multiMaterial ) );

            } else {

                mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] ) : new THREE.Line( buffergeometry, createdMaterials[ 0 ] ) );
            }

            mesh.name = object.name;

            container.add( mesh );

        }

        console.timeEnd( 'OBJLoader' );

        return container;

    }

};
/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.AdaptiveToneMappingPass = function ( adaptive, resolution ) {

	THREE.Pass.call( this );

	this.resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;
	this.adaptive = adaptive !== undefined ? !! adaptive : true;

	this.luminanceRT = null;
	this.previousLuminanceRT = null;
	this.currentLuminanceRT = null;

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.NoBlending,
		depthTest: false

	} );

	if ( THREE.LuminosityShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.LuminosityShader" );

	this.materialLuminance = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( THREE.LuminosityShader.uniforms ),
		vertexShader: THREE.LuminosityShader.vertexShader,
		fragmentShader: THREE.LuminosityShader.fragmentShader,
		blending: THREE.NoBlending,
	} );

	this.adaptLuminanceShader = {
		defines: {
			"MIP_LEVEL_1X1" : ( Math.log( this.resolution ) / Math.log( 2.0 ) ).toFixed( 1 ),
		},
		uniforms: {
			"lastLum": { value: null },
			"currentLum": { value: null },
			"delta": { value: 0.016 },
			"tau": { value: 1.0 }
		},
		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join( '\n' ),
		fragmentShader: [
			"varying vec2 vUv;",

			"uniform sampler2D lastLum;",
			"uniform sampler2D currentLum;",
			"uniform float delta;",
			"uniform float tau;",

			"void main() {",

				"vec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );",
				"vec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );",

				"float fLastLum = lastLum.r;",
				"float fCurrentLum = currentLum.r;",

				//The adaption seems to work better in extreme lighting differences
				//if the input luminance is squared.
				"fCurrentLum *= fCurrentLum;",

				// Adapt the luminance using Pattanaik's technique
				"float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));",
				// "fAdaptedLum = sqrt(fAdaptedLum);",
				"gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );",
			"}",
		].join( '\n' )
	};

	this.materialAdaptiveLum = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( this.adaptLuminanceShader.uniforms ),
		vertexShader: this.adaptLuminanceShader.vertexShader,
		fragmentShader: this.adaptLuminanceShader.fragmentShader,
		defines: this.adaptLuminanceShader.defines,
		blending: THREE.NoBlending
	} );

	if ( THREE.ToneMapShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.ToneMapShader" );

	this.materialToneMap = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( THREE.ToneMapShader.uniforms ),
		vertexShader: THREE.ToneMapShader.vertexShader,
		fragmentShader: THREE.ToneMapShader.fragmentShader,
		blending: THREE.NoBlending
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.AdaptiveToneMappingPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.AdaptiveToneMappingPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.needsInit ) {

			this.reset( renderer );

			this.luminanceRT.texture.type = readBuffer.texture.type;
			this.previousLuminanceRT.texture.type = readBuffer.texture.type;
			this.currentLuminanceRT.texture.type = readBuffer.texture.type;
			this.needsInit = false;

		}

		if ( this.adaptive ) {

			//Render the luminance of the current scene into a render target with mipmapping enabled
			this.quad.material = this.materialLuminance;
			this.materialLuminance.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render( this.scene, this.camera, this.currentLuminanceRT );

			//Use the new luminance values, the previous luminance and the frame delta to
			//adapt the luminance over time.
			this.quad.material = this.materialAdaptiveLum;
			this.materialAdaptiveLum.uniforms.delta.value = delta;
			this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT.texture;
			this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT.texture;
			renderer.render( this.scene, this.camera, this.luminanceRT );

			//Copy the new adapted luminance value so that it can be used by the next frame.
			this.quad.material = this.materialCopy;
			this.copyUniforms.tDiffuse.value = this.luminanceRT.texture;
			renderer.render( this.scene, this.camera, this.previousLuminanceRT );

		}

		this.quad.material = this.materialToneMap;
		this.materialToneMap.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

	},

	reset: function( renderer ) {

		// render targets
		if ( this.luminanceRT ) {

			this.luminanceRT.dispose();

		}
		if ( this.currentLuminanceRT ) {

			this.currentLuminanceRT.dispose();

		}
		if ( this.previousLuminanceRT ) {

			this.previousLuminanceRT.dispose();

		}

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }; // was RGB format. changed to RGBA format. see discussion in #8415 / #8450

		this.luminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.luminanceRT.texture.generateMipmaps = false;

		this.previousLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.previousLuminanceRT.texture.generateMipmaps = false;

		// We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
		pars.minFilter = THREE.LinearMipMapLinearFilter;
		this.currentLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );

		if ( this.adaptive ) {

			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		}
		//Put something in the adaptive luminance texture so that the scene can render initially
		this.quad.material = new THREE.MeshBasicMaterial( { color: 0x777777 } );
		this.materialLuminance.needsUpdate = true;
		this.materialAdaptiveLum.needsUpdate = true;
		this.materialToneMap.needsUpdate = true;
		// renderer.render( this.scene, this.camera, this.luminanceRT );
		// renderer.render( this.scene, this.camera, this.previousLuminanceRT );
		// renderer.render( this.scene, this.camera, this.currentLuminanceRT );

	},

	setAdaptive: function( adaptive ) {

		if ( adaptive ) {

			this.adaptive = true;
			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		} else {

			this.adaptive = false;
			delete this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ];
			this.materialToneMap.uniforms.luminanceMap.value = null;

		}
		this.materialToneMap.needsUpdate = true;

	},

	setAdaptionRate: function( rate ) {

		if ( rate ) {

			this.materialAdaptiveLum.uniforms.tau.value = Math.abs( rate );

		}

	},

	setMaxLuminance: function( maxLum ) {

		if ( maxLum ) {

			this.materialToneMap.uniforms.maxLuminance.value = maxLum;

		}

	},

	setAverageLuminance: function( avgLum ) {

		if ( avgLum ) {

			this.materialToneMap.uniforms.averageLuminance.value = avgLum;

		}

	},

	setMiddleGrey: function( middleGrey ) {

		if ( middleGrey ) {

			this.materialToneMap.uniforms.middleGrey.value = middleGrey;

		}

	},

	dispose: function() {

		if ( this.luminanceRT ) {

			this.luminanceRT.dispose();

		}
		if ( this.previousLuminanceRT ) {

			this.previousLuminanceRT.dispose();

		}
		if ( this.currentLuminanceRT ) {

			this.currentLuminanceRT.dispose();

		}
		if ( this.materialLuminance ) {

			this.materialLuminance.dispose();

		}
		if ( this.materialAdaptiveLum ) {

			this.materialAdaptiveLum.dispose();

		}
		if ( this.materialCopy ) {

			this.materialCopy.dispose();

		}
		if ( this.materialToneMap ) {

			this.materialToneMap.dispose();

		}

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, luminanceThreshold, kernelSize, sigma, resolutionX, resolutionY ) {

	THREE.Pass.call( this );

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	this.resolutionX = ( resolutionX !== undefined ) ? resolutionX : 256;
	this.resolutionY = ( resolutionY !== undefined ) ? resolutionY : 256;
	luminanceThreshold = ( luminanceThreshold !== undefined) ? luminanceThreshold : .8;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( this.resolutionX, this.resolutionY, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( this.resolutionX, this.resolutionY, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var thresholdShader = THREE.ThresholdShader;
	this.thresholdUniforms = THREE.UniformsUtils.clone( thresholdShader.uniforms );
	this.thresholdUniforms["threshold"].value = luminanceThreshold;
	this.threshold = new THREE.ShaderMaterial( {
		uniforms: this.thresholdUniforms,
		vertexShader: thresholdShader.vertexShader,
		fragmentShader: thresholdShader.fragmentShader,
		depthTest: false
	} );

	var copyShader = THREE.CopyShader;
	this.compositeUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
	this.compositeUniforms[ "opacity" ].value = strength;
	this.composite = new THREE.ShaderMaterial( {

		uniforms: this.compositeUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = new THREE.Vector2(1.0 / this.resolutionX, 0.0);
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.BloomPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		this.quad.material = this.threshold;

		this.thresholdUniforms[ "tDiffuse" ].value = readBuffer;
		renderer.render( this.scene, this.camera, this.renderTargetY, false );

		// Render quad with blurred scene into texture (convolution pass 1)
		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetY;
		this.convolutionUniforms[ "uImageIncrement" ].value = new THREE.Vector2(1.0 / this.resolutionX, 0.0);

		renderer.render( this.scene, this.camera, this.renderTargetX, false );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = new THREE.Vector2(0.0, 1.0 / this.resolutionY);

		renderer.render( this.scene, this.camera, this.renderTargetY, false );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.composite;

		this.compositeUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, false );

		// restore original state
		renderer.autoClear = autoClear;

	},

	resize: function(x, y)
	{
		this.resolutionX = x;
		this.resolutionY = y;
		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		this.renderTargetX = new THREE.WebGLRenderTarget( this.resolutionX, this.resolutionY, pars );
		this.renderTargetY = new THREE.WebGLRenderTarget( this.resolutionX, this.resolutionY, pars );
	}

} );

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );
/**
 * Depth-of-field post-process with bokeh shader
 */


THREE.BokehPass = function ( scene, camera, params ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
	var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
	var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
	var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;

	// render targets

	var width = params.width || window.innerWidth || 1;
	var height = params.height || window.innerHeight || 1;

	this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.renderTargetDepth = this.renderTargetColor.clone();

	// depth material

	this.materialDepth = new THREE.MeshDepthMaterial();

	// bokeh material

	if ( THREE.BokehShader === undefined ) {

		console.error( "THREE.BokehPass relies on THREE.BokehShader" );

	}

	var bokehShader = THREE.BokehShader;
	var bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );

	bokehUniforms[ "tDepth" ].value = this.renderTargetDepth.texture;

	bokehUniforms[ "focus" ].value = focus;
	bokehUniforms[ "aspect" ].value = aspect;
	bokehUniforms[ "aperture" ].value = aperture;
	bokehUniforms[ "maxblur" ].value = maxblur;

	this.materialBokeh = new THREE.ShaderMaterial( {
		uniforms: bokehUniforms,
		vertexShader: bokehShader.vertexShader,
		fragmentShader: bokehShader.fragmentShader
	} );

	this.uniforms = bokehUniforms;
	this.needsSwap = false;

	this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene2  = new THREE.Scene();

	this.quad2 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene2.add( this.quad2 );

};

THREE.BokehPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.BokehPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.quad2.material = this.materialBokeh;

		// Render depth into texture

		this.scene.overrideMaterial = this.materialDepth;

		renderer.render( this.scene, this.camera, this.renderTargetDepth, true );

		// Render bokeh composite

		this.uniforms[ "tColor" ].value = readBuffer.texture;

		if ( this.renderToScreen ) {

			renderer.render( this.scene2, this.camera2 );

		} else {

			renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

		}

		this.scene.overrideMaterial = null;

	}

} );

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ClearPass = function () {

	THREE.Pass.call( this );

	this.needsSwap = false;

};

THREE.ClearPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ClearPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.setRenderTarget( readBuffer );
		renderer.clear();

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DotScreenPass = function ( center, angle, scale ) {

	THREE.Pass.call( this );

	if ( THREE.DotScreenShader === undefined )
		console.error( "THREE.DotScreenPass relies on THREE.DotScreenShader" );

	var shader = THREE.DotScreenShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
	if ( angle !== undefined ) this.uniforms[ "angle" ].value = angle;
	if ( scale !== undefined ) this.uniforms[ "scale" ].value = scale;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.DotScreenPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.DotScreenPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	THREE.Pass.call( this );

	if ( THREE.FilmShader === undefined )
		console.error( "THREE.FilmPass relies on THREE.FilmShader" );

	var shader = THREE.FilmShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.FilmPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.FilmPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "time" ].value += delta;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GlitchPass = function ( dt_size ) {

	THREE.Pass.call( this );

	if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

	var shader = THREE.DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( dt_size == undefined ) dt_size = 64;


	this.uniforms[ "tDisp" ].value = this.generateHeightmap( dt_size );


	this.material = new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.goWild = false;
	this.curF = 0;
	this.generateTrigger();

};

THREE.GlitchPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.GlitchPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ 'seed' ].value = Math.random();//default seeding
		this.uniforms[ 'byp' ].value = 0;

		if ( this.curF % this.randX == 0 || this.goWild == true ) {

			this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.curF = 0;
			this.generateTrigger();

		} else if ( this.curF % this.randX < this.randX / 5 ) {

			this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );

		} else if ( this.goWild == false ) {

			this.uniforms[ 'byp' ].value = 1;

		}

		this.curF ++;
		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	generateTrigger: function() {

		this.randX = THREE.Math.randInt( 120, 240 );

	},

	generateHeightmap: function( dt_size ) {

		var data_arr = new Float32Array( dt_size * dt_size * 3 );
		var length = dt_size * dt_size;

		for ( var i = 0; i < length; i ++ ) {

			var val = THREE.Math.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;

		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;
		return texture;

	}

} );

/**
*
* Manual Multi-Sample Anti-Aliasing Render Pass
*
* @author bhouston / http://clara.io/
*
* This manual approach to MSAA re-renders the scene ones for each sample with camera jitter and accumulates the results.
*
* References: https://en.wikipedia.org/wiki/Multisample_anti-aliasing
*
*/

THREE.ManualMSAARenderPass = function ( scene, camera, clearColor, clearAlpha ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.sampleLevel = 4; // specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.
	this.unbiased = true;

	// as we need to clear the buffer in this pass, clearColor must be set to something, defaults to black.
	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	if ( THREE.CopyShader === undefined ) console.error( "THREE.ManualMSAARenderPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;
	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyMaterial = new THREE.ShaderMaterial(	{
		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		premultipliedAlpha: true,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		depthWrite: false
	} );

	this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene2	= new THREE.Scene();
	this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.copyMaterial );
	this.scene2.add( this.quad2 );

};

THREE.ManualMSAARenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ManualMSAARenderPass,

	dispose: function() {

		if ( this.sampleRenderTarget ) {

			this.sampleRenderTarget.dispose();
			this.sampleRenderTarget = null;

		}

	},

	setSize: function ( width, height ) {

		if ( this.sampleRenderTarget )	this.sampleRenderTarget.setSize( width, height );

	},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height,
				{ minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );

		}

		var jitterOffsets = THREE.ManualMSAARenderPass.JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var oldClearColor = renderer.getClearColor().getHex();
		var oldClearAlpha = renderer.getClearAlpha();

		var baseSampleWeight = 1.0 / jitterOffsets.length;
		var roundingRange = 1 / 32;
		this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;

		var width = readBuffer.width, height = readBuffer.height;

		// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
		for ( var i = 0; i < jitterOffsets.length; i ++ ) {

			var jitterOffset = jitterOffsets[i];
			if ( this.camera.setViewOffset ) {
				this.camera.setViewOffset( width, height,
					jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
					width, height );
			}

			var sampleWeight = baseSampleWeight;
			if( this.unbiased ) {
				// the theory is that equal weights for each sample lead to an accumulation of rounding errors.
				// The following equation varies the sampleWeight per sample so that it is uniformly distributed
				// across a range of values whose rounding errors cancel each other out.
				var uniformCenteredDistribution = ( -0.5 + ( i + 0.5 ) / jitterOffsets.length );
				sampleWeight += roundingRange * uniformCenteredDistribution;
			}

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			renderer.setClearColor( this.clearColor, this.clearAlpha );
			renderer.render( this.scene, this.camera, this.sampleRenderTarget, true );
			if (i === 0) {
				renderer.setClearColor( 0x000000, 0.0 );
			}
			renderer.render( this.scene2, this.camera2, this.renderToScreen ? null : writeBuffer, (i === 0) );

		}

		if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		renderer.autoClear = autoClear;
		renderer.setClearColor( oldClearColor, oldClearAlpha );

	}

} );


// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8,8) integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers need to be scaled by 1/16.
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
THREE.ManualMSAARenderPass.JitterVectors = [
	[
		[ 0, 0 ]
	],
	[
		[ 4, 4 ], [ - 4, - 4 ]
	],
	[
		[ - 2, - 6 ], [ 6, - 2 ], [ - 6, 2 ], [ 2, 6 ]
	],
	[
		[ 1, - 3 ], [ - 1, 3 ], [ 5, 1 ], [ - 3, - 5 ],
		[ - 5, 5 ], [ - 7, - 1 ], [ 3, 7 ], [ 7, - 7 ]
	],
	[
		[ 1, 1 ], [ - 1, - 3 ], [ - 3, 2 ], [ 4, - 1 ],
		[ - 5, - 2 ], [ 2, 5 ], [ 5, 3 ], [ 3, - 5 ],
		[ - 2, 6 ], [ 0, - 7 ], [ - 4, - 6 ], [ - 6, 4 ],
		[ - 8, 0 ], [ 7, - 4 ], [ 6, 7 ], [ - 7, - 8 ]
	],
	[
		[ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
		[ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
		[ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
		[ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
		[ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
		[ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
		[ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
		[ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
	]
];

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.MaskPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var context = renderer.context;
		var state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

	}

} );


THREE.ClearMaskPass = function () {

	THREE.Pass.call( this );

	this.needsSwap = false;

};

THREE.ClearMaskPass.prototype = Object.create( THREE.Pass.prototype );

Object.assign( THREE.ClearMaskPass.prototype, {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.state.buffers.stencil.setTest( false );

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.RenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function ( renderTarget ) {

	THREE.Pass.call( this );

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.SavePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.textureID = "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

	}

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.SavePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SavePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		renderer.render( this.scene, this.camera, this.renderTarget, this.clear );

	}

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	THREE.Pass.call( this );

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof THREE.ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );

/**
 * @author mpk / http://polko.me/
 */

THREE.SMAAPass = function ( width, height ) {

	THREE.Pass.call( this );

	// render targets

	this.edgesRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.weightsRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	} );

	// textures

	var areaTextureImage = new Image();
	areaTextureImage.src = this.getAreaTexture();

	this.areaTexture = new THREE.Texture();
	this.areaTexture.image = areaTextureImage;
	this.areaTexture.format = THREE.RGBFormat;
	this.areaTexture.minFilter = THREE.LinearFilter;
	this.areaTexture.generateMipmaps = false;
	this.areaTexture.needsUpdate = true;
	this.areaTexture.flipY = false;

	var searchTextureImage = new Image();
	searchTextureImage.src = this.getSearchTexture();

	this.searchTexture = new THREE.Texture();
	this.searchTexture.image = searchTextureImage;
	this.searchTexture.magFilter = THREE.NearestFilter;
	this.searchTexture.minFilter = THREE.NearestFilter;
	this.searchTexture.generateMipmaps = false;
	this.searchTexture.needsUpdate = true;
	this.searchTexture.flipY = false;

	// materials - pass 1

	if ( THREE.SMAAShader === undefined ) {
		console.error( "THREE.SMAAPass relies on THREE.SMAAShader" );
	}

	this.uniformsEdges = THREE.UniformsUtils.clone( THREE.SMAAShader[0].uniforms );

	this.uniformsEdges[ "resolution" ].value.set( 1 / width, 1 / height );

	this.materialEdges = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[0].defines,
		uniforms: this.uniformsEdges,
		vertexShader: THREE.SMAAShader[0].vertexShader,
		fragmentShader: THREE.SMAAShader[0].fragmentShader
	} );

	// materials - pass 2

	this.uniformsWeights = THREE.UniformsUtils.clone( THREE.SMAAShader[1].uniforms );

	this.uniformsWeights[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsWeights[ "tDiffuse" ].value = this.edgesRT.texture;
	this.uniformsWeights[ "tArea" ].value = this.areaTexture;
	this.uniformsWeights[ "tSearch" ].value = this.searchTexture;

	this.materialWeights = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[1].defines,
		uniforms: this.uniformsWeights,
		vertexShader: THREE.SMAAShader[1].vertexShader,
		fragmentShader: THREE.SMAAShader[1].fragmentShader
	} );

	// materials - pass 3

	this.uniformsBlend = THREE.UniformsUtils.clone( THREE.SMAAShader[2].uniforms );

	this.uniformsBlend[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsBlend[ "tDiffuse" ].value = this.weightsRT.texture;

	this.materialBlend = new THREE.ShaderMaterial( {
		uniforms: this.uniformsBlend,
		vertexShader: THREE.SMAAShader[2].vertexShader,
		fragmentShader: THREE.SMAAShader[2].fragmentShader
	} );

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.SMAAPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SMAAPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		// pass 1

		this.uniformsEdges[ "tDiffuse" ].value = readBuffer.texture;

		this.quad.material = this.materialEdges;

		renderer.render( this.scene, this.camera, this.edgesRT, this.clear );

		// pass 2

		this.quad.material = this.materialWeights;

		renderer.render( this.scene, this.camera, this.weightsRT, this.clear );

		// pass 3

		this.uniformsBlend[ "tColor" ].value = readBuffer.texture;

		this.quad.material = this.materialBlend;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	setSize: function ( width, height ) {

		this.edgesRT.setSize( width, height );
		this.weightsRT.setSize( width, height );

		this.materialEdges.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialWeights.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialBlend.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	},

	getAreaTexture: function () {
		return 'data:image/png;base64,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';
	},

	getSearchTexture: function () {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII=';
	}

} );

/**
 *
 * Temporal Anti-Aliasing Render Pass
 *
 * @author bhouston / http://clara.io/
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * References:
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 *
 */

THREE.TAARenderPass = function ( scene, camera, params ) {

	if ( THREE.ManualMSAARenderPass === undefined ) {

		console.error( "THREE.TAARenderPass relies on THREE.ManualMSAARenderPass" );

	}
	THREE.ManualMSAARenderPass.call( this, scene, camera, params );

	this.sampleLevel = 0;
	this.accumulate = false;

};

THREE.TAARenderPass.JitterVectors = THREE.ManualMSAARenderPass.JitterVectors;

THREE.TAARenderPass.prototype = Object.assign( Object.create( THREE.ManualMSAARenderPass.prototype ), {

	constructor: THREE.TAARenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if( ! this.accumulate ) {

				THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta );

				this.accumulateIndex = -1;
				return;

		}

		var jitterOffsets = THREE.TAARenderPass.JitterVectors[ 5 ];

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

		}

		if ( ! this.holdRenderTarget ) {

			this.holdRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );

		}

		if( this.accumulate && this.accumulateIndex === -1 ) {

				THREE.ManualMSAARenderPass.prototype.render.call( this, renderer, this.holdRenderTarget, readBuffer, delta );

				this.accumulateIndex = 0;

		}

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var sampleWeight = 1.0 / ( jitterOffsets.length );

		if( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			this.copyUniforms[ "tDiffuse" ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
			var numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( var i = 0; i < numSamplesPerFrame; i ++ ) {

				var j = this.accumulateIndex;
				var jitterOffset = jitterOffsets[j];
				if ( this.camera.setViewOffset ) {
					this.camera.setViewOffset( readBuffer.width, readBuffer.height,
						jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
						readBuffer.width, readBuffer.height );
				}

				renderer.render( this.scene, this.camera, writeBuffer, true );
				renderer.render( this.scene2, this.camera2, this.sampleRenderTarget, ( this.accumulateIndex === 0 ) );

				this.accumulateIndex ++;
				if( this.accumulateIndex >= jitterOffsets.length ) break;
			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		var accumulationWeight = this.accumulateIndex * sampleWeight;

		if( accumulationWeight > 0 ) {
			this.copyUniforms[ "opacity" ].value = 1.0;
			this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, true );
		}
		if( accumulationWeight < 1.0 ) {
			this.copyUniforms[ "opacity" ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ "tDiffuse" ].value = this.holdRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, ( accumulationWeight === 0 ) );
		}

		renderer.autoClear = autoClear;

	}

});

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function ( texture, opacity ) {

	THREE.Pass.call( this );

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].value = texture;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.TexturePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.TexturePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.quad.material = this.material;

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

} );

/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"void main() {",

			"gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

THREE.BleachBypassShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 base = texture2D( tDiffuse, vUv );",

			"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
			"float lum = dot( lumCoeff, base.rgb );",
			"vec3 blend = vec3( lum );",

			"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

			"vec3 result1 = 2.0 * base.rgb * blend;",
			"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

			"vec3 newColor = mix( result1, result2, L );",

			"float A2 = opacity * base.a;",
			"vec3 mixRGB = A2 * newColor.rgb;",
			"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

			"gl_FragColor = vec4( mixRGB, base.a );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

THREE.BlendShader = {

	uniforms: {

		"tDiffuse1": { value: null },
		"tDiffuse2": { value: null },
		"mixRatio":  { value: 0.5 },
		"opacity":   { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float mixRatio;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

THREE.BokehShader = {

	uniforms: {

		"tColor":   { value: null },
		"tDepth":   { value: null },
		"focus":    { value: 1.0 },
		"aspect":   { value: 1.0 },
		"aperture": { value: 0.025 },
		"maxblur":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"uniform float maxblur;",  // max blur amount
		"uniform float aperture;", // aperture - bigger values for shallower depth of field

		"uniform float focus;",
		"uniform float aspect;",

		"void main() {",

			"vec2 aspectcorrect = vec2( 1.0, aspect );",

			"vec4 depth1 = texture2D( tDepth, vUv );",

			"float factor = depth1.x - focus;",

			"vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

			"vec2 dofblur9 = dofblur * 0.9;",
			"vec2 dofblur7 = dofblur * 0.7;",
			"vec2 dofblur4 = dofblur * 0.4;",

			"vec4 col = vec4( 0.0 );",

			"col += texture2D( tColor, vUv.xy );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

			"gl_FragColor = col / 41.0;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join( "\n" )

};

/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



THREE.BokehShader = {

	uniforms: {

		"textureWidth":  { value: 1.0 },
		"textureHeight":  { value: 1.0 },

		"focalDepth":   { value: 1.0 },
		"focalLength":   { value: 24.0 },
		"fstop": { value: 0.9 },

		"tColor":   { value: null },
		"tDepth":   { value: null },

		"maxblur":  { value: 1.0 },

		"showFocus":   { value: 0 },
		"manualdof":   { value: 0 },
		"vignetting":   { value: 0 },
		"depthblur":   { value: 0 },

		"threshold":  { value: 0.5 },
		"gain":  { value: 2.0 },
		"bias":  { value: 0.5 },
		"fringe":  { value: 0.7 },

		"znear":  { value: 0.1 },
		"zfar":  { value: 100 },

		"noise":  { value: 1 },
		"dithering":  { value: 0.0001 },
		"pentagon": { value: 0 },

		"shaderFocus":  { value: 1 },
		"focusCoords":  { value: new THREE.Vector2() },


	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",
		"uniform float textureWidth;",
		"uniform float textureHeight;",

		"uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below",
		"uniform float focalLength; //focal length in mm",
		"uniform float fstop; //f-stop value",
		"uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",

		"/*",
		"make sure that these two values are the same for your camera, otherwise distances will be wrong.",
		"*/",

		"uniform float znear; // camera clipping start",
		"uniform float zfar; // camera clipping end",

		"//------------------------------------------",
		"//user variables",

		"const int samples = SAMPLES; //samples on the first ring",
		"const int rings = RINGS; //ring count",

		"const int maxringsamples = rings * samples;",

		"uniform bool manualdof; // manual dof calculation",
		"float ndofstart = 1.0; // near dof blur start",
		"float ndofdist = 2.0; // near dof blur falloff distance",
		"float fdofstart = 1.0; // far dof blur start",
		"float fdofdist = 3.0; // far dof blur falloff distance",

		"float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)",

		"uniform bool vignetting; // use optical lens vignetting",

		"float vignout = 1.3; // vignetting outer border",
		"float vignin = 0.0; // vignetting inner border",
		"float vignfade = 22.0; // f-stops till vignete fades",

		"uniform bool shaderFocus;",
		"// disable if you use external focalDepth value",

		"uniform vec2 focusCoords;",
		"// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)",
		"// if center of screen use vec2(0.5, 0.5);",

		"uniform float maxblur;",
		"//clamp value of max blur (0.0 = no blur, 1.0 default)",

		"uniform float threshold; // highlight threshold;",
		"uniform float gain; // highlight gain;",

		"uniform float bias; // bokeh edge bias",
		"uniform float fringe; // bokeh chromatic aberration / fringing",

		"uniform bool noise; //use noise instead of pattern for sample dithering",

		"uniform float dithering;",

		"uniform bool depthblur; // blur the depth buffer",
		"float dbsize = 1.25; // depth blur size",

		"/*",
		"next part is experimental",
		"not looking good with small sample and ring count",
		"looks okay starting from samples = 4, rings = 4",
		"*/",

		"uniform bool pentagon; //use pentagon as bokeh shape?",
		"float feather = 0.4; //pentagon shape feather",

		"//------------------------------------------",

		"float penta(vec2 coords) {",
			"//pentagonal shape",
			"float scale = float(rings) - 1.3;",
			"vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
			"vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
			"vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
			"vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
			"vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
			"vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

			"vec4  one = vec4( 1.0 );",

			"vec4 P = vec4((coords),vec2(scale, scale));",

			"vec4 dist = vec4(0.0);",
			"float inorout = -4.0;",

			"dist.x = dot( P, HS0 );",
			"dist.y = dot( P, HS1 );",
			"dist.z = dot( P, HS2 );",
			"dist.w = dot( P, HS3 );",

			"dist = smoothstep( -feather, feather, dist );",

			"inorout += dot( dist, one );",

			"dist.x = dot( P, HS4 );",
			"dist.y = HS5.w - abs( P.z );",

			"dist = smoothstep( -feather, feather, dist );",
			"inorout += dist.x;",

			"return clamp( inorout, 0.0, 1.0 );",
		"}",

		"float bdepth(vec2 coords) {",
			"// Depth buffer blur",
			"float d = 0.0;",
			"float kernel[9];",
			"vec2 offset[9];",

			"vec2 wh = vec2(1.0/textureWidth,1.0/textureHeight) * dbsize;",

			"offset[0] = vec2(-wh.x,-wh.y);",
			"offset[1] = vec2( 0.0, -wh.y);",
			"offset[2] = vec2( wh.x -wh.y);",

			"offset[3] = vec2(-wh.x,  0.0);",
			"offset[4] = vec2( 0.0,   0.0);",
			"offset[5] = vec2( wh.x,  0.0);",

			"offset[6] = vec2(-wh.x, wh.y);",
			"offset[7] = vec2( 0.0,  wh.y);",
			"offset[8] = vec2( wh.x, wh.y);",

			"kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
			"kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
			"kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",


			"for( int i=0; i<9; i++ ) {",
				"float tmp = texture2D(tDepth, coords + offset[i]).r;",
				"d += tmp * kernel[i];",
			"}",

			"return d;",
		"}",


		"vec3 color(vec2 coords,float blur) {",
			"//processing the sample",

			"vec3 col = vec3(0.0);",
			"vec2 texel = vec2(1.0/textureWidth,1.0/textureHeight);",

			"col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
			"col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
			"col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",

			"vec3 lumcoeff = vec3(0.299,0.587,0.114);",
			"float lum = dot(col.rgb, lumcoeff);",
			"float thresh = max((lum-threshold)*gain, 0.0);",
			"return col+mix(vec3(0.0),col,thresh*blur);",
		"}",

		"vec3 debugFocus(vec3 col, float blur, float depth) {",
			"float edge = 0.002*depth; //distance based edge smoothing",
			"float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);",
			"float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);",

			"col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);",
			"col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);",

			"return col;",
		"}",

		"float linearize(float depth) {",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",


		"float vignette() {",
			"float dist = distance(vUv.xy, vec2(0.5,0.5));",
			"dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);",
			"return clamp(dist,0.0,1.0);",
		"}",

		"float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
			"float rings2 = float(rings);",
			"float step = PI*2.0 / float(ringsamples);",
			"float pw = cos(j*step)*i;",
			"float ph = sin(j*step)*i;",
			"float p = 1.0;",
			"if (pentagon) {",
				"p = penta(vec2(pw,ph));",
			"}",
			"col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
			"return 1.0 * mix(1.0, i /rings2, bias) * p;",
		"}",

		"void main() {",
			"//scene depth calculation",

			"float depth = linearize(texture2D(tDepth,vUv.xy).x);",

			"// Blur depth?",
			"if (depthblur) {",
				"depth = linearize(bdepth(vUv.xy));",
			"}",

			"//focal plane calculation",

			"float fDepth = focalDepth;",

			"if (shaderFocus) {",

				"fDepth = linearize(texture2D(tDepth,focusCoords).x);",

			"}",

			"// dof blur factor calculation",

			"float blur = 0.0;",

			"if (manualdof) {",
				"float a = depth-fDepth; // Focal plane",
				"float b = (a-fdofstart)/fdofdist; // Far DoF",
				"float c = (-a-ndofstart)/ndofdist; // Near Dof",
				"blur = (a>0.0) ? b : c;",
			"} else {",
				"float f = focalLength; // focal length in mm",
				"float d = fDepth*1000.0; // focal plane in mm",
				"float o = depth*1000.0; // depth in mm",

				"float a = (o*f)/(o-f);",
				"float b = (d*f)/(d-f);",
				"float c = (d-f)/(d*fstop*CoC);",

				"blur = abs(a-b)*c;",
			"}",

			"blur = clamp(blur,0.0,1.0);",

			"// calculation of pattern for dithering",

			"vec2 noise = vec2(rand(vUv.xy), rand( vUv.xy + vec2( 0.4, 0.6 ) ) )*dithering*blur;",

			"// getting blur x and y step factor",

			"float w = (1.0/textureWidth)*blur*maxblur+noise.x;",
			"float h = (1.0/textureHeight)*blur*maxblur+noise.y;",

			"// calculation of final color",

			"vec3 col = vec3(0.0);",

			"if(blur < 0.05) {",
				"//some optimization thingy",
				"col = texture2D(tColor, vUv.xy).rgb;",
			"} else {",
				"col = texture2D(tColor, vUv.xy).rgb;",
				"float s = 1.0;",
				"int ringsamples;",

				"for (int i = 1; i <= rings; i++) {",
					"/*unboxstart*/",
					"ringsamples = i * samples;",

					"for (int j = 0 ; j < maxringsamples ; j++) {",
						"if (j >= ringsamples) break;",
						"s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
					"}",
					"/*unboxend*/",
				"}",

				"col /= s; //divide by sample count",
			"}",

			"if (showFocus) {",
				"col = debugFocus(col, blur, depth);",
			"}",

			"if (vignetting) {",
				"col *= vignette();",
			"}",

			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"} "

	].join( "\n" )

};

/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"brightness": { value: 0 },
		"contrast":   { value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float brightness;",
		"uniform float contrast;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			"gl_FragColor.rgb += brightness;",

			"if (contrast > 0.0) {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
			"} else {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
			"}",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

THREE.ColorCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"powRGB":   { value: new THREE.Vector3( 2, 2, 2 ) },
		"mulRGB":   { value: new THREE.Vector3( 1, 1, 1 ) },
		"addRGB":   { value: new THREE.Vector3( 0, 0, 0 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 powRGB;",
		"uniform vec3 mulRGB;",
		"uniform vec3 addRGB;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",
			"gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"color":    { value: new THREE.Color( 0xffffff ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v * color, texel.w );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { value: null },
		"uImageIncrement": { value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join( "\n" ),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++ i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

		return values;

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.DigitalGlitch = {

	uniforms: {

		"tDiffuse":		{ value: null },//diffuse texture
		"tDisp":		{ value: null },//displacement texture for digital glitch squares
		"byp":			{ value: 0 },//apply the glitch ?
		"amount":		{ value: 0.08 },
		"angle":		{ value: 0.02 },
		"seed":			{ value: 0.02 },
		"seed_x":		{ value: 0.02 },//-1,1
		"seed_y":		{ value: 0.02 },//-1,1
		"distortion_x":	{ value: 0.5 },
		"distortion_y":	{ value: 0.6 },
		"col_s":		{ value: 0.05 }
	},

	vertexShader: [

		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		"uniform int byp;",//should we apply the glitch ?
		
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDisp;",
		
		"uniform float amount;",
		"uniform float angle;",
		"uniform float seed;",
		"uniform float seed_x;",
		"uniform float seed_y;",
		"uniform float distortion_x;",
		"uniform float distortion_y;",
		"uniform float col_s;",
			
		"varying vec2 vUv;",
		
		
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
				
		"void main() {",
			"if(byp<1) {",
				"vec2 p = vUv;",
				"float xs = floor(gl_FragCoord.x / 0.5);",
				"float ys = floor(gl_FragCoord.y / 0.5);",
				//based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
				"vec4 normal = texture2D (tDisp, p*seed*seed);",
				"if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
					"if(seed_x>0.){",
						"p.y = 1. - (p.y + distortion_y);",
					"}",
					"else {",
						"p.y = distortion_y;",
					"}",
				"}",
				"if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
					"if(seed_y>0.){",
						"p.x=distortion_x;",
					"}",
					"else {",
						"p.x = 1. - (p.x + distortion_x);",
					"}",
				"}",
				"p.x+=normal.x*seed_x*(seed/5.);",
				"p.y+=normal.y*seed_y*(seed/5.);",
				//base from RGB shift shader
				"vec2 offset = amount * vec2( cos(angle), sin(angle));",
				"vec4 cr = texture2D(tDiffuse, p + offset);",
				"vec4 cga = texture2D(tDiffuse, p);",
				"vec4 cb = texture2D(tDiffuse, p - offset);",
				"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
				//add noise
				"vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
				"gl_FragColor = gl_FragColor+ snow;",
			"}",
			"else {",
				"gl_FragColor=texture2D (tDiffuse, vUv);",
			"}",
		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

THREE.DOFMipMapShader = {

	uniforms: {

		"tColor":   { value: null },
		"tDepth":   { value: null },
		"focus":    { value: 1.0 },
		"maxblur":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float focus;",
		"uniform float maxblur;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 depth = texture2D( tDepth, vUv );",

			"float factor = depth.x - focus;",

			"vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );",

			"gl_FragColor = col;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"tSize":    { value: new THREE.Vector2( 256, 256 ) },
		"center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { value: 1.57 },
		"scale":    { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join( "\n" )

};

/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Frei-Chen filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"aspect":    { value: new THREE.Vector2( 512, 512 ) },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",

		"uniform vec2 aspect;",

		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",


		"mat3 G[9];",

		// hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45

		"const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );",
		"const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );",
		"const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );",
		"const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );",
		"const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );",
		"const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );",
		"const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );",
		"const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );",
		"const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );",

		"void main(void)",
		"{",

			"G[0] = g0,",
			"G[1] = g1,",
			"G[2] = g2,",
			"G[3] = g3,",
			"G[4] = g4,",
			"G[5] = g5,",
			"G[6] = g6,",
			"G[7] = g7,",
			"G[8] = g8;",

			"mat3 I;",
			"float cnv[9];",
			"vec3 sample;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++) {",
				"for (float j=0.0; j<3.0; j++) {",
					"sample = texture2D(tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
					"I[int(i)][int(j)] = length(sample);",
				"}",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<9; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3;",
			"}",

			"float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);",
			"float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);",

			"gl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);",
		"}",

	].join( "\n" )
};

/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader2 = {

	uniforms: {

		"tDiffuse": { value: null },
		"aspect":    { value: new THREE.Vector2( 512, 512 ) },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"uniform vec2 aspect;",


		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",

		"mat3 G[2];",

		"const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );",
		"const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );",


		"void main(void)",
		"{",
			"mat3 I;",
			"float cnv[2];",
			"vec3 sample;",

			"G[0] = g0;",
			"G[1] = g1;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++)",
			"for (float j=0.0; j<3.0; j++) {",
				"sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
				"I[int(i)][int(j)] = length(sample);",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<2; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3; ",
			"}",

			"gl_FragColor = vec4(0.5 * sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));",
		"} ",

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"time":       { value: 0.0 },
		"nIntensity": { value: 0.5 },
		"sIntensity": { value: 0.05 },
		"sCount":     { value: 4096 },
		"grayscale":  { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",
		
		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			"float dx = rand( vUv + time );",

			// add noise
			"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"if( grayscale ) {",

				"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.FocusShader = {

	uniforms : {

		"tDiffuse":       { value: null },
		"screenWidth":    { value: 1024 },
		"screenHeight":   { value: 1024 },
		"sampleDistance": { value: 0.94 },
		"waveFactor":     { value: 0.00125 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float screenWidth;",
		"uniform float screenHeight;",
		"uniform float sampleDistance;",
		"uniform float waveFactor;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color, org, tmp, add;",
			"float sample_dist, f;",
			"vec2 vin;",
			"vec2 uv = vUv;",

			"add = color = org = texture2D( tDiffuse, uv );",

			"vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );",
			"sample_dist = dot( vin, vin ) * 2.0;",

			"f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;",

			"vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );",
			"color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );",

			"gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );",

		"}"


	].join( "\n" )
};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

	uniforms: {

		"mRefractionRatio": { value: 1.02 },
		"mFresnelBias": { value: 0.1 },
		"mFresnelPower": { value: 2.0 },
		"mFresnelScale": { value: 1.0 },
		"tCube": { value: null }

	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

			"vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I = worldPosition.xyz - cameraPosition;",

			"vReflect = reflect( I, worldNormal );",
			"vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
			"vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
			"vec4 refractedColor = vec4( 1.0 );",

			"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
			"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
			"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",

			"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",

		"#define FXAA_REDUCE_MIN   (1.0/128.0)",
		"#define FXAA_REDUCE_MUL   (1.0/8.0)",
		"#define FXAA_SPAN_MAX     8.0",

		"void main() {",

			"vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
			"vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
			"vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
			"vec3 rgbM  = rgbaM.xyz;",
			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float lumaNW = dot( rgbNW, luma );",
			"float lumaNE = dot( rgbNE, luma );",
			"float lumaSW = dot( rgbSW, luma );",
			"float lumaSE = dot( rgbSE, luma );",
			"float lumaM  = dot( rgbM,  luma );",
			"float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
			"float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

			"vec2 dir;",
			"dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
			"dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

			"float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

			"float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
			"dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
				  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
						"dir * rcpDirMin)) * resolution;",
			"vec4 rgbA = (1.0/2.0) * (",
        	"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));",
    		"vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (",
			"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +",
      		"texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));",
    		"float lumaB = dot(rgbB, vec4(luma, 0.0));",

			"if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

				"gl_FragColor = rgbA;",

			"} else {",
				"gl_FragColor = rgbB;",

			"}",

		"}"

	].join( "\n" )

};

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

THREE.GammaCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",

			"gl_FragColor = LinearToGamma( tex, float( GAMMA_FACTOR ) );",

		"}"

	].join( "\n" )

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h":        { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.HorizontalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h":        { value: 1.0 / 512.0 },
		"r":        { value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float hh = h * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"hue":        { value: 0 },
		"saturation": { value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float hue;",
		"uniform float saturation;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(gl_FragColor.rgb);",
			"gl_FragColor.rgb = vec3(",
				"dot(gl_FragColor.rgb, weights.xyz),",
				"dot(gl_FragColor.rgb, weights.zxy),",
				"dot(gl_FragColor.rgb, weights.yzx)",
			");",

			// saturation
			"float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;",
			"if (saturation > 0.0) {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"} else {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);",
			"}",

		"}"

	].join( "\n" )

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"sides":    { value: 6.0 },
		"angle":    { value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float sides;",
		"uniform float angle;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv - 0.5;",
			"float r = length(p);",
			"float a = atan(p.y, p.x) + angle;",
			"float tau = 2. * 3.1416 ;",
			"a = mod(a, tau/sides);",
			"a = abs(a - tau/sides/2.) ;",
			"p = r * vec2(cos(a), sin(a));",
			"vec4 color = texture2D(tDiffuse, p + 0.5);",
			"gl_FragColor = color;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v, v, v, texel.w );",

		"}"

	].join( "\n" )

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"side":     { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform int side;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"if (side == 0){",
				"if (p.x > 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 1){",
				"if (p.x < 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 2){",
				"if (p.y < 0.5) p.y = 1.0 - p.y;",
			"}else if (side == 3){",
				"if (p.y > 0.5) p.y = 1.0 - p.y;",
			"} ",
			"vec4 color = texture2D(tDiffuse, p);",
			"gl_FragColor = color;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */

THREE.NormalMapShader = {

	uniforms: {

		"heightMap":  { value: null },
		"resolution": { value: new THREE.Vector2( 512, 512 ) },
		"scale":      { value: new THREE.Vector2( 1, 1 ) },
		"height":     { value: 0.05 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float height;",
		"uniform vec2 resolution;",
		"uniform sampler2D heightMap;",

		"varying vec2 vUv;",

		"void main() {",

			"float val = texture2D( heightMap, vUv ).x;",

			"float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
			"float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

			"gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",

		"}"

	].join( "\n" )

};

// Author: Aleksandr Albert
// Website: www.routter.co.tt

// Description: A deep water ocean shader set
// based on an implementation of a Tessendorf Waves
// originally presented by David Li ( www.david.li/waves )

// The general method is to apply shaders to simulation Framebuffers
// and then sample these framebuffers when rendering the ocean mesh

// The set uses 7 shaders:

// -- Simulation shaders
// [1] ocean_sim_vertex         -> Vertex shader used to set up a 2x2 simulation plane centered at (0,0)
// [2] ocean_subtransform       -> Fragment shader used to subtransform the mesh (generates the displacement map)
// [3] ocean_initial_spectrum   -> Fragment shader used to set intitial wave frequency at a texel coordinate
// [4] ocean_phase              -> Fragment shader used to set wave phase at a texel coordinate
// [5] ocean_spectrum           -> Fragment shader used to set current wave frequency at a texel coordinate
// [6] ocean_normal             -> Fragment shader used to set face normals at a texel coordinate

// -- Rendering Shader
// [7] ocean_main               -> Vertex and Fragment shader used to create the final render


THREE.ShaderLib[ 'ocean_sim_vertex' ] = {
	vertexShader: [
		'varying vec2 vUV;',

		'void main (void) {',
			'vUV = position.xy * 0.5 + 0.5;',
			'gl_Position = vec4(position, 1.0 );',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_subtransform' ] = {
	uniforms: {
		"u_input": { value: null },
		"u_transformSize": { value: 512.0 },
		"u_subtransformSize": { value: 250.0 }
	},
	fragmentShader: [
		//GPU FFT using a Stockham formulation

		'precision highp float;',
		'#include <common>',

		'uniform sampler2D u_input;',
		'uniform float u_transformSize;',
		'uniform float u_subtransformSize;',

		'varying vec2 vUV;',

		'vec2 multiplyComplex (vec2 a, vec2 b) {',
			'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
		'}',

		'void main (void) {',
			'#ifdef HORIZONTAL',
			'float index = vUV.x * u_transformSize - 0.5;',
			'#else',
			'float index = vUV.y * u_transformSize - 0.5;',
			'#endif',

			'float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);',

			//transform two complex sequences simultaneously
			'#ifdef HORIZONTAL',
			'vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
			'vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
			'#else',
			'vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;',
			'vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;',
			'#endif',

			'float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);',
			'vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));',

			'vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);',
			'vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);',

			'gl_FragColor = vec4(outputA, outputB);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_initial_spectrum' ] = {
	uniforms: {
		"u_wind": { value: new THREE.Vector2( 10.0, 10.0 ) },
		"u_resolution": { value: 512.0 },
		"u_size": { value: 250.0 },
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',
		'const float CM = 0.23;',

		'uniform vec2 u_wind;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + pow2(k / KM)));',
		'}',

		'float tanh (float x) {',
			'return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));',
		'}',

		'void main (void) {',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',

			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',

			'vec2 K = (2.0 * PI * vec2(n, m)) / u_size;',
			'float k = length(K);',

			'float l_wind = length(u_wind);',

			'float Omega = 0.84;',
			'float kp = G * pow2(Omega / l_wind);',

			'float c = omega(k) / k;',
			'float cp = omega(kp) / kp;',

			'float Lpm = exp(-1.25 * pow2(kp / k));',
			'float gamma = 1.7;',
			'float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));',
			'float Gamma = exp(-pow2(sqrt(k / kp) - 1.0) / 2.0 * pow2(sigma));',
			'float Jp = pow(gamma, Gamma);',
			'float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));',
			'float alphap = 0.006 * sqrt(Omega);',
			'float Bl = 0.5 * alphap * cp / c * Fp;',

			'float z0 = 0.000037 * pow2(l_wind) / G * pow(l_wind / cp, 0.9);',
			'float uStar = 0.41 * l_wind / log(10.0 / z0);',
			'float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));',
			'float Fm = exp(-0.25 * pow2(k / KM - 1.0));',
			'float Bh = 0.5 * alpham * CM / c * Fm * Lpm;',

			'float a0 = log(2.0) / 4.0;',
			'float am = 0.13 * uStar / CM;',
			'float Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));',

			'float cosPhi = dot(normalize(u_wind), normalize(K));',

			'float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));',

			'float dk = 2.0 * PI / u_size;',
			'float h = sqrt(S / 2.0) * dk;',

			'if (K.x == 0.0 && K.y == 0.0) {',
				'h = 0.0;', //no DC term
			'}',
			'gl_FragColor = vec4(h, 0.0, 0.0, 0.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_phase' ] = {
	uniforms: {
		"u_phases": { value: null },
		"u_deltaTime": { value: null },
		"u_resolution": { value: null },
		"u_size": { value: null },
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',

		'varying vec2 vUV;',

		'uniform sampler2D u_phases;',
		'uniform float u_deltaTime;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + k * k / KM * KM));',
		'}',

		'void main (void) {',
			'float deltaTime = 1.0 / 60.0;',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',
			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
			'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

			'float phase = texture2D(u_phases, vUV).r;',
			'float deltaPhase = omega(length(waveVector)) * u_deltaTime;',
			'phase = mod(phase + deltaPhase, 2.0 * PI);',

			'gl_FragColor = vec4(phase, 0.0, 0.0, 0.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_spectrum' ] = {
	uniforms: {
		"u_size": { value: null },
		"u_resolution": { value: null },
		"u_choppiness": { value: null },
		"u_phases": { value: null },
		"u_initialSpectrum": { value: null },
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',

		'varying vec2 vUV;',

		'uniform float u_size;',
		'uniform float u_resolution;',
		'uniform float u_choppiness;',
		'uniform sampler2D u_phases;',
		'uniform sampler2D u_initialSpectrum;',

		'vec2 multiplyComplex (vec2 a, vec2 b) {',
			'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
		'}',

		'vec2 multiplyByI (vec2 z) {',
			'return vec2(-z[1], z[0]);',
		'}',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + k * k / KM * KM));',
		'}',

		'void main (void) {',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',
			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
			'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

			'float phase = texture2D(u_phases, vUV).r;',
			'vec2 phaseVector = vec2(cos(phase), sin(phase));',

			'vec2 h0 = texture2D(u_initialSpectrum, vUV).rg;',
			'vec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - vUV + 1.0 / u_resolution)).rg;',
			'h0Star.y *= -1.0;',

			'vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));',

			'vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;',
			'vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;',

			//no DC term
			'if (waveVector.x == 0.0 && waveVector.y == 0.0) {',
				'h = vec2(0.0);',
				'hX = vec2(0.0);',
				'hZ = vec2(0.0);',
			'}',

			'gl_FragColor = vec4(hX + multiplyByI(h), hZ);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_normals' ] = {
	uniforms: {
		"u_displacementMap": { value: null },
		"u_resolution": { value: null },
		"u_size": { value: null },
	},
	fragmentShader: [
		'precision highp float;',

		'varying vec2 vUV;',

		'uniform sampler2D u_displacementMap;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'void main (void) {',
			'float texel = 1.0 / u_resolution;',
			'float texelSize = u_size / u_resolution;',

			'vec3 center = texture2D(u_displacementMap, vUV).rgb;',
			'vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(texel, 0.0)).rgb - center;',
			'vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(-texel, 0.0)).rgb - center;',
			'vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, -texel)).rgb - center;',
			'vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, texel)).rgb - center;',

			'vec3 topRight = cross(right, top);',
			'vec3 topLeft = cross(top, left);',
			'vec3 bottomLeft = cross(left, bottom);',
			'vec3 bottomRight = cross(bottom, right);',

			'gl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_main' ] = {
	uniforms: {
		"u_displacementMap": { value: null },
		"u_normalMap": { value: null },
		"u_geometrySize": { value: null },
		"u_size": { value: null },
		"u_projectionMatrix": { value: null },
		"u_viewMatrix": { value: null },
		"u_cameraPosition": { value: null },
		"u_skyColor": { value: null },
		"u_oceanColor": { value: null },
		"u_sunDirection": { value: null },
		"u_exposure": { value: null },
	},
	vertexShader: [
		'precision highp float;',

		'varying vec3 vPos;',
		'varying vec2 vUV;',

		'uniform mat4 u_projectionMatrix;',
		'uniform mat4 u_viewMatrix;',
		'uniform float u_size;',
		'uniform float u_geometrySize;',
		'uniform sampler2D u_displacementMap;',

		'void main (void) {',
			'vec3 newPos = position + texture2D(u_displacementMap, uv).rgb * (u_geometrySize / u_size);',
			'vPos = newPos;',
			'vUV = uv;',
			'gl_Position = u_projectionMatrix * u_viewMatrix * vec4(newPos, 1.0);',
		'}'
	].join( '\n' ),
	fragmentShader: [
		'precision highp float;',

		'varying vec3 vPos;',
		'varying vec2 vUV;',

		'uniform sampler2D u_displacementMap;',
		'uniform sampler2D u_normalMap;',
		'uniform vec3 u_cameraPosition;',
		'uniform vec3 u_oceanColor;',
		'uniform vec3 u_skyColor;',
		'uniform vec3 u_sunDirection;',
		'uniform float u_exposure;',

		'vec3 hdr (vec3 color, float exposure) {',
			'return 1.0 - exp(-color * exposure);',
		'}',

		'void main (void) {',
			'vec3 normal = texture2D(u_normalMap, vUV).rgb;',

			'vec3 view = normalize(u_cameraPosition - vPos);',
			'float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);',
			'vec3 sky = fresnel * u_skyColor;',

			'float diffuse = clamp(dot(normal, normalize(u_sunDirection)), 0.0, 1.0);',
			'vec3 water = (1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;',

			'vec3 color = sky + water;',

			'gl_FragColor = vec4(hdr(color, u_exposure), 1.0);',
		'}'
	].join( '\n' )
};

// Parallax Occlusion shaders from
//    http://sunandblackcat.com/tipFullView.php?topicid=28
// No tangent-space transforms logic based on
//   http://mmikkelsen3d.blogspot.sk/2012/02/parallaxpoc-mapping-and-no-tangent.html

THREE.ParallaxShader = {
	// Ordered from fastest to best quality.
	modes: {
		none:  'NO_PARALLAX',
		basic: 'USE_BASIC_PARALLAX',
		steep: 'USE_STEEP_PARALLAX',
		occlusion: 'USE_OCLUSION_PARALLAX', // a.k.a. POM
		relief: 'USE_RELIEF_PARALLAX',
	},

	uniforms: {
		"bumpMap": { value: null },
		"map": { value: null },
		"parallaxScale": { value: null },
		"parallaxMinLayers": { value: null },
		"parallaxMaxLayers": { value: null }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;",

		"void main() {",

			"vUv = uv;",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",
			"vNormal = normalize( normalMatrix * normal );",
			"gl_Position = projectionMatrix * mvPosition;",

		"}"

  ].join( "\n" ),

	fragmentShader: [
		"uniform sampler2D bumpMap;",
		"uniform sampler2D map;",

		"uniform float parallaxScale;",
		"uniform float parallaxMinLayers;",
		"uniform float parallaxMaxLayers;",

		"varying vec2 vUv;",
		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;",

		"#ifdef USE_BASIC_PARALLAX",

			"vec2 parallaxMap( in vec3 V ) {",

				"float initialHeight = texture2D( bumpMap, vUv ).r;",

				// No Offset Limitting: messy, floating output at grazing angles.
				//"vec2 texCoordOffset = parallaxScale * V.xy / V.z * initialHeight;",

				// Offset Limiting
				"vec2 texCoordOffset = parallaxScale * V.xy * initialHeight;",
				"return vUv - texCoordOffset;",

			"}",

		"#else",

			"vec2 parallaxMap( in vec3 V ) {",

				// Determine number of layers from angle between V and N
				"float numLayers = mix( parallaxMaxLayers, parallaxMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );",

				"float layerHeight = 1.0 / numLayers;",
				"float currentLayerHeight = 0.0;",
				// Shift of texture coordinates for each iteration
				"vec2 dtex = parallaxScale * V.xy / V.z / numLayers;",

				"vec2 currentTextureCoords = vUv;",

				"float heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",

				// while ( heightFromTexture > currentLayerHeight )
				// Infinite loops are not well supported. Do a "large" finite
				// loop, but not too large, as it slows down some compilers.
				"for ( int i = 0; i < 30; i += 1 ) {",
					"if ( heightFromTexture <= currentLayerHeight ) {",
						"break;",
					"}",
					"currentLayerHeight += layerHeight;",
					// Shift texture coordinates along vector V
					"currentTextureCoords -= dtex;",
					"heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",
				"}",

				"#ifdef USE_STEEP_PARALLAX",

					"return currentTextureCoords;",

				"#elif defined( USE_RELIEF_PARALLAX )",

					"vec2 deltaTexCoord = dtex / 2.0;",
					"float deltaHeight = layerHeight / 2.0;",

					// Return to the mid point of previous layer
					"currentTextureCoords += deltaTexCoord;",
					"currentLayerHeight -= deltaHeight;",

					// Binary search to increase precision of Steep Parallax Mapping
					"const int numSearches = 5;",
					"for ( int i = 0; i < numSearches; i += 1 ) {",

						"deltaTexCoord /= 2.0;",
						"deltaHeight /= 2.0;",
						"heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",
						// Shift along or against vector V
						"if( heightFromTexture > currentLayerHeight ) {", // Below the surface

							"currentTextureCoords -= deltaTexCoord;",
							"currentLayerHeight += deltaHeight;",

						"} else {", // above the surface

							"currentTextureCoords += deltaTexCoord;",
							"currentLayerHeight -= deltaHeight;",

						"}",

					"}",
					"return currentTextureCoords;",

				"#elif defined( USE_OCLUSION_PARALLAX )",

					"vec2 prevTCoords = currentTextureCoords + dtex;",

					// Heights for linear interpolation
					"float nextH = heightFromTexture - currentLayerHeight;",
					"float prevH = texture2D( bumpMap, prevTCoords ).r - currentLayerHeight + layerHeight;",

					// Proportions for linear interpolation
					"float weight = nextH / ( nextH - prevH );",

					// Interpolation of texture coordinates
					"return prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );",

				"#else", // NO_PARALLAX

					"return vUv;",

				"#endif",

			"}",
		"#endif",

		"vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {",

 			"vec2 texDx = dFdx( vUv );",
			"vec2 texDy = dFdy( vUv );",

			"vec3 vSigmaX = dFdx( surfPosition );",
			"vec3 vSigmaY = dFdy( surfPosition );",
			"vec3 vR1 = cross( vSigmaY, surfNormal );",
			"vec3 vR2 = cross( surfNormal, vSigmaX );",
			"float fDet = dot( vSigmaX, vR1 );",

			"vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );",
			"vec3 vProjVtex;",
			"vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;",
			"vProjVtex.z = dot( surfNormal, viewPosition );",

			"return parallaxMap( vProjVtex );",
		"}",

		"void main() {",

			"vec2 mapUv = perturbUv( -vViewPosition, normalize( vNormal ), normalize( vViewPosition ) );",
			"gl_FragColor = texture2D( map, mapUv );",

		"}",

  ].join( "\n" )

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"amount":   { value: 0.005 },
		"angle":    { value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"amount":   { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec3 c = color.rgb;",

			"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
			"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
			"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

			"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

		"}"

	].join( "\n" )

};

/**
 * @author mpk / http://polko.me/
 *
 * WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8
 * Preset: SMAA 1x Medium (with color edge detection)
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */

THREE.SMAAShader = [ {

	defines: {

		"SMAA_THRESHOLD": "0.1"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"void SMAAEdgeDetectionVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAAEdgeDetectionVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {",
			"vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );",

			// Calculate color deltas:
			"vec4 delta;",
			"vec3 C = texture2D( colorTex, texcoord ).rgb;",

			"vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;",
			"vec3 t = abs( C - Cleft );",
			"delta.x = max( max( t.r, t.g ), t.b );",

			"vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;",
			"t = abs( C - Ctop );",
			"delta.y = max( max( t.r, t.g ), t.b );",

			// We do the usual threshold:
			"vec2 edges = step( threshold, delta.xy );",

			// Then discard if there is no edge:
			"if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )",
				"discard;",

			// Calculate right and bottom deltas:
			"vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;",
			"t = abs( C - Cright );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;",
			"t = abs( C - Cbottom );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the maximum delta in the direct neighborhood:
			"float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );",

			// Calculate left-left and top-top deltas:
			"vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;",
			"t = abs( C - Cleftleft );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;",
			"t = abs( C - Ctoptop );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the final maximum delta:
			"maxDelta = max( max( maxDelta, delta.z ), delta.w );",

			// Local contrast adaptation in action:
			"edges.xy *= step( 0.5 * maxDelta, delta.xy );",

			"return vec4( edges, 0.0, 0.0 );",
		"}",

		"void main() {",

			"gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );",

		"}"

	].join("\n")

}, {

	defines: {

		"SMAA_MAX_SEARCH_STEPS":		"8",
		"SMAA_AREATEX_MAX_DISTANCE":	"16",
		"SMAA_AREATEX_PIXEL_SIZE":		"( 1.0 / vec2( 160.0, 560.0 ) )",
		"SMAA_AREATEX_SUBTEX_SIZE":		"( 1.0 / 7.0 )"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"tArea":		{ value: null },
		"tSearch":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",
		"varying vec2 vPixcoord;",

		"void SMAABlendingWeightCalculationVS( vec2 texcoord ) {",
			"vPixcoord = texcoord / resolution;",

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 );", // WebGL port note: Changed sign in Y and W components
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 );", // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			"vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );",

		"}",

		"void main() {",

			"vUv = uv;",

			"SMAABlendingWeightCalculationVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tArea;",
		"uniform sampler2D tSearch;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[3];",
		"varying vec2 vPixcoord;",

		"vec2 round( vec2 x ) {",
			"return sign( x ) * floor( abs( x ) + 0.5 );",
		"}",

		"float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {",
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			"e.r = bias + e.r * scale;",
			"return 255.0 * texture2D( searchTex, e, 0.0 ).r;",
		"}",

		"float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			/**
			* @PSEUDO_GATHER4
			* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
			* sample between edge, thus fetching four edges in a row.
			* Sampling with different offsets in each direction allows to disambiguate
			* which edges are active from the four fetched ones.
			*/
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			// We correct the previous (-0.25, -0.125) offset we applied:
			"texcoord.x += 0.25 * resolution.x;",

			// The searches are bias by 1, so adjust the coords accordingly:
			"texcoord.x += resolution.x;",

			// Disambiguate the length added by the last step:
			"texcoord.x += 2.0 * resolution.x;", // Undo last step
			"texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);",

			"return texcoord.x;",
		"}",

		"float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			"texcoord.x -= 0.25 * resolution.x;",
			"texcoord.x -= resolution.x;",
			"texcoord.x -= 2.0 * resolution.x;",
			"texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );",

			"return texcoord.x;",
		"}",

		"float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y -= 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y += 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {",
			// Rounding prevents precision errors of bilinear filtering:
			"vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;",

			// We do a scale and bias for mapping to texel space:
			"texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );",

			// Move to proper place, according to the subpixel offset:
			"texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;",

			"return texture2D( areaTex, texcoord, 0.0 ).rg;",
		"}",

		"vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {",
			"vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"vec2 e = texture2D( edgesTex, texcoord ).rg;",

			"if ( e.g > 0.0 ) {", // Edge at north
				"vec2 d;",

				// Find the distance to the left:
				"vec2 coords;",
				"coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );",
				"coords.y = offset[ 1 ].y;", // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				"d.x = coords.x;",

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).r;",

				// Find the distance to the right:
				"coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );",
				"d.y = coords.x;",

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				"d = d / resolution.x - pixcoord.x;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the right crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;",

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				"weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );",
			"}",

			"if ( e.r > 0.0 ) {", // Edge at west
				"vec2 d;",

				// Find the distance to the top:
				"vec2 coords;",

				"coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );",
				"coords.x = offset[ 0 ].x;", // offset[1].x = texcoord.x - 0.25 * resolution.x;
				"d.x = coords.y;",

				// Fetch the top crossing edges:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).g;",

				// Find the distance to the bottom:
				"coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );",
				"d.y = coords.y;",

				// We want the distances to be in pixel units:
				"d = d / resolution.y - pixcoord.y;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the bottom crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;",

				// Get the area for this direction:
				"weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );",
			"}",

			"return weights;",
		"}",

		"void main() {",

			"gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );",

		"}"

	].join("\n")

}, {

	uniforms: {

		"tDiffuse":		{ value: null },
		"tColor":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"void SMAANeighborhoodBlendingVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAANeighborhoodBlendingVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tColor;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {",
			// Fetch the blending weights for current pixel:
			"vec4 a;",
			"a.xz = texture2D( blendTex, texcoord ).xz;",
			"a.y = texture2D( blendTex, offset[ 1 ].zw ).g;",
			"a.w = texture2D( blendTex, offset[ 1 ].xy ).a;",

			// Is there any blending weight with a value greater than 0.0?
			"if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {",
				"return texture2D( colorTex, texcoord, 0.0 );",
			"} else {",
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				"vec2 offset;",
				"offset.x = a.a > a.b ? a.a : -a.b;", // left vs. right
				"offset.y = a.g > a.r ? -a.g : a.r;", // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				"if ( abs( offset.x ) > abs( offset.y )) {", // horizontal vs. vertical
					"offset.y = 0.0;",
				"} else {",
					"offset.x = 0.0;",
				"}",

				// Fetch the opposite color and lerp by hand:
				"vec4 C = texture2D( colorTex, texcoord, 0.0 );",
				"texcoord += sign( offset ) * resolution;",
				"vec4 Cop = texture2D( colorTex, texcoord, 0.0 );",
				"float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );",

				// WebGL port note: Added gamma correction
				"C.xyz = pow(C.xyz, vec3(2.2));",
				"Cop.xyz = pow(Cop.xyz, vec3(2.2));",
				"vec4 mixed = mix(C, Cop, s);",
				"mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));",

				"return mixed;",
			"}",
		"}",

		"void main() {",

			"gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );",

		"}"

	].join("\n")

} ];

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - refactoring and optimizations
 */

THREE.SSAOShader = {

	uniforms: {

		"tDiffuse":     { value: null },
		"tDepth":       { value: null },
		"size":         { value: new THREE.Vector2( 512, 512 ) },
		"cameraNear":   { value: 1 },
		"cameraFar":    { value: 100 },
		"onlyAO":       { value: 0 },
		"aoClamp":      { value: 0.5 },
		"lumInfluence": { value: 0.5 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float cameraNear;",
		"uniform float cameraFar;",

		"uniform bool onlyAO;",      // use only ambient occlusion pass?

		"uniform vec2 size;",        // texture width, height
		"uniform float aoClamp;",    // depth clamp - reduces haloing at screen edges

		"uniform float lumInfluence;",  // how much luminance affects occlusion

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		// "#define PI 3.14159265",
		"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
		"#define EULER 2.718281828459045",

		// user variables

		"const int samples = 8;",     // ao sample count
		"const float radius = 5.0;",  // ao radius

		"const bool useNoise = false;",      // use noise instead of pattern for sample dithering
		"const float noiseAmount = 0.0003;", // dithering amount

		"const float diffArea = 0.4;",   // self-shadowing reduction
		"const float gDisplace = 0.4;",  // gauss bell center


		// RGBA depth

		"#include <packing>",

		// generating noise / pattern texture for dithering

		"vec2 rand( const vec2 coord ) {",

			"vec2 noise;",

			"if ( useNoise ) {",

				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",

			"} else {",

				"float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );",
				"float gg = fract( coord.t * ( size.y / 2.0 ) );",

				"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

			"}",

			"return ( noise * 2.0  - 1.0 ) * noiseAmount;",

		"}",

		"float readDepth( const in vec2 coord ) {",

			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			// "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
			"return cameraCoef / ( cameraFarPlusNear - unpackRGBAToDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );",


		"}",

		"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

			"float garea = 2.0;",                         // gauss bell width
			"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing

			"if ( diff < gDisplace ) {",

				"garea = diffArea;",

			"} else {",

				"far = 1;",

			"}",

			"float dd = diff - gDisplace;",
			"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
			"return gauss;",

		"}",

		"float calcAO( float depth, float dw, float dh ) {",

			"float dd = radius - depth * radius;",
			"vec2 vv = vec2( dw, dh );",

			"vec2 coord1 = vUv + dd * vv;",
			"vec2 coord2 = vUv - dd * vv;",

			"float temp1 = 0.0;",
			"float temp2 = 0.0;",

			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

			// DEPTH EXTRAPOLATION

			"if ( far > 0 ) {",

				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",

			"}",

			"return temp1;",

		"}",

		"void main() {",

			"vec2 noise = rand( vUv );",
			"float depth = readDepth( vUv );",

			"float tt = clamp( depth, aoClamp, 1.0 );",

			"float w = ( 1.0 / size.x )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

			"float ao = 0.0;",

			"float dz = 1.0 / float( samples );",
			"float z = 1.0 - dz / 2.0;",
			"float l = 0.0;",

			"for ( int i = 0; i <= samples; i ++ ) {",

				"float r = sqrt( 1.0 - z );",

				"float pw = cos( l ) * r;",
				"float ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z - dz;",
				"l = l + DL;",

			"}",

			"ao /= float( samples );",
			"ao = 1.0 - ao;",

			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

			"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
			"float lum = dot( color.rgb, lumcoeff );",
			"vec3 luminance = vec3( lum );",

			"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // mix( color * ao, white, luminance )

			"if ( onlyAO ) {",

				"final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // ambient occlusion only

			"}",

			"gl_FragColor = vec4( final, 1.0 );",

		"}"

	].join( "\n" )

};

/**
 * @author flimshaw / http://charliehoey.com
 *
 * Technicolor Shader
 * Simulates the look of the two-strip technicolor process popular in early 20th century films.
 * More historical info here: http://www.widescreenmuseum.com/oldcolor/technicolor1.htm
 * Demo here: http://charliehoey.com/technicolor_shader/shader_test.html
 */

THREE.TechnicolorShader = {

	uniforms: {

		"tDiffuse": { value: null },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",

		"void main() {",

			"vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",
			"vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);",

			"gl_FragColor = newTex;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.ThresholdShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"threshold":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float threshold;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",
			"vec4 texel = texture2D( tDiffuse, vUv );",
			"float lum = dot(texel.xyz, vec3(.299, .587, .114));",
			"if (lum < threshold) texel *= 0.0;",
			"gl_FragColor = texel;",

		"}"

	].join("\n")

};

/**
 * @author miibond
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.ToneMapShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"averageLuminance":  { value: 1.0 },
		"luminanceMap":  { value: null },
		"maxLuminance":  { value: 16.0 },
		"middleGrey":  { value: 0.6 }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"uniform float middleGrey;",
		"uniform float maxLuminance;",
		"#ifdef ADAPTED_LUMINANCE",
			"uniform sampler2D luminanceMap;",
		"#else",
			"uniform float averageLuminance;",
		"#endif",
		
		"const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);",

		"vec3 ToneMap( vec3 vColor ) {",
			"#ifdef ADAPTED_LUMINANCE",
				// Get the calculated average luminance 
				"float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;",
			"#else",
				"float fLumAvg = averageLuminance;",
			"#endif",
			
			// Calculate the luminance of the current pixel
			"float fLumPixel = dot(vColor, LUM_CONVERT);",

			// Apply the modified operator (Eq. 4)
			"float fLumScaled = (fLumPixel * middleGrey) / fLumAvg;",

			"float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);",
			"return fLumCompressed * vColor;",
		"}",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			
			"gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );",

		"}"

	].join( "\n" )

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Triangle blur shader
 * based on glfx.js triangle blur shader
 * https://github.com/evanw/glfx.js
 *
 * A basic blur filter, which convolves the image with a
 * pyramid filter. The pyramid filter is separable and is applied as two
 * perpendicular triangle filters.
 */

THREE.TriangleBlurShader = {

	uniforms : {

		"texture": { value: null },
		"delta":   { value: new THREE.Vector2( 1, 1 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"#define ITERATIONS 10.0",

		"uniform sampler2D texture;",
		"uniform vec2 delta;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = vec4( 0.0 );",

			"float total = 0.0;",

			// randomize the lookup values to hide the fixed number of samples

			"float offset = rand( vUv );",

			"for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {",

				"float percent = ( t + offset - 0.5 ) / ITERATIONS;",
				"float weight = 1.0 - abs( percent );",

				"color += texture2D( texture, vUv + delta * percent ) * weight;",
				"total += weight;",

			"}",

			"gl_FragColor = color / total;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */

THREE.UnpackDepthRGBAShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"#include <packing>",

		"void main() {",

			"float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );",
			"gl_FragColor = opacity * vec4( vec3( depth ), 1.0 );",

		"}"

	].join( "\n" )

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v":        { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.VerticalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v":        { value: 1.0 / 512.0 },
		"r":        { value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float vv = v * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"offset":   { value: 1.0 },
		"darkness": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float offset;",
		"uniform float darkness;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// Eskil's vignette

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
			"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

			/*
			// alternative version from glfx.js
			// this one makes more "dusty" look (as opposed to "burned")

			"vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
			"gl_FragColor = color;",
			*/

		"}"

	].join( "\n" )

};

ShaderLibrary = {
    get: function(filename)
    {
        return ShaderLibrary[filename + ".glsl"];
    }
};
ShaderLibrary['custom_fragment.glsl'] = 'varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\nvarying vec2 texCoords;\n\n#ifdef ALBEDO_MAP\nuniform sampler2D albedoMap;\n#endif\n\nuniform vec3 color;\n\nuniform float roughness;\nuniform float normalSpecularReflection;\n\n#ifdef NORMAL_MAP\nuniform sampler2D normalMap;\n#endif\n\n#ifdef AMBIENT_OCCLUSION_MAP\nuniform sampler2D aoMap;\n#endif\n\n#ifdef LOCAL_SKYBOX\n// this could also be applied to irradiance map\nuniform vec3 skyboxPosition;\nuniform float skyboxSize;\n#endif\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\nuniform float specularProbeBoost;\n#endif\n\n#ifdef IRRADIANCE_PROBE\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\n#endif\n\n// internal\nuniform vec3 ambientLightColor;\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}\n\n#ifdef NORMAL_MAP\nvec3 perturbNormal2Arb(vec3 position, vec3 worldNormal, vec3 normalSample)\n{\n    vec3 q0 = dFdx( position.xyz );\n    vec3 q1 = dFdy( position.xyz );\n    vec2 st0 = dFdx( texCoords.st );\n    vec2 st1 = dFdy( texCoords.st );\n    vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n    vec3 N = normalize( worldNormal );\n    mat3 tsn = mat3( S, T, N );\n    return normalize( tsn * normalSample );\n}\n#endif\n\nvec3 getNormal()\n{\n#if defined(NORMAL_MAP)\n    vec4 normalSample = texture2D( normalMap, texCoords );\n    vec3 normal = normalSample.xyz * 2.0 - 1.0;\n    return perturbNormal2Arb(worldPosition, worldNormal, normal);\n#else\n    return normalize(worldNormal);\n#endif\n}\n\nfloat fresnel(float NdotL, float lowProfileDefault)\n{\n#ifdef PERFORMANCE_PROFILE_HIGH\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n#else\n    return lowProfileDefault;\n#endif\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\n// TODO: lights are now in view space, need to update this\nvoid accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n    diffuseLight += irradiance;\n\n    float F = fresnel(NdotL, .08);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    specularLight += irradiance * D * F;\n}\n\n#if NUM_POINT_LIGHTS > 0\nvoid accumulatePointLight(PointLight light, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    vec3 worldDir = light.position - worldPosition;\n    float sqrDist = dot(worldDir, worldDir);\n    worldDir /= sqrt(sqrDist);\n    vec3 fallOffColor = light.color / max(sqrDist, .001);\n    accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n}\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nvoid accumulateDirLight(DirectionalLight light, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    accumulate(light.direction, light.color, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n}\n#endif\n\nvoid main() {\n    float roughnessSqr = roughness * roughness;\n    vec3 viewWorldDir = normalize(cameraPosition - worldPosition);\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 albedo = vec3(1.0);\n#ifdef ALBEDO_MAP\n    albedo = texture2D(albedoMap, texCoords).xyz;\n    albedo *= albedo;\n#endif\n\n    albedo *= color;\n\n    vec3 diffuseLight = vec3(0.0);\n\n    #ifdef IRRADIANCE_PROBE\n        diffuseLight = textureCube(irradianceProbe, normal).xyz;\n        diffuseLight *= diffuseLight * irradianceProbeBoost;\n    #endif\n\n    #ifdef AMBIENT_OCCLUSION_MAP\n        float ao = texture2D(aoMap, texCoords).x;\n        diffuseLight *= ao;\n    #endif\n\n    diffuseLight += ambientLightColor;\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 reflectedView = reflect(-viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0), .35);\n\n        #ifdef LOCAL_SKYBOX\n            vec3 offsetRefl = intersectCubeMap(worldPosition - skyboxPosition, reflectedView, skyboxSize);\n        #else\n            vec3 offsetRefl = reflectedView;\n        #endif\n\n        vec3 reflection = textureCube(specularProbe, reflectedView).xyz;\n        reflection *= reflection * specularProbeBoost;\n\n        specularLight = reflection * fresnelFactor;\n\n        #ifdef AMBIENT_OCCLUSION_MAP\n//        specularLight *= ao;\n        #endif\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        accumulatePointLight(pointLights[i], viewNormal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        accumulateDirLight(directionalLights[i], viewNormal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    vec3 color = albedo * diffuseLight + specularLight;\n\n    float rim = 1.0 - dot(viewNormal, viewDir);\n    color = mix(color * .1, color, rim);\n\n    rim = pow(rim, 5.0);\n    vec3 rimColor = vec3(75.0 / 255.0, 199.0 / 255.0, 215.0 / 255.0);\n    rimColor *= rimColor;\n    rimColor *= 2.0;\n    color += rimColor * rim;\n\n    gl_FragColor = vec4(sqrt(color), 1.0);\n}\n';

ShaderLibrary['custom_vertex.glsl'] = 'varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\nvarying vec2 texCoords;\nvarying vec2 shadowCoords;\n\nvoid main() {\n    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    // normalMatrix seems to be view space... need world space, but it\'s okay since we\'re using uniform scaling only\n    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n    worldNormal = mat3(modelMatrix) * normalize(normal);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n    texCoords = uv;\n}';

ShaderLibrary['dielectric_fragment.glsl'] = '#define MIN_VARIANCE .0001\n#define LIGHT_BLEED_REDUCTION .9\n\n\nvarying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP) || defined(AMBIENT_OCCLUSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\nuniform sampler2D ssaoMap;\n#endif\n\n#ifdef SHADOW_MAP\nuniform sampler2D shadowMap;\n\nvarying vec4 shadowCoord;\n#endif\n\n\n#ifdef ALBEDO_MAP\nuniform sampler2D albedoMap;\n\n#ifdef ALBEDO_MAP_2\nuniform sampler2D albedoMap2;\nuniform float albedoBlend;\n#endif\n\n#endif\n\nuniform vec3 color;\n\nuniform float roughness;\nuniform float normalSpecularReflection;\n\n#ifdef NORMAL_MAP\nuniform sampler2D normalMap;\n#endif\n\n#ifdef ROUGHNESS_MAP\nuniform sampler2D roughnessMap;\nuniform float roughnessMapRange;\n#endif\n\n#ifdef EMISSION_MAP\nuniform sampler2D emissionMap;\n#endif\n\nuniform vec3 emissionColor;\n\n#ifdef AMBIENT_OCCLUSION_MAP\nuniform sampler2D aoMap;\n#endif\n\n#ifdef LOCAL_SKYBOX\n// this could also be applied to irradiance map\nuniform vec3 skyboxPosition;\nuniform float skyboxSize;\n#endif\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\nuniform vec3 specularProbeColor;\n#endif\n\n#ifdef IRRADIANCE_PROBE\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\n#endif\n\n// internal\nuniform vec3 ambientLightColor;\n\nuniform float alpha;\n\n#ifdef FOG\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\n#ifdef CEL_SPECULAR\nuniform float celSpecularCutOff;\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\nfloat hx_RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}\n\n#ifdef NORMAL_MAP\nvec3 perturbNormal2Arb(vec3 position, vec3 worldNormal, vec3 normalSample)\n{\n    vec3 q0 = dFdx( position.xyz );\n    vec3 q1 = dFdy( position.xyz );\n    vec2 st0 = dFdx( texCoords.st );\n    vec2 st1 = dFdy( texCoords.st );\n    vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n    vec3 N = normalize( worldNormal );\n    mat3 tsn = mat3( S, T, N );\n    return normalize( tsn * normalSample );\n}\n#endif\n\nfloat hx_RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nvec3 getNormal()\n{\n#if defined(NORMAL_MAP)\n    vec4 normalSample = texture2D( normalMap, texCoords );\n    vec3 normal = normalSample.xyz * 2.0 - 1.0;\n    return perturbNormal2Arb(worldPosition, worldNormal, normal);\n#else\n    return normalize(worldNormal);\n#endif\n}\n\nfloat getShadow() {\n#ifdef SHADOW_MAP\n    vec4 s = texture2D(shadowMap, shadowCoord.xy);\n    vec2 moments = vec2(hx_RG8ToFloat(s.xy), hx_RG8ToFloat(s.zw));\n\n    float variance = moments.y - moments.x * moments.x;\n    variance = max(variance, MIN_VARIANCE);\n\n    float c = shadowCoord.z;\n    float diff = max(c - moments.x, 0.0);\n    float upperBound = variance / (variance + diff*diff);\n    float shadow = clamp((upperBound - LIGHT_BLEED_REDUCTION) / (1.0 - LIGHT_BLEED_REDUCTION), 0.0, 1.0);\n\n    return shadow;\n#else\n    return 1.0;\n#endif\n}\n\nfloat fresnel(float NdotL, float lowProfileDefault)\n{\n#ifdef PERFORMANCE_PROFILE_HIGH\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n#else\n    return lowProfileDefault;\n#endif\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nvoid accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n    diffuseLight += irradiance;\n\n    float F = fresnel(NdotL, .08);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    float amount = D * F;\n\n    #ifdef CEL_SPECULAR\n        amount = smoothstep(celSpecularCutOff, celSpecularCutOff + .01, amount);\n    #endif\n\n    specularLight += irradiance * amount;\n}\n\nvoid main() {\n    float roughnessSqr = roughness;\n    #ifdef ROUGHNESS_MAP\n    roughnessSqr -= (texture2D(roughnessMap, texCoords).x - .5) * roughnessMapRange;\n    roughnessSqr = clamp(roughnessSqr, 0.0, 1.0);\n    #endif\n    roughnessSqr *= roughnessSqr;\n    vec3 viewWorldDir = normalize(cameraPosition - worldPosition);\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 albedo = vec3(1.0);\n\n#ifdef ALBEDO_MAP\n    albedo = texture2D(albedoMap, texCoords).xyz;\n    albedo *= albedo;\n\n    #ifdef ALBEDO_MAP_2\n        vec3 albedo2 = texture2D(albedoMap2, texCoords).xyz;\n        albedo = mix(albedo, albedo2 * albedo2, albedoBlend);\n    #endif\n#endif\n\n    albedo *= color;\n\n    vec3 diffuseLight = vec3(0.0);\n\n    #ifdef IRRADIANCE_PROBE\n        diffuseLight = textureCube(irradianceProbe, normal).xyz;\n        diffuseLight *= diffuseLight * irradianceProbeBoost;\n    #endif\n\n    float ao = 1.0;\n    #ifdef AMBIENT_OCCLUSION_MAP\n        ao = texture2D(aoMap, texCoords).x;\n    #endif\n\n    #ifdef SSAO_MAP\n        vec2 screenUV = projection.xy / projection.w * .5 + .5;\n        ao = texture2D(ssaoMap, screenUV).x;\n    #endif\n\n    diffuseLight *= ao;\n\n    diffuseLight += ambientLightColor;\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 reflectedView = reflect(-viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0), .35);\n\n        #ifdef LOCAL_SKYBOX\n            vec3 offsetRefl = intersectCubeMap(worldPosition - skyboxPosition, reflectedView, skyboxSize);\n        #else\n            vec3 offsetRefl = reflectedView;\n        #endif\n\n        vec3 reflection = textureCube(specularProbe, reflectedView).xyz;\n        reflection *= reflection * specularProbeColor;\n\n        specularLight = reflection * fresnelFactor;\n\n        #ifdef AMBIENT_OCCLUSION_MAP\n//        specularLight *= ao;\n        #endif\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        vec3 worldDir = pointLights[i].position - worldPosition;\n        float sqrDist = dot(worldDir, worldDir);\n        worldDir /= sqrt(sqrDist);\n        vec3 fallOffColor = pointLights[i].color / max(sqrDist, .001);\n        accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    float shadow = getShadow();\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        float NdotL = max(dot(directionalLights[i].direction, viewNormal), 0.0);\n        vec3 irradiance = directionalLights[i].color * NdotL;\n        diffuseLight += irradiance;\n\n        irradiance *= shadow;\n\n        float F = fresnel(NdotL, .04);\n        float D = trowbridgeReitz(roughnessSqr, directionalLights[i].direction, viewNormal, viewDir);\n        float amount = D * F;\n        #ifdef CEL_SPECULAR\n            amount = smoothstep(celSpecularCutOff, celSpecularCutOff + .1, amount);\n        #endif\n\n        specularLight += irradiance * amount;\n    }\n    #endif\n\n    vec3 color = albedo * diffuseLight + specularLight;\n\n    vec3 emission = emissionColor;\n    #ifdef EMISSION_MAP\n    vec3 emissionSample = texture2D(emissionMap, texCoords).xyz;\n    emissionSample *= emissionSample;\n    emission *= emissionSample;\n    #endif\n    color += emission;\n\n    #ifdef FOG\n        float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n        color = mix(fogColor, color, fogAmount);\n    #endif\n\n    gl_FragColor = vec4(sqrt(color), alpha);\n}\n';

ShaderLibrary['dielectric_vertex.glsl'] = 'varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP) || defined(AMBIENT_OCCLUSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\n#endif\n\n#ifdef SHADOW_MAP\nuniform mat4 shadowMatrix;\n\nvarying vec4 shadowCoord;\n#endif\n\nvoid main() {\n    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    // normalMatrix seems to be view space... need world space, but it\'s okay since we\'re using uniform scaling only\n    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n    worldNormal = mat3(modelMatrix) * normalize(normal);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n\n    #if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP) || defined(AMBIENT_OCCLUSION_MAP)\n    texCoords = uv;\n    #endif\n\n    #ifdef SSAO_MAP\n    projection = gl_Position;\n    #endif\n\n    #ifdef SHADOW_MAP\n    shadowCoord = (shadowMatrix * vec4(worldPosition, 1.0)) * .5 + .5;\n    #endif\n}';

ShaderLibrary['flat_fragment.glsl'] = 'varying vec2 texCoords;\nvarying vec3 viewPosition;\n\nuniform sampler2D albedoMap;\n\nuniform vec3 color;\n\n#ifdef ALBEDO_MAP_2\nuniform sampler2D albedoMap2;\nuniform float albedoBlend;\n#endif\nuniform float alpha;\n\nuniform float fogDensity;\nuniform vec3 fogColor;\n\n#ifdef FADE_NEAR\nuniform float fadeNear;\nuniform float fadeDistance;\n#endif\n\nvoid main() {\n    vec4 albedo = texture2D(albedoMap, texCoords);\n    albedo.xyz *= albedo.xyz;\n    #ifdef ALBEDO_MAP_2\n    vec4 albedo2 = texture2D(albedoMap2, texCoords);\n    albedo2.xyz *= albedo2.xyz;\n    albedo = mix(albedo, albedo2, albedoBlend);\n    #endif\n\n    #ifdef FADE_NEAR\n    float fade = clamp((-viewPosition.z - fadeNear) / fadeDistance, 0.0, 1.0);\n    albedo.w *= fade;\n    #endif\n\n    albedo.xyz *= color;\n    float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n    vec3 col = mix(fogColor, albedo.xyz, fogAmount);\n    gl_FragColor = vec4(sqrt(col), alpha * albedo.w);\n}\n';

ShaderLibrary['flat_vertex.glsl'] = 'varying vec2 texCoords;\nvarying vec3 viewPosition;\n\n#ifdef GROW_CLOSE\nuniform float growDistance;\nuniform float growScale;\n#endif\n\nvoid main() {\n    vec3 localPos = position;\n#ifdef GROW_CLOSE\n    float scale = clamp(-viewPosition.z / growDistance, 1.0, growScale);\n    localPos = position * scale;\n#endif\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n    texCoords = uv;\n}';

ShaderLibrary['outline_fragment.glsl'] = 'uniform vec3 color;\n\nuniform float alpha;\n\nvoid main() {\n    gl_FragColor = vec4(color, alpha);\n}\n';

ShaderLibrary['outline_vertex.glsl'] = 'uniform float thickness;\n\nvoid main()\n{\n    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);\n    vec3 viewNormal = normalize(normalMatrix * normal);\n    viewPosition.xyz += viewNormal * thickness;\n    gl_Position = projectionMatrix * viewPosition;\n}';

ShaderLibrary['sky_fragment.glsl'] = 'varying vec3 worldViewDir;\n\nuniform samplerCube envMap;\nuniform vec3 color;\n\nvoid main()\n{\n    vec3 elementDir = normalize(worldViewDir);\n    gl_FragColor = textureCube(envMap, elementDir) * vec4(color, 1.0);\n}\n';

ShaderLibrary['sky_vertex.glsl'] = 'varying vec3 worldViewDir;\n\nvoid main() {\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    worldViewDir = cameraPosition - worldPosition;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}';

ShaderLibrary['vsm_blur_x_fragment.glsl'] = '#define RADIUS 1\n#define NUM_SAMPLES (RADIUS * 2 + 1)\n\nuniform sampler2D tDiffuse;\nuniform float h;\n\nvarying vec2 vUv;\n\nfloat hx_RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}\n\n// Only for 0 - 1\nvec2 hx_floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nvec2 getShadowValue(vec2 uv)\n{\n    vec4 s = texture2D(tDiffuse, uv);\n    return vec2(hx_RG8ToFloat(s.xy), hx_RG8ToFloat(s.zw));\n}\n\nvoid main() {\n    vec2 sum = getShadowValue(vUv);\n\n    for (int i = 1; i <= RADIUS; ++i) {\n        sum += getShadowValue(vec2(vUv.x - float(i) * h, vUv.y));\n        sum += getShadowValue(vec2(vUv.x + float(i) * h, vUv.y));\n    }\n\n    sum /= float(NUM_SAMPLES);\n    gl_FragColor.xy = hx_floatToRG8(sum.x);\n    gl_FragColor.zw = hx_floatToRG8(sum.y);\n}';

ShaderLibrary['vsm_blur_x_vertex.glsl'] = 'varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n}';

ShaderLibrary['vsm_blur_y_fragment.glsl'] = '#define RADIUS 2\n#define NUM_SAMPLES (RADIUS * 2 + 1)\n\nuniform sampler2D tDiffuse;\nuniform float v;\n\nvarying vec2 vUv;\n\nfloat hx_RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}\n\n// Only for 0 - 1\nvec2 hx_floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nvec2 getShadowValue(vec2 uv)\n{\n    vec4 s = texture2D(tDiffuse, uv);\n    return vec2(hx_RG8ToFloat(s.xy), hx_RG8ToFloat(s.zw));\n}\n\nvoid main() {\n    vec2 sum = getShadowValue(vUv);\n\n    for (int i = 1; i <= RADIUS; ++i) {\n        sum += getShadowValue(vec2(vUv.x, vUv.y - float(i) * v));\n        sum += getShadowValue(vec2(vUv.x, vUv.y + float(i) * v));\n    }\n\n    sum /= float(NUM_SAMPLES);\n    gl_FragColor.xy = hx_floatToRG8(sum.x);\n    gl_FragColor.zw = hx_floatToRG8(sum.y);\n}';

ShaderLibrary['vsm_blur_y_vertex.glsl'] = 'varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n}';

ShaderLibrary['vsm_fragment.glsl'] = 'varying vec4 projection;\n\nuniform float depthBias;\n\n// Only for 0 - 1\nvec2 hx_floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nvec4 hx_floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nvoid main()\n{\n    float depth = projection.z * .5 + .5;\n\n    gl_FragColor.xy = hx_floatToRG8(depth + depthBias);\n    gl_FragColor.zw = hx_floatToRG8(depth * depth);\n}\n';

ShaderLibrary['vsm_vertex.glsl'] = 'varying vec4 projection;\n\nvoid main()\n{\n    gl_Position = projection = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}';

ShaderLibrary['hbao_fragment.glsl'] = 'uniform float cameraFrustumRange;\nuniform float cameraNearPlaneDistance;\nuniform vec2 rcpRenderTargetResolution;\n\nuniform float strengthPerRay;\nuniform float bias;\nuniform float rcpFallOffDistance;\nuniform vec2 ditherScale;\nuniform vec2 radiiProjection;\n\nuniform sampler2D tDiffuse;\nuniform sampler2D sampleDirTexture;\nuniform sampler2D ditherTexture;\n\nvarying vec2 vUv;\nvarying vec3 viewDir;\nvarying vec3 frustumCorner;\n\nfloat RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nfloat readDepth(vec2 uv)\n{\n    vec4 s = texture2D(tDiffuse, uv);\n    return RGBA8ToFloat(s);\n}\n\nvec3 getViewPos(vec2 sampleUV)\n{\n    float depth = readDepth(sampleUV);\n    float viewZ = depth * cameraFrustumRange + cameraNearPlaneDistance;\n    vec3 viewPos = frustumCorner * vec3(sampleUV * 2.0 - 1.0, 1.0);\n    return viewPos * viewZ;\n}\n\n// Retrieves the occlusion factor for a particular sample\nfloat getSampleOcclusion(vec2 sampleUV, vec3 centerViewPos, vec3 centerNormal, vec3 tangent, inout float topOcclusion)\n{\n    vec3 sampleViewPos = getViewPos(sampleUV);\n\n    // get occlusion factor based on candidate horizon elevation\n    vec3 horizonVector = sampleViewPos - centerViewPos;\n    float horizonVectorLength = length(horizonVector);\n\n    float occlusion;\n\n    // If the horizon vector points away from the tangent, make an estimate\n    if (dot(tangent, horizonVector) < 0.0)\n        occlusion = .5;\n    else\n        occlusion = dot(centerNormal, horizonVector) / horizonVectorLength;\n\n    // this adds occlusion only if angle of the horizon vector is higher than the previous highest one without branching\n    float diff = max(occlusion - topOcclusion, 0.0);\n    topOcclusion = max(occlusion, topOcclusion);\n\n    // attenuate occlusion contribution using distance function 1 - (d/f)^2\n    float distanceFactor = clamp(horizonVectorLength * rcpFallOffDistance, 0.0, 1.0);\n    distanceFactor = 1.0 - distanceFactor * distanceFactor;\n    return diff * distanceFactor;\n}\n\n// Retrieves the occlusion for a given ray\nfloat getRayOcclusion(vec2 direction, float jitter, vec2 projectedRadii, vec3 centerViewPos, vec3 centerNormal)\n{\n    // calculate the nearest neighbour sample along the direction vector\n    vec2 texelSizedStep = direction * rcpRenderTargetResolution;\n    direction *= projectedRadii;\n\n    // gets the tangent for the current ray, this will be used to handle opposing horizon vectors\n    // Tangent is corrected with respect to face normal by projecting it onto the tangent plane defined by the normal\n    vec3 tangent = getViewPos(vUv + texelSizedStep) - centerViewPos;\n    tangent -= dot(centerNormal, tangent) * centerNormal;\n\n    vec2 stepUV = direction.xy / float(NUM_SAMPLES_PER_RAY - 1);\n\n    // jitter the starting position for ray marching between the nearest neighbour and the sample step size\n    vec2 jitteredOffset = mix(texelSizedStep, stepUV, jitter);\n    //stepUV *= 1.0 + jitter * .1;\n    vec2 sampleUV = vUv + jitteredOffset;\n\n    // top occlusion keeps track of the occlusion contribution of the last found occluder.\n    // set to bias value to avoid near-occluders\n    float topOcclusion = bias;\n    float occlusion = 0.0;\n\n    // march!\n    for (int step = 0; step < NUM_SAMPLES_PER_RAY; ++step) {\n        occlusion += getSampleOcclusion(sampleUV, centerViewPos, centerNormal, tangent, topOcclusion);\n        sampleUV += stepUV;\n    }\n\n    return occlusion;\n}\n\nvoid main()\n{\n    float centerDepth = readDepth(vUv);\n    float viewZ = cameraNearPlaneDistance + centerDepth * cameraFrustumRange;\n    vec3 centerViewPos = viewZ * viewDir;\n    vec3 tangentX = dFdx(centerViewPos);\n    vec3 tangentY = dFdy(centerViewPos);\n    vec3 centerNormal = normalize(cross(tangentX, tangentY));\n\n    // clamp z to a minimum, so the radius does not get excessively large in screen-space\n    vec2 projectedRadii = radiiProjection / max(-centerViewPos.z, 7.0);\n\n    // do not take more steps than there are pixels\n    float totalOcclusion = 0.0;\n\n    vec2 randomFactors = texture2D(ditherTexture, vUv * ditherScale).xy;\n\n    vec2 rayUV = vec2(0.0);\n    for (int i = 0; i < NUM_RAYS; ++i) {\n        rayUV.x = (float(i) + randomFactors.x) / float(NUM_RAYS);\n        vec2 sampleDir = texture2D(sampleDirTexture, rayUV).xy * 2.0 - 1.0;\n        totalOcclusion += getRayOcclusion(sampleDir, randomFactors.y, projectedRadii, centerViewPos, centerNormal);\n    }\n\n    totalOcclusion = 1.0 - clamp(strengthPerRay * totalOcclusion, 0.0, 1.0);\n    gl_FragColor = vec4(vec3(totalOcclusion), 1.0);\n}';

ShaderLibrary['hbao_vertex.glsl'] = 'uniform mat4 inverseProjectionMatrix;\n\nvarying vec2 vUv;\nvarying vec3 viewDir;\nvarying vec3 frustumCorner;\n\n// view vector with z = -1, so we can use nearPlaneDist + linearDepth * (farPlaneDist - nearPlaneDist) as a scale factor to find view space position\nvec3 hx_getLinearDepthViewVector(vec2 position)\n{\n    vec4 unproj = inverseProjectionMatrix * vec4(position, 0.0, 1.0);\n    unproj /= unproj.w;\n    return -unproj.xyz / unproj.z;\n}\n\nvoid main() {\n    vUv = uv;\n    viewDir = hx_getLinearDepthViewVector(position.xy);\n    frustumCorner = hx_getLinearDepthViewVector(vec2(1.0, 1.0));\n    gl_Position = vec4(position, 1.0);\n}';

ShaderLibrary['ssao_blur_fragment.glsl'] = 'varying vec2 vUv1;\nvarying vec2 vUv2;\nvarying vec2 vUv3;\nvarying vec2 vUv4;\n\nuniform sampler2D tDiffuse;\n\nvoid main() {\n    vec4 sum =  texture2D(tDiffuse, vUv1) +\n                texture2D(tDiffuse, vUv2) +\n                texture2D(tDiffuse, vUv3) +\n                texture2D(tDiffuse, vUv4);\n\n    gl_FragColor = sum * .25;\n}';

ShaderLibrary['ssao_blur_vertex.glsl'] = 'varying vec2 vUv1;\nvarying vec2 vUv2;\nvarying vec2 vUv3;\nvarying vec2 vUv4;\n\nuniform vec2 pixelSize;\n\nvoid main() {\n    vUv1 = uv + pixelSize * vec2(-1.5, .5);\n    vUv2 = uv + pixelSize * vec2(.5, .5);\n    vUv3 = uv + pixelSize * vec2(.5, -1.5);\n    vUv4 = uv + pixelSize * vec2(-1.5, -1.5);\n    gl_Position = vec4(position, 1.0);\n}';

ShaderLibrary['ssao_fragment.glsl'] = '#extension GL_OES_standard_derivatives : enable\n\nuniform sampler2D tDiffuse;\nuniform sampler2D ditherTexture;\nuniform vec2 ditherScale;\nuniform float cameraFrustumRange;\nuniform float cameraNearPlaneDistance;\nuniform float rcpFallOffDistance;\nuniform float strengthPerSample;\nuniform float sampleRadius;\nuniform vec2 radiiProjection;   // .5 * proj[0][0] * sampleRadius, .5 * proj[1][1] * sampleRadius\nuniform vec3 samples[NUM_SAMPLES]; // w contains bias\n\nvarying vec2 vUv;\nvarying vec3 viewDir;\nvarying vec3 frustumCorner;\n\nfloat RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nfloat readDepth(vec2 uv)\n{\n    vec4 s = texture2D(tDiffuse, uv);\n    return RGBA8ToFloat(s);\n}\n\nvec3 getViewPos(vec2 sampleUV)\n{\n    float depth = readDepth(sampleUV);\n    float viewZ = depth * cameraFrustumRange + cameraNearPlaneDistance;\n    vec3 viewPos = frustumCorner * vec3(sampleUV * 2.0 - 1.0, 1.0);\n    return viewPos * viewZ;\n}\n\nvoid main()\n{\n    float centerDepth = readDepth(vUv);\n    float viewZ = cameraNearPlaneDistance + centerDepth * cameraFrustumRange;\n    vec3 centerViewPos = viewZ * viewDir;\n    vec3 tangentX = dFdx(centerViewPos);\n    vec3 tangentY = dFdy(centerViewPos);\n    vec3 centerNormal = normalize(cross(tangentX, tangentY));\n\n    float totalOcclusion = 0.0;\n\n    vec3 dither = texture2D(ditherTexture, vUv * ditherScale).xyz;\n    vec3 randomPlaneNormal = normalize(dither - .5);\n\n    float w = centerDepth * cameraFrustumRange + cameraNearPlaneDistance;\n    vec3 sampleRadii;\n    sampleRadii.xy = radiiProjection.xy / w;\n    sampleRadii.z = sampleRadius;\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        vec3 sampleOffset = reflect(samples[i], randomPlaneNormal);\n        vec3 normOffset = sampleOffset;\n        float cosFactor = dot(normOffset, centerNormal);\n        float sign = sign(cosFactor);\n        sampleOffset *= sign;\n        cosFactor *= sign;\n\n        vec3 scaledOffset = sampleOffset * sampleRadii;\n\n        vec2 samplePos = vUv + scaledOffset.xy;\n        float occluderDepth = readDepth(samplePos);\n        float diffZ = (centerDepth - occluderDepth) * cameraFrustumRange;\n\n        // distanceFactor: from 1 to 0, near to far\n        float distanceFactor = clamp(diffZ * rcpFallOffDistance, 0.0, 1.0);\n        distanceFactor = 1.0 - distanceFactor;\n\n        // sampleOcclusion: 1 if occluding, 0 otherwise\n        float sampleOcclusion = float(diffZ > scaledOffset.z);\n        cosFactor = float(cosFactor > .1);\n        totalOcclusion += sampleOcclusion * distanceFactor * cosFactor;\n    }\n    gl_FragColor = vec4(vec3(1.0 - totalOcclusion * strengthPerSample), 1.0);\n}';

ShaderLibrary['ssao_material_fragment.glsl'] = 'varying float linearDepth;\n\n// Only for 0 - 1\nvec4 hx_floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nvoid main()\n{\n    gl_FragColor = hx_floatToRGBA8(linearDepth);\n}\n';

ShaderLibrary['ssao_material_vertex.glsl'] = 'varying float linearDepth;\n\nuniform float nearClip;\nuniform float farClip;\n\nvoid main()\n{\n    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);\n    linearDepth = (-viewPosition.z - nearClip) / (farClip - nearClip);\n    gl_Position = projectionMatrix * viewPosition;\n}';

ShaderLibrary['ssao_vertex.glsl'] = 'uniform mat4 inverseProjectionMatrix;\n\nvarying vec2 vUv;\nvarying vec3 viewDir;\nvarying vec3 frustumCorner;\n\n// view vector with z = -1, so we can use nearPlaneDist + linearDepth * (farPlaneDist - nearPlaneDist) as a scale factor to find view space position\nvec3 hx_getLinearDepthViewVector(vec2 position)\n{\n    vec4 unproj = inverseProjectionMatrix * vec4(position, 0.0, 1.0);\n    unproj /= unproj.w;\n    return -unproj.xyz / unproj.z;\n}\n\nvoid main() {\n    vUv = uv;\n    viewDir = hx_getLinearDepthViewVector(position.xy);\n    frustumCorner = hx_getLinearDepthViewVector(vec2(1.0, 1.0));\n    gl_Position = vec4(position, 1.0);\n}';

AssetLibrary = function()
{
    this._numLoaded = 0;
    this._queue = [];
    this._assets = {};
    this.onComplete = new Signal(/* void */);
    this.onProgress = new Signal(/* number */)
};

AssetLibrary.Type = {
    JSON: 0,
    MODEL: 1,
    TEXTURE_2D: 2,
    TEXTURE_CUBE: 3,
    PLAIN_TEXT: 4
};

AssetLibrary.prototype =
{
    /**
     *
     * @param id
     * @param filename
     * @param type
     * @param parser (optional) Only in case of models
     */
    queueAsset: function(id, filename, type, parser)
    {
        this._queue.push({
            id: id,
            filename: filename,
            type: type,
            parser: parser
        });
    },

    load: function()
    {
        var asset = this._queue[this._numLoaded];
        switch (asset.type) {
            case AssetLibrary.Type.JSON:
                this._json(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.MODEL:
                this._model(asset.filename, asset.id, asset.parser);
                break;
            case AssetLibrary.Type.TEXTURE_2D:
                this._texture2D(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.TEXTURE_CUBE:
                this._textureCube(asset.filename, asset.id);
                break;
            case AssetLibrary.Type.PLAIN_TEXT:
                this._plainText(asset.filename, asset.id);
                break;
        }
    },

    get: function(id) { return this._assets[id]; },

    _json: function(file, id)
    {
        var self = this;
        var loader = new XMLHttpRequest();
        loader.overrideMimeType("application/json");
        loader.open('GET', file, true);
        loader.onreadystatechange = function()
        {
            if (loader.readyState === 4 && loader.status == "200") {
                self._assets[id] = JSON.parse(loader.responseText);
                self._onAssetLoaded();
            }
        };
        loader.send(null);
    },

    _plainText: function(file, id)
    {
        var self = this;
        var loader = new XMLHttpRequest();
        loader.overrideMimeType("application/json");
        loader.open('GET', file, true);
        loader.onreadystatechange = function()
        {
            if (loader.readyState === 4 && loader.status == "200") {
                self._assets[id] = loader.responseText;
                self._onAssetLoaded();
            }
        };
        loader.send(null);
    },

    _textureCube: function(path, id)
    {
        var self = this;
        var loader = new THREE.CubeTextureLoader();
        this._assets[id] = loader.load([
                path + "posX.jpg",
                path + "negX.jpg",
                path + "posY.jpg",
                path + "negY.jpg",
                path + "negZ.jpg",
                path + "posZ.jpg"
            ],
            function() { self._onAssetLoaded(); }
        );
        this._assets[id].mapping = THREE.CubeReflectionMapping;
    },

    _texture2D: function(file, id)
    {
        var self = this;
        var loader = new THREE.TextureLoader();
        var tex = this._assets[id] = loader.load(file, function() { self._onAssetLoaded(); });
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.LinearMipMapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        if (highPerformance)
            tex.anisotropy = 16;
    },

    _model: function(file, id, parser)
    {
        var self = this;
        var loader = new parser();
        loader.options = loader.options || {};
        loader.options.convertUpAxis = true;
        loader.load(file, function(model) {
            self._assets[id] = model;
            self._onAssetLoaded();
        });
    },

    _onAssetLoaded: function()
    {
        this.onProgress.dispatch(this._numLoaded / this._queue.length);

        if (++this._numLoaded === this._queue.length)
            this.onComplete.dispatch(this);
        else
            this.load();
    }
};
ColorScheme = {
    BLUE: new THREE.Color(0x0f69af),
    CYAN: new THREE.Color(0x2dbecd),
    YELLOW: new THREE.Color(0xffc832),
    MAGENTA: new THREE.Color(0xeb3c96),
    GREEN: new THREE.Color(0xa5cd50),
    UNKNOWN: new THREE.Color(0)
};

function TrackPoint()
{
    this.position = new THREE.Vector3();
    this.centerPosition = new THREE.Vector3();
    // orientation will be used to rotate up vector
    this.orientation = new THREE.Quaternion();
    this.isStop = false;
    this.stopIndex = -1;
}

function TrackData()
{
    this._points = [];
}

TrackData.prototype =
{
    get points() { return this._points; },

    initFromCSV: function(positionData, rotationData)
    {
        this._points = [];
        var euler = new THREE.Euler();
        euler.order = 'ZYX';

        var flip = new THREE.Quaternion();
        flip.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415);

        var points = positionData.split("\n");
        //var centers = locatorCenters.split("\n");
        var rotations = rotationData.split("\n");
        for (var i = 0; i < points.length; ++i) {
            var coords = points[i].split(",");
            //var centerCoords = centers[i].split(",");
            var rot = rotations[i].split(",");
            var p = new TrackPoint();
            var v = p.position;
            var q = p.orientation;
            var c = p.centerPosition;

            c.x = parseFloat(coords[0]) * globalScale;
            c.y = parseFloat(coords[1]) * globalScale;
            c.z = parseFloat(coords[2]) * globalScale;

            // TODO: Offset by up vector
            v.x = parseFloat(coords[0]) * globalScale;
            v.y = parseFloat(coords[1]) * globalScale;
            v.z = parseFloat(coords[2]) * globalScale;

            euler.x = parseFloat(rot[0]) * Math.PI / 180;
            euler.y = parseFloat(rot[1]) * Math.PI / 180;
            euler.z = parseFloat(rot[2]) * Math.PI / 180;
            q.setFromEuler(euler);
            q.multiply(flip);
            this._points.push(p);
        }

        /*var m = new THREE.Matrix4();
        var up = new THREE.Vector3();
        for (var i = 0; i < this._points.length; ++i) {
            var p = this._points[i];
            var n = this._points[(i + 1) % this._points.length];
            up.subVectors(p.position, p.centerPosition);
            m.lookAt(p.position, n.position, up);
            m.decompose({}, p.orientation, {});
        }*/
    },

    stopPositionsFromCSV: function(text)
    {
        var lines = text.split("\n");
        var s = new THREE.Vector3();
        for (var i = 0; i < lines.length; ++i) {
            var coords = lines[i].split(",");
            s.x = parseFloat(coords[0]) * globalScale;
            s.y = parseFloat(coords[1]) * globalScale;
            s.z = parseFloat(coords[2]) * globalScale;
            for (var j = 0; j < this.points.length; ++j) {
                var p = this.points[j].centerPosition;
                if (s.distanceTo(p) < .001) {
                    this.points[j].isStop = true;
                    this.points[j].stopIndex = i;
                }
            }
        }
    }
};
function GlobeState(project, materialMap)
{
    this._globe = project.assetLibrary.get("globe-model");
    SwapMaterials.setAll(this._globe, materialMap["globe"]);

    this._globePos = new THREE.Vector3(0, 100, 0);
    this._globe.position.set(this._globePos.x, this._globePos.y, this._globePos.z);
    this._globe.scale.set(5, 5, 5);

    this._mic1 = null;
    this._mic1b = null;
    this._mic2 = null;

    this._scene = project.scene;
    this._camera = project.camera;
    this._project = project;

    this._riding = false;
    this._first = true;

    this._positionIndex = -1;
    this._cameraTransforms = [];

    // the last one should be taken from the track data
    this._addCameraState(new THREE.Vector3(0, 60.5, 10), new THREE.Vector3(0, 60.5, 0));
    this._addCameraState(new THREE.Vector3(0, 10.0, 10), new THREE.Vector3(0, 7.0, 0));
    this._addCameraState(new THREE.Vector3(0, -11.5, 13), new THREE.Vector3(0, -9.5, 0));
    this._addCameraState(new THREE.Vector3(0, -25.0, 13), new THREE.Vector3(0, -25.0, 0));
    this._addCameraState(this._camera.matrix);

    this.tweenTime = 2.0;

    this.onFadeOut = new Signal();
    this.onComplete = new Signal();

    this._initMicrobes(materialMap);
}

GlobeState.prototype =
{
    activate: function()
    {
        this._scene.add(this._globe);
        this._scene.add(this._mic1);
        this._scene.add(this._mic1b);
        this._scene.add(this._mic2);
        this._applyTransform(this._cameraTransforms[0]);
        //this.toNextStage();
    },

    deactivate: function()
    {

    },

    jumpBack: function()
    {
        if (this._riding) return;

        if (this._positionIndex > 0) {
            this._applyPositionIndex(-1);
        }
    },

    toNextStage: function()
    {
        if (this._riding) return;

        this._applyPositionIndex(1);
    },

    _applyPositionIndex: function(dir)
    {
        this._positionIndex += dir;

        if (this._first) {
            this._first = false;
            this._applyTransform(this._cameraTransforms[0]);
            this.onStopped(0);
            return;
        }
        
        var tr1 = this._cameraTransforms[this._positionIndex - dir];
        var tr2 = this._cameraTransforms[this._positionIndex];

        var tween = {
            ratio: 0
        };

        var transform = {
            position: new THREE.Vector3(),
            quat: new THREE.Quaternion(),
            scale: new THREE.Vector3(1, 1, 1)
        };

        var self = this;

        this._riding = true;

        if (this._positionIndex === this._cameraTransforms.length - 1)
            this.onFadeOut.dispatch();

        TweenLite.to(tween, this.tweenTime / this._project.timeScale,
            {
                ease: Power2.easeInOut,
                ratio: 1.0,

                onUpdate: function ()
                {
                    transform.position.copy(tr1.position);
                    transform.position.lerp(tr2.position, tween.ratio);
                    transform.quat.copy(tr1.quat);
                    transform.quat.slerp(tr2.quat, tween.ratio);
                    self._applyTransform(transform);
                },

                onComplete: function ()
                {
                    self._riding = false;
                    self.onStopped(self._positionIndex);
                }
            }
        );
    },

    update: function(dt)
    {
        this._globe.rotation.y += dt * .00003;
    },

    onStopped: function(index)
    {
        if( index === 0 ) {

            return;

        } else {

            index -= 1;

        }

        if (this._positionIndex === this._cameraTransforms.length - 1) {
            this._scene.remove(this._globe);
            this._scene.remove(this._mic1);
            this._scene.remove(this._mic1b);
            this._scene.remove(this._mic2);
            this.onComplete.dispatch();

            try {
                application.openInfo();
            }
            catch(err) {}
        }
        else {
            try {
                application.openLayer(index);
            }
            catch(err) {}
        }
    },

    // relative to globe!
    _addCameraState: function(position, target)
    {
        var matrix;
        var quat = new THREE.Quaternion();
        var pos = new THREE.Vector3();

        if (position instanceof THREE.Matrix4) {
            matrix = position;
        }
        else {
            matrix = new THREE.Matrix4();
            position.x += this._globePos.x;
            position.y += this._globePos.y;
            position.z += this._globePos.z;
            target.x += this._globePos.x;
            target.y += this._globePos.y;
            target.z += this._globePos.z;
            matrix.lookAt(position, target, new THREE.Vector3(0, 1, 0));
            matrix.setPosition(position);
        }

        matrix.decompose(pos, quat, {});

        this._cameraTransforms.push({
            position: pos,
            quat: quat,
            scale: new THREE.Vector3(1, 1, 1)
        })
    },

    _applyTransform: function(tr)
    {
        this._camera.matrix.compose(tr.position, tr.quat, tr.scale);
    },

    _initMicrobes: function(materialMap)
    {
        var material = materialMap["microbe"];
        this._mic1 = this._project.assetLibrary.get("microbe01");
        this._mic2 = this._project.assetLibrary.get("microbe02");

        this._mic1.scale.set(0.01, 0.01, 0.01);
        this._mic1.position.set(-55, 180, -60);
        this._mic1.rotation.z = 1;

        this._mic1b = this._mic1.clone(); //new THREE.Mesh(this._mic1.geometry, this._mic1);
        this._mic1b.position.set(25, 150, -18);
        this._mic1b.rotation.z = -1;

        this._mic2.position.set(0, 72, 0);
        this._mic2.rotation.y = 1.57;

        SwapMaterials.setAll(this._mic1, material);
        SwapMaterials.setAll(this._mic1b, material);
        SwapMaterials.setAll(this._mic2, material);
    }
};
function SimpleThreeProject()
{
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.assetLibrary = null;
    this.container = null;
    this.timeScale = 1.0;
    this._content = null;
    this._stats = null;
    this._renderStats = null;
    this._time = null;
    this._isRunning = false;
};

SimpleThreeProject.prototype =
{
    init: function(debugMode, assetLibrary)
    {
        this.assetLibrary = assetLibrary;

        this._initRenderer();

        if (debugMode) this._initStats();

        var self = this;
        window.addEventListener('resize', function() { self._resizeCanvas() } , false);
        if (this._content) this._content.init(this);

        this._resizeCanvas();
    },

    get content() { return this._content; },
    set content(value)
    {
        this._time = null;
        // we haven't initialized anything yet, so don't destroy/init content either
        if (!this.scene) return;
        if (this._content) this._content.destroy();
        this._content = value;
        this._content.init(this);
        if (this._isRunning) this._content.start();
        this._resizeCanvas();
    },

    _initRenderer: function()
    {
        var dpr = window.devicePixelRatio;
        //if (dpr > 1) dpr *= .75;

        this.renderer = new THREE.WebGLRenderer({ antialias: true } );
        this.renderer.setPixelRatio(dpr);

        this.container = document.getElementById('webglcontainer');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.camera.near = .1;
        this.camera.far = 100.0;

        this.scene.add(this.camera);

        if( isLocalDebug ) {

            document.body.insertBefore(this.container, document.body.lastChild);

        }

        this.container.appendChild(this.renderer.domElement);
    },

    _initStats: function ()
    {
        this._stats = new Stats();
        this._stats.domElement.style.position = 'absolute';
        this._stats.domElement.style.bottom = '0px';
        this._stats.domElement.style.right  = '0px';
        this._stats.domElement.style.zIndex = 100;
        this.container.appendChild(this._stats.domElement);

        this._renderStats = new THREEx.RendererStats();
        this._renderStats.domElement.style.position = 'absolute';
        this._renderStats.domElement.style.bottom = '0px';
        this._renderStats.domElement.style.zIndex = 100;
        this.container.appendChild(this._renderStats.domElement);

        if( !isLocalDebug ) {

            this._stats.domElement.style.display = "none";
            this._renderStats.domElement.style.display = "none";
            
        }        
    },

    _resizeCanvas: function()
    {
        if (!this.renderer) return;

        var width = window.innerWidth;
        var height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.renderer.domElement.style.width = width + "px";
        this.renderer.domElement.style.height = height + "px";

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        if (this._content) this._content.resize(width, height);
    },

    stop: function()
    {
        this._isRunning = false;
    },

    start: function()
    {
        this._isRunning = true;
        if (this._content) this._content.start();
        this._requestAnimationFrame();
    },

    _render: function()
    {
        if (!this._isRunning) return;

        var time = new Date().getTime();
        var dt = 0;
        if (this._time != null)
            dt = time - this._time;

        dt *= this.timeScale;

        this._time = time;

        this._requestAnimationFrame();

        if (this._content) this._content.update(dt);

        if (this._content && this._content.effectComposer)
            this._content.effectComposer.render(dt / 1000.0);
        else
            this.renderer.render(this.scene, this.camera);

        if (this._stats) {
            this._stats.update();
            this._renderStats.update(this.renderer);
        }
    },

    _requestAnimationFrame: function()
    {
        var self = this;
        requestAnimationFrame(function()
        {
            self._render();
        });
    }
};
function TrackState(project, skybox, ambientLight, materialMap)
{
    var trackData = new TrackData();
    trackData.initFromCSV(project.assetLibrary.get("locatorPositions"), project.assetLibrary.get("locatorRotations"), project.assetLibrary.get("locatorCenters"));
    trackData.stopPositionsFromCSV(project.assetLibrary.get("stopPositions"));

    this._cameraController = new TrackController(trackData, project.camera);
    this._cameraController.onStarted.bind(this.onCamStarted, this);
    this._cameraController.onStopped.bind(this.onCamStopped, this);

    this.colorController = new ColorController(project, skybox.material.uniforms.color.value, ambientLight, materialMap);

    this._track = project.assetLibrary.get("track-model");
    this._track.scale.set(globalScale, globalScale, globalScale);

    this._rotateController = new RotateController(this._getAnimatedMicrobes(this._track));

    this._project = project;
    this._scene = project.scene;
    this._camera = project.camera;
    this._stops = [];
    this._time = 0;

    this._initStops(trackData);

    this._materialMap = materialMap;
    SwapMaterials.swapSelectPartialMatch(this._track, materialMap);
}

TrackState.prototype =
{
    activate: function()
    {
        // cheat
        this._cameraController.onStarted.dispatch(0);
        this._cameraController.startInteraction();
    },

    show: function()
    {
        this._scene.add(this._track);
        var materialMap = this._materialMap;

        for (var key in materialMap) {
            if (materialMap.hasOwnProperty(key) && key != "globe" && key != "microbe") {
                var material = materialMap[key];
                material.uniforms.alpha.value = 0.0;
                material.transparent = true;
                TweenLite.to(material.uniforms.alpha, 1.0 / this._project.timeScale,
                    {
                        delay: 1.0 / this._project.timeScale,
                        value: 1.0,
                        onComplete: function ()
                        {
                            material.transparent = false;
                        }
                    }
                );
            }
        }

        this.colorController.tweenTo(0);
    },

    deactivate: function()
    {
        this._scene.remove(this._track);
    },

    jumpBack: function()
    {
        this._cameraController.jumpBack();
    },

    toNextStage: function()
    {
        this._cameraController.rideUntilNextStop();
    },

    update: function(dt)
    {
        this._cameraController.tweenTime = 5.0 / this._project.timeScale;
        this.colorController.tweenTime = 1.0 / this._project.timeScale;
        this._cameraController.update(dt);
        this._rotateController.update(dt);

        this._time += dt;

        var len = this._stops.length;
        var angle = this._time * .0012;
        for (var i = 0; i < len; ++i)
            this._stops[i].rotation.z = angle;
    },

    onCamStopped: function(index)
    {
        this.colorController.setTo(index);
        try {
            application.openLayer(index + 3);
        }
        catch(err) {}
    },

    onCamStarted: function(index)
    {
        this.colorController.tweenTo(index);
        for (var i = 0; i < this._stops.length; ++i) {
            var stop = this._stops[i];
            if (i === index) {
                stop.visible = true;
                stop.material.uniforms.alpha.value = 0;
                TweenLite.to(stop.material.uniforms.alpha, .5, {value: 1.0});
            }
            else {
                stop.visible = false;
            }
        }
    },

    _initStops: function(trackData)
    {
        var points = trackData.points;
        var geom = new THREE.PlaneGeometry(10, 10, 1, 1);

        var materials = [
            ColorScheme.MAGENTA, ColorScheme.MAGENTA, ColorScheme.MAGENTA,
            ColorScheme.MAGENTA, ColorScheme.MAGENTA, ColorScheme.MAGENTA,
            ColorScheme.CYAN, ColorScheme.CYAN, ColorScheme.CYAN,
            ColorScheme.MAGENTA, ColorScheme.MAGENTA, ColorScheme.MAGENTA
        ];

        for (var i = 0; i < points.length; ++i) {
            var p = points[i];
            if (p.isStop) {
                var mesh = new THREE.Mesh(geom, this._createStopMaterial(materials[p.stopIndex]));
                mesh.rotation.setFromQuaternion(p.orientation);
                mesh.position.copy(p.centerPosition);
                mesh.renderOrder = 5000;
                mesh.visible = false;
                this._scene.add(mesh);
                this._stops.push(mesh);
            }
        }
    },

    _createStopMaterial: function(color)
    {
        var mat = new FlatMaterial( {
            map: this._project.assetLibrary.get("stop-circle-texture"),
            color: color,
            fogDensity: .004,
            fogColor: ColorScheme.BLUE,
            fadeDistance: 10.0,
            fadeNear: 2.0,
            //growDistance: 10.0,
            //growScale: 0.1
        });

        mat.side = THREE.DoubleSide;
        mat.transparent = true;
        mat.depthWrite = false;

        return mat;
    },

    _getAnimatedMicrobes: function(obj)
    {
        return FindObject3D.findByNamePartial(obj, "ani");
    }
};
function TunnelNormal()
{
    this._project = null;

    this._light = null;
    this._ambientLight = null;
    this._trackState = null;
    this._globeState = null;

    // init options
    this.flat = false;
    this.fogDensity = .004;
    this.roughness = .35;
    this.performanceCallBack = null;
}

TunnelNormal.prototype =
{
    init: function(project)
    {
        this._project = project;
        this.assetLibrary = project.assetLibrary;

        project.camera.far = 2000.0;

        this._initSky();

        this._ambientLight = new THREE.AmbientLight(new THREE.Color(0x503291),.2);

        this._light = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1.0, 0.0);
        this._light.position.set(3.0, 4.0, 3.0);
        project.scene.add(this._light);
        project.scene.add(this._ambientLight);

        this.time = 0;

        //project.scene.add(this._cameraController._debugMesh);
        if (isLocalDebug) {
            var self = this;
            document.body.addEventListener("click", function() {
                self.playTrack();
            });

            document.body.addEventListener("touchend", function() {
                self.playTrack();
            });
        }

        var materialMap = this._initMaterials();

        this.initStates(project, materialMap);
    },

    start: function()
    {
        this._activateState(this._globeState);
        this._activeState.toNextStage();
    },

    initStates: function (project, materialMap)
    {
        // Track state needs to be initialized before globe, because globe needs track's initial position
        this._trackState = new TrackState(project, this._sky, this._ambientLight, materialMap);
        this._globeState = new GlobeState(project, materialMap);

        this._globeState.onFadeOut.bind(this._onIntroFade, this);
        this._globeState.onComplete.bind(this._onIntroComplete, this);
    },

    doPerformanceTest: function(callback)
    {
        var time = new Date().getTime();
        // this is to prevent init hickups later, thanks to ThreeJS deferred initializations -_-
        var project = this._project;
        var model = project.assetLibrary.get("track-model");
        var bbox = new THREE.Box3();
        var oldPos = project.camera.position.clone();
        bbox.setFromObject(model);

        var loopCount = 0;

        project.scene.add(model);

        var testLoop = function() {
            if (++loopCount < 5) {
                project.camera.far = 10000;
                project.camera.updateProjectionMatrix();
                project.camera.position.z = 500;
                project.camera.lookAt(bbox.center());
                project.camera.updateMatrix();

                project.renderer.render(project.scene, project.camera);

                project.scene.remove(model);

                project.renderer.clear();

                requestAnimationFrame(testLoop);
            }
            else {

                project.camera.far = 2000;
                project.camera.updateProjectionMatrix();
                project.camera.position.copy(oldPos);
                //var performanceTestTime = new Date().getTime() - time;
                callback(0);
            }
        };

        testLoop();
    },

    resize: function(width, height)
    {
    },

    update: function(dt)
    {
        if (dt > 50) dt = 50;
        //dt = 1000 / 60;

        this._activeState.update(dt);

        this._sky.position.copy(this._project.camera.position);
    },

    destroy: function()
    {
        this._globeState.deactivate();
        this._trackState.deactivate();

        this._project.scene.remove(this._light);

        this._project.scene.remove(this._ambientLight);

        this._project.renderer.autoClear = true;
    },

    _initMaterials: function()
    {
        var map = {};
        map["track1_OBJ_m"] = this._createMaterial(ColorScheme.CYAN);
        map["track1_OBJ_m2"] = this._createMaterial(ColorScheme.MAGENTA);
        map["track1_OBJ_m3"] = this._createMaterial(ColorScheme.YELLOW);
        map["track1_OBJ_m4"] = this._createMaterial(ColorScheme.GREEN);
        map["track1_OBJ_m5"] = this._createMaterial(ColorScheme.BLUE);
        map["track1_OBJ_m6"] = this._createMaterial(ColorScheme.YELLOW);
        map["track1_OBJ_m7"] = this._createMaterial(ColorScheme.BLUE);
        map["track1_OBJ_m8"] = this._createMaterial(ColorScheme.MAGENTA);
        map["track1_OBJ_m9"] = this._createMaterial(ColorScheme.YELLOW);

        map["tunnel_track1_OBJ"] = this._createMaterial(new THREE.Color(1, 1, 1), this.assetLibrary.get("tunnel-texture"));
        map["track_track1_OBJ"] = this._createTrackMaterial(this.assetLibrary.get("track-diffuse-texture-4"), this.assetLibrary.get("track-diffuse-texture-4"));

        map["globe"] = this._createMaterial(new THREE.Color(1, 1, 1), this.assetLibrary.get("globe-diffuse-texture"));
        map["microbe"] = this._createMaterial(ColorScheme.CYAN);
        return map;
    },

    _createMaterial: function(color, map, map2)
    {
        var material = new DielectricMaterial({
            color: new THREE.Color(color.r, color.g, color.b),
            map: map,
            map2: map2,
            irradianceProbe: this.assetLibrary.get("irradiance-map"),
            irradianceProbeBoost: 0,
            specularProbe: highPerformance? this.assetLibrary.get("specular-map") : null,
            specularProbeBoost: 2,
            roughness:this.roughness,
            fogDensity: this.fogDensity,
            lowPerformance: !highPerformance
        });

        return material;
    },

    _createTrackMaterial: function(map, map2)
    {
        if (this.flat) {
            return new FlatMaterial({
                map: map,
                map2: map2,
                fogDensity: this.fogDensity
            });
        }

        return new DielectricMaterial({
            map: map,
            map2: map2,
            irradianceProbe: highPerformance? this.assetLibrary.get("irradiance-map") : null,
            irradianceProbeBoost: 3,
            specularProbe: highPerformance? this.assetLibrary.get("specular-map") : null,
            specularProbeBoost: 2,
            roughness: 1.0,
            fogDensity: this.fogDensity,
            ignoreLights: true,
            lowPerformance: !highPerformance
        });
    },

    playTrack: function()
    {
        this._activeState.toNextStage();
    },

    jumpBack: function()
    {
        this._activeState.jumpBack();
    },

    _onIntroFade: function()
    {
        this._trackState.show();
    },

    _onIntroComplete: function()
    {
        this._activateState(this._trackState);
    },

    _activateState: function(state)
    {
        if (this._activeState) this._activeState.deactivate();
        this._activeState = state;
        this._activeState.activate();
    },

    _initSky: function()
    {
        var geometry = new THREE.BoxGeometry(1000, 1000, 1000);
        geometry.scale(-1, 1, 1);
        var material = new SkyMaterial({
            envMap: assetLibrary.get("skybox"),
            color: ColorScheme.BLUE
        });

        this._sky = new THREE.Mesh(geometry, material);
        this._project.scene.add(this._sky);
    }
};
CalculateNormals =
{
    doAll: function(model)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            if (child.geometry) {
                child.geometry.computeVertexNormals(true);
                child.geometry.normalsNeedUpdate = true;
            }
            CalculateNormals.doAll(child);
        }
    }
};
FindObject3D =
{
    findByNamePartial: function(model, name, targetArr)
    {
        if (targetArr === undefined) targetArr = [];

        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            if (child.name.indexOf(name) >= 0)
                targetArr.push(child);
            FindObject3D.findByNamePartial(child, name, targetArr);
        }
        return targetArr;
    }
};
function isPlatformMobile()
{
    var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
    // This is woefully incomplete. Suggestions for alternative methods welcome.
    return ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
}
var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

// Taken from Helix
Signal = function()
{
    this._listeners = [];
    this._lookUp = {};
};

/**
 * Signals keep "this" of the caller, because having this refer to the signal itself would be silly
 */
Signal.prototype =
{
    bind: function(listener, thisRef)
    {
        this._lookUp[listener] = this._listeners.length;
        var callback = thisRef? listener.bind(thisRef) : listener;
        this._listeners.push(callback);
    },

    unbind: function(listener)
    {
        var index = this._lookUp[listener];
        this._listeners.splice(index, 1);
        delete this._lookUp[listener];
    },

    dispatch: function(payload)
    {
        var len = this._listeners.length;
        for (var i = 0; i < len; ++i)
            this._listeners[i](payload);
    },

    get hasListeners()
    {
        return this._listeners.length > 0;
    }
};
SwapMaterials =
{
    setAll: function(model, material)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];
            child.material = material;
            SwapMaterials.setAll(child, material);
        }
    },

    swapSelect: function(model, materialMap)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];

            if (materialMap.hasOwnProperty(child.name)) {
                child.material = materialMap[child.name];
            }

            SwapMaterials.swapSelect(child, materialMap);
        }
    },

    swapSelectPartialMatch: function(model, materialMap)
    {
        for (var i = 0; i < model.children.length; ++i) {
            var child = model.children[i];

            for (var key in materialMap) {
                if (materialMap.hasOwnProperty(key)) {
                    if (child.name.indexOf(key) >= 0)
                        child.material = materialMap[key];
                }
            }

            SwapMaterials.swapSelect(child, materialMap);
        }
    }
};
CustomTunnelMaterial = function(options)
{
    var defines = "";

    if (options.map) defines += "#define ALBEDO_MAP\n";
    if (options.skyboxPosition || options.skyboxSize) defines += "#define LOCAL_SKYBOX\n";
    if (options.specularProbe) defines += "#define SPECULAR_PROBE\n";
    if (options.irradianceProbe) defines += "#define IRRADIANCE_PROBE\n";
    if (options.normalMap) defines += "#define NORMAL_MAP\n";
    if (options.normalDetailMap) defines += "#define NORMAL_DETAIL_MAP\n";
    if (options.aoMap) defines += "#define AMBIENT_OCCLUSION_MAP\n";
    if (!options.lowPerformance) defines += "#define PERFORMANCE_PROFILE_HIGH\n";

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.copyGammaToLinear(options.color);
    }
    else options.color = new THREE.Color(0xffffff);

    options.roughness = options.roughness === undefined? .05 : options.roughness;

    var materialUniforms =
    {
        "albedoMap": {
            type: "t",
            value: options.map
        },

        "color": {
            type: "c",
            value: options.color
        },

        "roughness": {
            type: "f",
            value: options.roughness
        },

        "normalSpecularReflection": {
            type: "f",
            //value: .04  // based on polyurethane (clear coat) index of refraction 1.5, as opposed to base layer, which would be .027
            value: .027
        },

        "normalMap": {
            type: "t",
            value: options.normalMap
        },

        "normalDetailMap": {
            type: "t",
            value: options.normalDetailMap
        },

        "aoMap": {
            type: "t",
            value: options.aoMap
        },

        "skyboxPosition": {
            type: "v3",
            value: options.skyboxPosition? options.skyboxPosition : new THREE.Vector3()
        },

        "skyboxSize": {
            type: "f",
            value: options.skyboxSize? options.skyboxSize : 10.0
        },

        "specularProbe": {
            type: "t",
            value: options.specularProbe
        },

        // provided in exposure stops
        "specularProbeBoost": {
            type: "f",
            value: options.specularProbeBoost? Math.pow(2, options.specularProbeBoost) : 1.0
        },

        "irradianceProbe": {
            type: "t",
            value: options.irradianceProbe
        },

        // provided in exposure stops
        "irradianceProbeBoost": {
            type: "f",
            value: options.irradianceProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        },

        "normalMapDetailUVScale": {
            type: "f",
            value: options.normalMapDetailUVScale || 1.0
        },

        "normalMapDetailScale": {
            type: "f",
            value: options.normalMapDetailScale ||.1
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: THREE.UniformsUtils.merge([
                materialUniforms,
                THREE.UniformsLib["lights"]
            ]),

            lights: true,

            vertexShader: defines + ShaderLibrary.get("custom_vertex"),
            fragmentShader: defines + ShaderLibrary.get("custom_fragment")
        }
    );

    if (options.map)
        this.uniforms["albedoMap"].value = options.map;

    if (options.normalMap) {
        this.extensions.derivatives = true;
        this.uniforms["normalMap"].value = options.normalMap;
    }

    if (options.specularProbe)
        this.uniforms["specularProbe"].value = options.specularProbe;

    if (options.irradianceProbe)
        this.uniforms["irradianceProbe"].value = options.irradianceProbe;

    if (options.aoMap)
        this.uniforms["aoMap"].value = options.aoMap;

    if (options.normalDetailMap) {
        this.extensions.derivatives = true;
        this.uniforms["normalDetailMap"].value = options.normalDetailMap;
    }
};

CustomTunnelMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
DielectricMaterial = function(options)
{
    var defines = "";

    if (options.map) defines += "#define ALBEDO_MAP\n";
    if (options.map2) defines += "#define ALBEDO_MAP_2\n";
    if (options.skyboxPosition || options.skyboxSize) defines += "#define LOCAL_SKYBOX\n";
    if (options.specularProbe) defines += "#define SPECULAR_PROBE\n";
    if (options.irradianceProbe) defines += "#define IRRADIANCE_PROBE\n";
    if (options.normalMap) defines += "#define NORMAL_MAP\n";
    if (options.roughnessMap) defines += "#define ROUGHNESS_MAP\n";
    if (options.emissionMap) defines += "#define EMISSION_MAP\n";
    if (options.aoMap) defines += "#define AMBIENT_OCCLUSION_MAP\n";
    if (!options.lowPerformance) defines += "#define PERFORMANCE_PROFILE_HIGH\n";

    if (options.ssaoRenderer) {
        defines += "#define SSAO_MAP\n";
    }

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.copyGammaToLinear(options.color);
    }
    else options.color = new THREE.Color(0xffffff);

    if (options.emissionColor) {
        options.emissionColor = new THREE.Color(options.emissionColor);
        options.emissionColor.copyGammaToLinear(options.emissionColor);
    }
    else options.emissionColor = new THREE.Color(0, 0, 0);

    if (options.specularProbeColor) {
        options.specularProbeColor = new THREE.Color(options.specularProbeColor);
        options.specularProbeColor.copyGammaToLinear(options.specularProbeColor);
    }
    else options.specularProbeColor = new THREE.Color(1, 1, 1);

    this._specularProbeBoost = options.specularProbeBoost? Math.pow(2, options.specularProbeBoost) : 1.0;

    options.specularProbeColor.multiplyScalar(this._specularProbeBoost);

    options.roughness = options.roughness === undefined? .05 : options.roughness;

    if (options.shadowRenderer) {
        this._shadowRenderer = options.shadowRenderer;
        defines += "#define SHADOW_MAP\n";
        this._shadowRenderer.onUpdate.bind(this._onShadowUpdate, this);
    }

    if (options.fogDensity || options.fogColor)
        defines += "#define FOG\n";

    if (options.celSpecularCutOff)
        defines += "#define CEL_SPECULAR\n";

    options.fogColor = new THREE.Color(options.fogColor || 0xffffff);
    options.fogColor.copyGammaToLinear(options.fogColor);

    var materialUniforms =
    {
        "alpha": {
            type: "f",
            value: 1
        },

        "fogDensity": {
            type: "f",
            value: options.fogDensity ||.1
        },

        "fogColor": {
            type: "c",
            value: options.fogColor
        },

        "albedoMap": {
            type: "t",
            value: options.map
        },

        "albedoMap2": {
            type: "t",
            value: options.map2
        },

        "albedoBlend": {
            type: "f",
            value: options.albedoBlend || 0.0
        },

        "color": {
            type: "c",
            value: options.color
        },

        "celSpecularCutOff": {
            type: "f",
            value: options.celSpecularCutOff || 1
        },

        "roughness": {
            type: "f",
            value: options.roughness
        },

        "normalSpecularReflection": {
            type: "f",
            //value: .04  // based on polyurethane (clear coat) index of refraction 1.5, as opposed to base layer, which would be .027
            value: .027
        },

        "normalMap": {
            type: "t",
            value: options.normalMap
        },

        "ssaoMap": {
            type: "t",
            value: options.ssaoRenderer? options.ssaoRenderer.target : null
        },

        "emissionMap": {
            type: "t",
            value: options.emissionMap
        },

        "emissionColor": {
            type: "c",
            value: options.emissionColor
        },

        "roughnessMap": {
            type: "t",
            value: options.roughnessMap
        },

        "roughnessMapRange": {
            type: "f",
            value: options.roughnessMapRange || .3
        },

        "aoMap": {
            type: "t",
            value: options.aoMap
        },

        "shadowMap": {
            type: "t",
            value: this._shadowRenderer? this._shadowRenderer.shadowMap.texture : null
        },

        "shadowMatrix": {
            type: "m4",
            value: new THREE.Matrix4()
        },

        "skyboxPosition": {
            type: "v3",
            value: options.skyboxPosition? options.skyboxPosition : new THREE.Vector3()
        },

        "skyboxSize": {
            type: "f",
            value: options.skyboxSize? options.skyboxSize : 10.0
        },

        "specularProbe": {
            type: "t",
            value: options.specularProbe
        },

        "specularProbeColor": {
            type: "c",
            value: options.specularProbeColor
        },

        "irradianceProbe": {
            type: "t",
            value: options.irradianceProbe
        },

        // provided in exposure stops
        "irradianceProbeBoost": {
            type: "f",
            value: options.irradianceProbeBoost? Math.pow(2, options.irradianceProbeBoost) : 1.0
        }
    };

    var uniforms = options.ignoreLights? materialUniforms :
        THREE.UniformsUtils.merge([
            materialUniforms,
            THREE.UniformsLib["lights"]
        ]);

    THREE.ShaderMaterial.call(this,
        {
            uniforms: uniforms,

            lights: options.ignoreLights? false : true,

            vertexShader: defines + ShaderLibrary.get("dielectric_vertex"),
            fragmentShader: defines + ShaderLibrary.get("dielectric_fragment")
        }
    );

    if (options.map)
        this.uniforms["albedoMap"].value = options.map;

    if (options.map2)
        this.uniforms["albedoMap2"].value = options.map2;

    if (options.normalMap) {
        this.extensions.derivatives = true;
        this.uniforms["normalMap"].value = options.normalMap;
    }

    if (options.specularProbe)
        this.uniforms["specularProbe"].value = options.specularProbe;

    if (options.irradianceProbe)
        this.uniforms["irradianceProbe"].value = options.irradianceProbe;

    if (options.aoMap)
        this.uniforms["aoMap"].value = options.aoMap;

    if (options.roughnessMap)
        this.uniforms["roughnessMap"].value = options.roughnessMap;

    if (options.emissionMap)
        this.uniforms["emissionMap"].value = options.emissionMap;

    if (options.ssaoRenderer)
        this.uniforms["ssaoMap"].value = options.ssaoRenderer.target;

    if (this._shadowRenderer)
        this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap.texture;

};

DielectricMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);

DielectricMaterial.prototype._onShadowUpdate = function()
{
    this.uniforms["shadowMatrix"].value = this._shadowRenderer.shadowMapMatrix;
    this.uniforms["shadowMap"].value = this._shadowRenderer.shadowMap.texture;
};
FlatMaterial = function(options)
{
    options = options || {};

    var defines = "";
    if (options.map2) {
        defines += "#define ALBEDO_MAP_2\n";
    }

    if (options.color) {
        options.color = new THREE.Color(options.color);
        options.color.convertGammaToLinear();
    }

    if (options.growDistance) {
        defines += "#define GROW_CLOSE\n";
    }

    if (options.fadeDistance) {
        defines += "#define FADE_NEAR\n";
    }

    var materialUniforms =
    {
        "color": {
            type: "f",
            value: options.color || new THREE.Color(1, 1, 1)
        },

        "growDistance": {
            type: "f",
            value: options.growDistance || 1.0
        },

        "growScale": {
            type: "f",
            value: options.growScale || 1.0
        },

        "fadeNear": {
            type: "f",
            value: options.fadeNear || 1.0
        },

        "fadeDistance": {
            type: "f",
            value: options.fadeDistance || 0.0
        },

        "albedoMap": {
            type: "t",
            value: options.map
        },

        "albedoMap2": {
            type: "t",
            value: options.map2
        },

        "albedoBlend": {
            type: "f",
            value: options.albedoBlend || 0.0
        },

        "alpha": {
            type: "f",
            value: options.alpha || 1.0
        },

        "fogDensity": {
            type: "f",
            value: options.fogDensity ||.1
        },

        "fogColor": {
            type: "c",
            value: options.fogColor
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: defines + ShaderLibrary.get("flat_vertex"),
            fragmentShader: defines + ShaderLibrary.get("flat_fragment")
        }
    );
};

FlatMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
OutlineMaterial = function(options)
{
    options = options || {};

    var materialUniforms =
    {
        "color": {
            type: "c",
            value: options.color || new THREE.Color(0, 0, 0)
        },

        "alpha": {
            type: "f",
            value: 1.0
        },

        "thickness": {
            type: "f",
            value: options.thickness ||.1
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("outline_vertex"),
            fragmentShader: ShaderLibrary.get("outline_fragment")
        }
    );

    this.side = THREE.BackSide;
};

OutlineMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
SkyMaterial = function(options)
{
    var materialUniforms =
    {
        "envMap": {
            type: "t",
            value: options.envMap
        },

        "color": {
            type: "f",
            value: new THREE.Color(0xffffff)
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("sky_vertex"),
            fragmentShader: ShaderLibrary.get("sky_fragment")
        }
    );

};

SkyMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype);
function HBAORenderer(scene, camera, renderer, numRays, numSamplesPerRay)
{
    numSamplesPerRay = numSamplesPerRay || 5;
    numRays = numRays || 5;

    this._numRays = numRays;
    this._numSamplesPerRay = numSamplesPerRay;
    this._strength = 2.0;
    this._fallOffDistance = 50.0;
    this._radius = 1.0;
    this._bias = .05;

    this.onUpdate = new Signal();

    this._invProjectionMatrix = new THREE.Matrix4();
    this._camera = camera;

    var ssaoMaterial = new SSAOMaterial();
    ssaoMaterial.uniforms["nearClip"].value = camera.near;
    ssaoMaterial.uniforms["farClip"].value = camera.far;

    this.renderPass = new THREE.RenderPass(scene, camera, ssaoMaterial);
    this.renderPass.clearColor = new THREE.Color(1, 1, 1);

    this.scene = scene;
    this.effectComposer = new THREE.EffectComposer(renderer);

    this.ssaoPass = new THREE.ShaderPass(new HBAOShader(numRays, numSamplesPerRay));
    this.ssaoPass.uniforms["strengthPerRay"].value = this._strength / this._numRays;
    this.ssaoPass.uniforms["bias"].value = this._bias;
    this.ssaoPass.uniforms["cameraFrustumRange"].value = camera.far - camera.near;
    this.ssaoPass.uniforms["cameraNearPlaneDistance"].value = camera.near;
    this.ssaoPass.uniforms["rcpFallOffDistance"].value = 1.0 / this._fallOffDistance;
    this.ssaoPass.material.extensions.derivatives = true;

    this._initDitherTexture();
    this._initSampleDirTexture();

    this.blurPass = new THREE.ShaderPass(SSAOBlurShader);

    this.ssaoPass.uniforms["ditherScale"].value = new THREE.Vector2(512 * .25, 512 * .25);
    this.blurPass.uniforms["pixelSize"].value = new THREE.Vector2(1/512, 1/512);

    this.effectComposer.addPass(this.renderPass);
    this.effectComposer.addPass(this.ssaoPass);

    this.effectComposer.addPass(this.blurPass);
    this.effectComposer.addPass(this.blurPass);

    this.target = this.effectComposer.renderTarget1;
}

HBAORenderer.prototype =
{
    setSize: function(width, height)
    {
        width = Math.floor(width);
        height = Math.floor(height);
        this.effectComposer.setSize(width, height);

        this.ssaoPass.uniforms["ditherScale"].value = new THREE.Vector2(width * .25, height * .25);
        this.ssaoPass.uniforms["rcpRenderTargetResolution"].value = new THREE.Vector2(1.0 / width, 1.0 / height);
        this.blurPass.uniforms["pixelSize"].value = new THREE.Vector2(1/width, 1/height);

        //this.hBlur.uniforms["h"].value = 1 / width;
        //this.vBlur.uniforms["v"].value = 1 / height;
    },

    render: function()
    {
        this._invProjectionMatrix.getInverse(this._camera.projectionMatrix);
        this.ssaoPass.uniforms["inverseProjectionMatrix"].value = this._invProjectionMatrix;

        var m = this._camera.projectionMatrix.elements;
        this.ssaoPass.uniforms["radiiProjection"].value = new THREE.Vector2(this._radius * .5 * m[0], this._radius * .5 * m[5]);
        this.effectComposer.render(1/60);
        this.onUpdate.dispatch();
    },

    _initSampleDirTexture: function()
    {
        var data = [];
        var j = 0;

        for (var i = 0; i < 256; ++i)
        {
            var angle = i / 256 * 2.0 * Math.PI;
            var r = Math.cos(angle)*.5 + .5;
            var g = Math.sin(angle)*.5 + .5;
            data[j] = Math.round(r * 0xff);
            data[j+1] = Math.round(g * 0xff);
            data[j+2] = 0x00;
            data[j+3] = 0xff;
            j += 4;
        }

        var sampleDirTexture = new THREE.DataTexture(new Uint8Array(data), 256, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
        sampleDirTexture.needsUpdate = true;
        this.ssaoPass.uniforms["sampleDirTexture"].value = sampleDirTexture;
    },

    _initDitherTexture: function()
    {
        var data = [];

        var i;
        var j = 0;
        var offsets1 = [];
        var offsets2 = [];

        for (i = 0; i < 16; ++i) {
            offsets1.push(i / 16.0);
            offsets2.push(i / 15.0);
        }

        this._shuffle(offsets1);
        this._shuffle(offsets2);

        i = 0;

        for (var y = 0; y < 4; ++y) {
            for (var x = 0; x < 4; ++x) {
                var r = offsets1[i];
                var g = offsets2[i];

                ++i;

                data[j] = Math.round(r * 0xff);
                data[j + 1] = Math.round(g * 0xff);
                data[j + 2] = 0x00;
                data[j + 3] = 0xff;

                j += 4;
            }
        }

        var ditherTexture = new THREE.DataTexture(new Uint8Array(data), 4, 4, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.LinearFilter, THREE.LinearFilter);
        ditherTexture.needsUpdate = true;
        this.ssaoPass.uniforms["ditherTexture"].value = ditherTexture;
    },

    _shuffle: function(array)
    {
        var currentIndex = array.length, temporaryValue, randomIndex ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
};
/**
 * Just a 4x4 blur
 */
HBAOShader = function(numRays, numSamplesPerRay)
{
    var defines = "#define NUM_RAYS " + numRays + "\n";
	defines += "#define NUM_SAMPLES_PER_RAY " + numSamplesPerRay + "\n";

	this.uniforms = {
		"tDiffuse": 					{ type: "t", value: null },
		"ditherTexture": 				{ type: "t", value: null },
		"sampleDirTexture": 			{ type: "t", value: null },
		"ditherScale": 					{ type: "v2", value: new THREE.Vector2() },
		"cameraFrustumRange":      		{ type: "f", value: 0.0 },
		"cameraNearPlaneDistance":  	{ type: "f", value: 0.0 },
		"rcpFallOffDistance":       	{ type: "f", value: 0.0 },
		"strengthPerRay":   			{ type: "f", value: 0.0 },
		"radiiProjection":       		{ type: "v2", value: new THREE.Vector2() },
		"bias":       					{ type: "f", value: 0 },
		"inverseProjectionMatrix":  	{ type: "m4", value: new THREE.Matrix4() },
		"rcpRenderTargetResolution":	{ type: "v2", value: new THREE.Vector2() },
	};

	this.vertexShader = defines + ShaderLibrary.get("hbao_vertex");
	this.fragmentShader = defines + ShaderLibrary.get("hbao_fragment");
};

PoissonSphere = function(mode, initialDistance, decayFactor, maxTests)
{
    this._mode = mode === undefined? PoissonSphere.SPHERICAL : mode;
    this._initialDistance = initialDistance || 1.0;
    this._decayFactor = decayFactor || .99;
    this._maxTests = maxTests || 20000;
    this._currentDistance = 0;
    this._points = null;
    this.reset();
};

PoissonSphere.BOX = 0;
PoissonSphere.SPHERICAL = 1;

PoissonSphere.prototype =
{
    getPoints: function()
    {
        return this._points;
    },

    reset : function()
    {
        this._currentDistance = this._initialDistance;
        this._points = [];
    },

    generatePoints: function(numPoints)
    {
        for (var i = 0; i < numPoints; ++i)
            this.generatePoint();
    },

    generatePoint: function()
    {
        for (;;) {
            var testCount = 0;
            var sqrDistance = this._currentDistance*this._currentDistance;

            while (testCount++ < this._maxTests) {
                var candidate = this._getCandidate();
                if (this._isValid(candidate, sqrDistance)) {
                    this._points.push(candidate);
                    return candidate;
                }
            }
            this._currentDistance *= this._decayFactor;
        }
    },

    _getCandidate: function()
    {
        for (;;) {
            var x = Math.random() * 2.0 - 1.0;
            var y = Math.random() * 2.0 - 1.0;
            var z = Math.random() * 2.0 - 1.0;
            if (this._mode === PoissonSphere.BOX || (x * x + y * y + z * z <= 1))
                return new THREE.Vector4(x, y, z, 0.0);
        }
    },

    _isValid: function(candidate, sqrDistance)
    {
        var len = this._points.length;
        for (var i = 0; i < len; ++i) {
            var p = this._points[i];
            var dx = candidate.x - p.x;
            var dy = candidate.y - p.y;
            var dz = candidate.z - p.z;
            if (dx*dx + dy*dy + dz*dz < sqrDistance)
                return false;
        }

        return true;
    }
};

/**
 * Just a 4x4 blur
 */
SSAOBlurShader = {

	uniforms: {

		"tDiffuse": 	{ type: "t", value: null },
		"pixelSize":	{ type: "v2", value: new THREE.Vector2() },
	},

	vertexShader: ShaderLibrary.get("ssao_blur_vertex"),
	fragmentShader: ShaderLibrary.get("ssao_blur_fragment")

};

SSAOMaterial = function()
{
    var materialUniforms = {
        "nearClip": {
            type: "f",
            value: 0.0
        },
        "farClip": {
            type: "f",
            value: 0.0
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("ssao_material_vertex"),
            fragmentShader: ShaderLibrary.get("ssao_material_fragment")
        }
    );
};

SSAOMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
function SSAORenderer(scene, camera, renderer, numSamples)
{
    numSamples = numSamples || 16;
    if (numSamples > 64) numSamples = 64;

    this._numSamples = numSamples;
    this._strength = 2.0;
    this._fallOffDistance = 2.0;
    this._radius = .5;

    this.onUpdate = new Signal();

    this._invProjectionMatrix = new THREE.Matrix4();
    this._camera = camera;

    var ssaoMaterial = new SSAOMaterial();
    ssaoMaterial.uniforms["nearClip"].value = camera.near;
    ssaoMaterial.uniforms["farClip"].value = camera.far;

    this.renderPass = new THREE.RenderPass(scene, camera, ssaoMaterial);
    this.renderPass.clearColor = new THREE.Color(1, 1, 1);

    this.scene = scene;
    this.effectComposer = new THREE.EffectComposer(renderer);

    this.ssaoPass = new THREE.ShaderPass(new SSAOShader(numSamples));
    this.ssaoPass.uniforms["cameraFrustumRange"].value = camera.far - camera.near;
    this.ssaoPass.uniforms["cameraNearPlaneDistance"].value = camera.near;
    this.ssaoPass.uniforms["strengthPerSample"].value = 2.0 * this._strength / this._numSamples;
    this.ssaoPass.uniforms["rcpFallOffDistance"].value = 1.0 / this._fallOffDistance;
    this.ssaoPass.uniforms["sampleRadius"].value = this._radius;

    this._initDitherTexture();
    this._initSamples();

    this.blurPass = new THREE.ShaderPass(SSAOBlurShader);

    this.ssaoPass.uniforms["ditherScale"].value = new THREE.Vector2(512 * .25, 512 * .25);
    this.blurPass.uniforms["pixelSize"].value = new THREE.Vector2(1/512, 1/512);

    this.effectComposer.addPass(this.renderPass);
    this.effectComposer.addPass(this.ssaoPass);
    this.effectComposer.addPass(this.blurPass);
    this.effectComposer.addPass(this.blurPass);

    this.target = this.effectComposer.renderTarget1;
}

SSAORenderer.prototype =
{
    setSize: function(width, height)
    {
        width = Math.floor(width);
        height = Math.floor(height);
        this.effectComposer.setSize(width, height);

        this.ssaoPass.uniforms["ditherScale"].value = new THREE.Vector2(width * .25, height * .25);
        this.blurPass.uniforms["pixelSize"].value = new THREE.Vector2(1/width, 1/height);

        //this.hBlur.uniforms["h"].value = 1 / width;
        //this.vBlur.uniforms["v"].value = 1 / height;
    },

    render: function()
    {
        var m = this._camera.projectionMatrix.elements;
        this._invProjectionMatrix.getInverse(this._camera.projectionMatrix);
        this.ssaoPass.uniforms["radiiProjection"].value = new THREE.Vector2(this._radius * .5 * m[0], this._radius * .5 * m[5]);
        this.ssaoPass.uniforms["inverseProjectionMatrix"].value = this._invProjectionMatrix;
        this.effectComposer.render(1/60);
        this.onUpdate.dispatch();
    },

    _initDitherTexture: function()
    {
        var data = [ 126, 255, 126, 255, 135, 253, 105, 255, 116, 51, 26, 255, 137, 57, 233, 255, 139, 254, 121, 255, 56, 61, 210, 255, 227, 185, 73, 255, 191, 179, 30, 255, 107, 245, 173, 255, 205, 89, 34, 255, 191, 238, 138, 255, 56, 233, 125, 255, 198, 228, 161, 255, 85, 13, 164, 255, 140, 248, 168, 255, 147, 237, 65, 255 ];
        var ditherTexture = new THREE.DataTexture(new Uint8Array(data), 4, 4, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.LinearFilter, THREE.LinearFilter);
        ditherTexture.needsUpdate = true;
        this.ssaoPass.uniforms["ditherTexture"].value = ditherTexture;
    },

    _initSamples: function()
    {
        var poisson = new PoissonSphere();
        poisson.generatePoints(this._numSamples);
        var poissonPoints = poisson.getPoints();

        for (var i = 0; i < this._numSamples; ++i) {
            var point = poissonPoints[i];

            // create a bit more for closer occlusion
            //point.x = Math.sign(point.x) * Math.pow(point.x, 2.0);
            //point.y = Math.sign(point.y) * Math.pow(point.y, 2.0);
            //point.z = Math.sign(point.z) * Math.pow(point.z, 2.0);
        }

        this.ssaoPass.uniforms["samples"].value = poissonPoints;
    }
};
/**
 * Just a 4x4 blur
 */
SSAOShader = function(numSamples)
{
    var defines = "#define NUM_SAMPLES " + numSamples + "\n";

	this.uniforms = {
		"tDiffuse": 				{ type: "t", value: null },
		"ditherTexture": 			{ type: "t", value: null },
		"ditherScale": 				{ type: "v2", value: new THREE.Vector2() },
		"cameraFrustumRange":      	{ type: "f", value: 0.0 },
		"cameraNearPlaneDistance":  { type: "f", value: 0.0 },
		"rcpFallOffDistance":       { type: "f", value: 0.0 },
		"strengthPerSample":   		{ type: "f", value: 0.0 },
		"radiiProjection":       	{ type: "v2", value: new THREE.Vector2() },
		"sampleRadius":       	    { type: "f", value: 0 },
		"samples":       	        { type: "v3v", value: [] },
		"inverseProjectionMatrix":	{ type: "m4", value: new THREE.Matrix4() }
	};

	this.vertexShader = defines + ShaderLibrary.get("ssao_vertex");
	this.fragmentShader = defines + ShaderLibrary.get("ssao_fragment");
};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.ShadowHorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"h":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: ShaderLibrary.get("vsm_blur_x_vertex"),
	fragmentShader: ShaderLibrary.get("vsm_blur_x_fragment")

};

function ShadowRenderer(scene, renderer, resolutionH, resolutionV, light, bbox)
{
    resolutionH = resolutionH === undefined? 512 : resolutionH;
    resolutionV = resolutionV === undefined? 512 : resolutionV;


    //this._numBlurs = 0;
    //this.maxBlurs = 2;
    this.onUpdate = new Signal();

    this.shadowMap = new THREE.WebGLRenderTarget( resolutionH, resolutionV,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        });

    this.renderer = renderer;
    this._light = light;
    var matrix = new THREE.Matrix4();
    matrix.getInverse(this._light.matrixWorld);
    bbox = bbox.clone();
    bbox.applyMatrix4(matrix);
    this._lightCamera = new THREE.OrthographicCamera(bbox.min.x, bbox.max.x, bbox.max.y, bbox.min.y, -bbox.max.z, -bbox.min.z);
    this.shadowMapMatrix = new THREE.Matrix4();

    this.shadowMaterial = new VSMMaterial();

    this.renderPass = new THREE.RenderPass(scene, this._lightCamera, new VSMMaterial());
    this.renderPass.clearColor = new THREE.Color(1, 1, 1);

    this.scene = scene;
    this.effectComposer = new THREE.EffectComposer(renderer, this.shadowMap);
    this.effectComposer.addPass(this.renderPass);

    this.hBlur = new THREE.ShaderPass(THREE.ShadowHorizontalBlurShader);
    this.vBlur = new THREE.ShaderPass(THREE.ShadowVerticalBlurShader);
    this.hBlur.uniforms["h"].value = 1/resolutionH;
    this.vBlur.uniforms["v"].value = 1/resolutionV;

    this.effectComposer.addPass(this.hBlur);
    this.effectComposer.addPass(this.vBlur);
    //this.effectComposer.addPass(this.hBlur);
    //this.effectComposer.addPass(this.vBlur);
}

ShadowRenderer.prototype =
{
    render: function()
    {
        var lightCamera = this._lightCamera;
        lightCamera.position.copy(this._light.position);
        lightCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        lightCamera.updateProjectionMatrix();
        lightCamera.updateMatrixWorld();
        this.shadowMapMatrix.getInverse(lightCamera.matrixWorld);
        this.shadowMapMatrix.multiplyMatrices(lightCamera.projectionMatrix, this.shadowMapMatrix);
        this.effectComposer.render(1/60);
        //this.scene.overrideMaterial = this.shadowMaterial;
        //this.renderer.render(this.scene, lightCamera, this.shadowMap);
        //this.scene.overrideMaterial = null;
        this.onUpdate.dispatch();
    }
};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.ShadowVerticalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"v":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: ShaderLibrary.get("vsm_blur_y_vertex"),
	fragmentShader: ShaderLibrary.get("vsm_blur_y_fragment")

};

VSMMaterial = function()
{
    var materialUniforms = {
        depthBias: {
            type: "f",
            value: .0001
        }
    };

    THREE.ShaderMaterial.call(this,
        {
            uniforms: materialUniforms,

            vertexShader: ShaderLibrary.get("vsm_vertex"),
            fragmentShader: ShaderLibrary.get("vsm_fragment")
        }
    );
};

VSMMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
function ColorController(project, backgroundColor, ambientLight, materialMap)
{
    this.tweenTime = .5;
    this._scene = project.scene;
    this._materials = materialMap;
    this._ambientLight = ambientLight;
    this._backgroundColor = backgroundColor;
    this._backgroundColors = [
        ColorScheme.YELLOW,
        ColorScheme.YELLOW,
        ColorScheme.YELLOW,
        ColorScheme.BLUE,
        ColorScheme.BLUE,
        ColorScheme.BLUE,
        ColorScheme.MAGENTA,
        ColorScheme.MAGENTA,
        ColorScheme.MAGENTA,
        ColorScheme.GREEN,
        ColorScheme.GREEN,
        ColorScheme.GREEN
    ];
    this._backgroundColor.copy(ColorScheme.BLUE);
    this._textureNames = [
        "track-diffuse-texture-4",
        "track-diffuse-texture-4",
        "track-diffuse-texture-4",
        "track-diffuse-texture-1",
        "track-diffuse-texture-1",
        "track-diffuse-texture-1",
        "track-diffuse-texture-3",
        "track-diffuse-texture-3",
        "track-diffuse-texture-3",
        "track-diffuse-texture-2",
        "track-diffuse-texture-2",
        "track-diffuse-texture-2"
    ];
    this._assetLibrary = project.assetLibrary;
    this._updateColor();
}

ColorController.prototype =
{
    get color()
    {
        return this._backgroundColor;
    },

    setTo: function(value)
    {
        var color = this._backgroundColors[value];
        var textureName = this._textureNames[value];
        this._index = value;
        this._backgroundColor.copy(color);
        var mat = this._materials["track_track1_OBJ"];
        mat.uniforms["albedoMap2"].value = this._assetLibrary.get(textureName);
        mat.uniforms["albedoBlend"].value = 1.0;
    },

    tweenTo: function(value)
    {
        var self = this;
        this._index = value;
        var color = this._backgroundColors[value];
        var textureName = this._textureNames[value];
        TweenLite.to(this._backgroundColor, this.tweenTime, {r:color.r, g:color.g, b:color.b, onUpdate:function()
        {
            self._updateColor();
        }});

        var mat = this._materials["track_track1_OBJ"];
        mat.uniforms["albedoMap"].value = mat.uniforms["albedoMap2"].value;
        mat.uniforms["albedoMap2"].value = this._assetLibrary.get(textureName);
        mat.uniforms["albedoBlend"].value = 0.0;

        TweenLite.to(mat.uniforms["albedoBlend"], this.tweenTime, {value:1.0});
    },

    _updateColor: function()
    {
        var color = this._backgroundColor;
        for (var key in this._materials) {
            if (this._materials.hasOwnProperty(key)) {
                var material = this._materials[key];

                if (material.uniforms["specularProbeColor"]) {
                    var boost = material._specularProbeBoost;
                    var specProbeColor = material.uniforms["specularProbeColor"].value;

                    var colorLin = color.clone();
                    colorLin.copyGammaToLinear(colorLin);
                    specProbeColor.r = colorLin.r * boost;
                    specProbeColor.g = colorLin.g * boost;
                    specProbeColor.b = colorLin.b * boost;
                }

                if (material.uniforms["fogColor"]) {
                    var fogColor = material.uniforms["fogColor"].value = colorLin;
                }

                this._ambientLight.color = color;
            }
        }
    }
};
OrbitController = function(target, lookAtTarget,container)
{
    this._coords = new THREE.Vector3(0, Math.PI * .4, 1.0);   // azimuth, polar, radius
    this._localAcceleration = new THREE.Vector3(0.0, 0.0, 0.0);
    this._localVelocity = new THREE.Vector3(0.0, 0.0, 0.0);
    this._document = container;
    this.zoomSpeed = 1.0;
    this.maxRadius = 10.0;
    this.minRadius = 2.0;
    this.maxPolar = Math.PI - .1;
    this.minPolar = 0.1;
    this.maxAzimuth = undefined;
    this.minAzimuth = undefined;
    this.minY = undefined;
    this.dampen = .9;
    this._lookAtTarget = lookAtTarget || new THREE.Vector3(0.0, 0.0, 0.0);
    this._oldMouseX = undefined;
    this._oldMouseY = undefined;
    this._isDown = false;
    this._startPitchDistance = undefined;
    this._startZoom = 0;
    this._target = target;
    this._target.matrixAutoUpdate = false;
    this._onMouseWheel = null;
    this._onMouseMove = null;
    this._init();
};

OrbitController.prototype =
{
    get radius()
    {
        return this._coords.z;
    },
    set radius(value)
    {
        this._coords.z = value;
    },

    get azimuth()
    {
        return this._coords.x;
    },
    set azimuth(value)
    {
        this._coords.x = value;
    },

    get polar()
    {
        return this._coords.y;
    },
    set polar(value)
    {
        this._coords.y = value;
    },

    _init: function ()
    {

        var self = this;

        this._onMouseWheel = function (event)
        {
            self.setZoomImpulse(-event.wheelDelta * self.zoomSpeed * .0001);
        };

        this._onMouseMove = function (event)
        {
            if (!self._isDown) return;
            self._updateMove(event.screenX, event.screenY)
        };

        this._onMouseDown = function (event)
        {
            self._oldMouseX = undefined;
            self._oldMouseY = undefined;

            self._isDown = true;
        };

        this._onTouchDown = function (event)
        {
            self._oldMouseX = undefined;
            self._oldMouseY = undefined;

            if (event.touches.length === 2) {
                var touch1 = event.touches[0];
                var touch2 = event.touches[1];
                var dx = touch1.screenX - touch2.screenX;
                var dy = touch1.screenY - touch2.screenY;
                self._startPitchDistance = Math.sqrt(dx*dx + dy*dy);
                self._startZoom = self.radius;
            }

            self._isDown = true;
        };

        this._onTouchMove = function (event)
        {
            event.preventDefault();

            if (!self._isDown) return;

            var numTouches = event.touches.length;

            if (numTouches === 1) {
                var touch = event.touches[0];
                self._updateMove(touch.screenX, touch.screenY);
            }
            else if (numTouches === 2) {
                var touch1 = event.touches[0];
                var touch2 = event.touches[1];
                var dx = touch1.screenX - touch2.screenX;
                var dy = touch1.screenY - touch2.screenY;
                var dist = Math.sqrt(dx*dx + dy*dy);
                var diff = self._startPitchDistance - dist;
                self.radius = self._startZoom + diff * .01;
            }
        };

        this._onUp = function(event) { self._isDown = false; };
        
        this._document.addEventListener("mousewheel", this._onMouseWheel);
        this._document.addEventListener("mousemove", this._onMouseMove);
        this._document.addEventListener("touchmove", this._onTouchMove);
        this._document.addEventListener("mousedown", this._onMouseDown);
        this._document.addEventListener("touchstart", this._onTouchDown);
        this._document.addEventListener("mouseup", this._onUp);
        this._document.addEventListener("touchend", this._onUp);
    },

    _updateMove: function(x, y)
    {
        if (this._oldMouseX !== undefined) {
            var dx = x - this._oldMouseX;
            var dy = y - this._oldMouseY;
            this.setAzimuthImpulse(dx * .0015);
            this.setPolarImpulse(-dy * .0015);
        }
        this._oldMouseX = x;
        this._oldMouseY = y;
    },

    update: function ()
    {
        this._localVelocity.x *= this.dampen;
        this._localVelocity.y *= this.dampen;
        this._localVelocity.z *= this.dampen;
        this._localVelocity.x += this._localAcceleration.x;
        this._localVelocity.y += this._localAcceleration.y;
        this._localVelocity.z += this._localAcceleration.z;
        this._localAcceleration.x = 0.0;
        this._localAcceleration.y = 0.0;
        this._localAcceleration.z = 0.0;

        this._coords.add(this._localVelocity);
        this._coords.y = THREE.Math.clamp(this._coords.y, this.minPolar, this.maxPolar);
        this._coords.z = THREE.Math.clamp(this._coords.z, this.minRadius, this.maxRadius);

        if (this.maxAzimuth !== undefined && this.minAzimuth !== undefined)
            this._coords.x = THREE.Math.clamp(this._coords.x, this.minAzimuth, this.maxAzimuth);

        var matrix = this._target.matrix;
        var pos = this._fromSphericalCoordinates(this._coords.z, this._coords.x, this._coords.y);
        pos.add(this._lookAtTarget);
        if (this.minY !== undefined && pos.y < this.minY) pos.y = this.minY;
        matrix.lookAt(pos, this._lookAtTarget, new THREE.Vector3(0, 1, 0));
        matrix.setPosition(pos);

        this._target.matrixWorldNeedsUpdate = true;
    },

    _fromSphericalCoordinates: function(radius, azimuthalAngle, polarAngle)
    {
        var v = new THREE.Vector3();
        v.x = radius*Math.sin(polarAngle)*Math.cos(azimuthalAngle);
        v.y = radius*Math.cos(polarAngle);
        v.z = radius*Math.sin(polarAngle)*Math.sin(azimuthalAngle);
        return v;
    },

// ratio is "how far the controller is pushed", from -1 to 1
    setAzimuthImpulse: function (value)
    {
        this._localAcceleration.x = value;
    },

    setPolarImpulse: function (value)
    {
        this._localAcceleration.y = value;
    },

    setZoomImpulse: function (value)
    {
        this._localAcceleration.z = value;
    }
};
function RotateController(targets)
{
    this._targets = targets;
    this._alignTargets(targets);
    this._rotationData = this._gerateRotations(targets.length, .0012, .0020);
    this._rotations = [];
    for (var i = 0; i < targets.length; ++i)
        this._rotations[i] = 0;
}

RotateController.prototype =
{
    update: function(dt)
    {
        var quat = new THREE.Quaternion();
        var len = this._targets.length;
        for (var i = 0; i < len; ++i) {
            var rot = this._rotationData[i];
            this._rotations[i] += rot.speed * dt;
            quat.setFromAxisAngle(rot.axis, this._rotations[i]);
            this._targets[i].rotation.setFromQuaternion(quat);
        }
    },

    // just make sure these objects have a local origin at their centres
    _alignTargets: function(targets)
    {
        var bbox = new THREE.Box3();
        for (var i = 0; i < targets.length; ++i) {
            var obj = targets[i];
            bbox.setFromObject(obj);
            var center = bbox.center();
            obj.position.copy(center);
            center.negate();
            obj.geometry.translate(center.x, center.y, center.z);
        }
    },

    _gerateRotations: function(len, normalSpeed, deviance)
    {
        var arr = [];
        var axis = new THREE.Vector3();
        for (var i = 0; i < len; ++i) {
            var speed = normalSpeed + (Math.random() - .5) * deviance;
            axis.x = Math.random() - .5;
            axis.y = Math.random() - .5;
            axis.z = Math.random() - .5;
            axis.normalize();

            arr[i] = {
                speed: speed,
                axis: axis
            };
        }
        return arr;
    }
};
TrackController = function(data, target)
{
    this.onStopped = new Signal();
    this.onStarted = new Signal();

    this._points = data.points;
    this._currentIndex = 0;
    this._scale = new THREE.Vector3(1, 1, 1);
    this._target = target;
    this._target.matrixAutoUpdate = false;
    this._target.matrix.compose(this._points[0].position, this._points[0].orientation, this._scale);
    this._stopIndex = 0;
    this._position = new THREE.Vector3();
    this._orientation = new THREE.Quaternion();
    this._mouseRotation = new THREE.Quaternion();
    this._targetMouseRotation = new THREE.Quaternion();
    this.tweenTime = 5.0;
    this._riding = false;
    this._onMouseMove = null;
    this._maxMouseRotation = .15;
    this._maxGyrotation = .3;
    this._mouseSmoothing = .91;
    this._tween = null;

    if (isPlatformMobile()) {
        this._deviceOrientationDummy = new THREE.Object3D();
        this._deviceOrientationControls = new THREE.DeviceOrientationControls(this._deviceOrientationDummy);
        this._deviceOrientation = new THREE.Quaternion();
        this._neutralRotationX = 0;
        this._neutralRotationY = 0;
    }
};

TrackController.prototype =
{
    startInteraction: function()
    {
        var self = this;
        this._onMouseMove = function (event)
        {
            self._updateMove(event.clientX, event.clientY)
        };

        document.body.addEventListener("mousemove", this._onMouseMove);

        if (this._deviceOrientationControls) {
            this._deviceOrientationControls.update();

            var euler = new THREE.Euler(0, 0, 0, "YXZ");
            euler.setFromQuaternion(this._deviceOrientationDummy.quaternion);
            this._neutralRotationX = euler.x;
            this._neutralRotationY = euler.y;
        }
    },

    stopInteraction: function()
    {
        document.body.removeEventListener("mousemove", this._onMouseMove);
    },

    rideUntilNextStop: function()
    {
        if (this._riding) return;
        this._riding = true;

        for (var i = 1; i <= this._points.length; ++i) {
            var p = this._getNextPoint(i);
            if (p.isStop) {
                this._stopIndex = (this._currentIndex + i) % this._points.length;
                break;
            }
        }

        this.onStarted.dispatch(p.stopIndex);

        var target = this._stopIndex > this._currentIndex? this._stopIndex : this._stopIndex + this._points.length;
        var self = this;

        if (this._tween)
            this._tween.kill();

        this._tween = TweenLite.to(this, this.tweenTime,
            {
                ease: Power1.easeInOut,
                _currentIndex: target,
                onComplete: function()
                {
                    self._currentIndex = self._currentIndex % self._points.length;
                    self._stopAtStop();
                    this._tween = null;
                }
            }
        );
    },

    update: function(dt)
    {
        var p1 = this._currentPoint;
        var p2 = this._getNextPoint(1);
        var ratio = this._currentIndex - Math.floor(this._currentIndex);

        if (this._deviceOrientationControls) {
            this._deviceOrientationControls.update();
        }

        this._mouseRotation.slerp(this._targetMouseRotation, 1.0 - this._mouseSmoothing);
        this._position.lerpVectors(p1.position, p2.position, ratio);

        this._orientation.copy(p1.orientation);
        this._orientation.slerp(p2.orientation, ratio);
        this._orientation.multiply(this._mouseRotation);

        if (this._deviceOrientationControls && this._deviceOrientationControls.hasOrientation) {
            var euler = new THREE.Euler(0, 0, 0, "YXZ");
            euler.setFromQuaternion(this._deviceOrientationDummy.quaternion);
            euler.x = THREE.Math.clamp((euler.x - this._neutralRotationX) * .5, -this._maxGyrotation, this._maxGyrotation);
            euler.y = THREE.Math.clamp((euler.y - this._neutralRotationY) * .5, -this._maxGyrotation, this._maxGyrotation);
            this._deviceOrientationDummy.quaternion.setFromEuler(euler);
            this._deviceOrientation.slerp(this._deviceOrientationDummy.quaternion, .2);
            this._orientation.multiply(this._deviceOrientation);
        }

        this._target.matrix.compose(this._position, this._orientation, this._scale);
    },

    jumpBack: function()
    {
        if (this._tween) {
            this._tween.kill();
            this._tween = null;
        }
        var i = Math.floor(this._currentIndex - 1);
        while (i != this._currentIndex) {
            var p = this._points[i];
            if (p.isStop) {
                this._stopIndex = i;
                break;
            }
            if (--i < 0) i = this._points.length - 1;
        }

        this._stopAtStop();
    },

    _getNextIndex: function(howMnyy)
    {
        if (!howMnyy) howMnyy = 1;
        var index2 = (Math.floor(this._currentIndex) + howMnyy) % this._points.length;
        return index2;
    },

    _stopAtStop: function()
    {
        this._currentIndex = this._stopIndex;
        var p = this._currentPoint;
        this.update(0);
        this._riding = false;
        this.onStopped.dispatch(p.stopIndex);
    },

    get _currentPoint() { return this._points[Math.floor(this._currentIndex) % this._points.length]; },
    _getNextPoint: function(howMnyy) { return this._points[this._getNextIndex(howMnyy)]; },

    _updateMove: function(x, y)
    {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var m = Math.max(w, h);
        x = ((x - w * .5) / m) * 2.0 * this._maxMouseRotation;
        y = ((y - h * .5) / m) * 2.0 * this._maxMouseRotation;
        this._taitBryan(y, -x, 0, this._targetMouseRotation);
    },

    _taitBryan: function (pitch, yaw, roll, target)
    {
        var mat = new THREE.Matrix4();
        var cosP = Math.cos(-pitch);
        var cosY = Math.cos(-yaw);
        var cosR = Math.cos(roll);
        var sinP = Math.sin(-pitch);
        var sinY = Math.sin(-yaw);
        var sinR = Math.sin(roll);

        var zAxisX = -sinY * cosP;
        var zAxisY = -sinP;
        var zAxisZ = cosY * cosP;

        var yAxisX = -cosY * sinR - sinY * sinP * cosR;
        var yAxisY = cosP * cosR;
        var yAxisZ = -sinY * sinR + sinP * cosR * cosY;

        var xAxisX = yAxisY * zAxisZ - yAxisZ * zAxisY;
        var xAxisY = yAxisZ * zAxisX - yAxisX * zAxisZ;
        var xAxisZ = yAxisX * zAxisY - yAxisY * zAxisX;

        var m = mat.elements;
        m[0] = xAxisX;
        m[1] = xAxisY;
        m[2] = xAxisZ;
        m[3] = 0;
        m[4] = yAxisX;
        m[5] = yAxisY;
        m[6] = yAxisZ;
        m[7] = 0;
        m[8] = zAxisX;
        m[9] = zAxisY;
        m[10] = zAxisZ;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;

        target.setFromRotationMatrix(mat);
    }
};
// aim for 15 fps, since the test is heavier than the actual app?
var PERFORMANCE_TIME_OUT = 4000;
var ASSET_PATH = "/self-test/assets/";
var highPerformance;
var mainProject = new SimpleThreeProject();

var tunnelFlat = new TunnelNormal();
var isLocalDebug = false;
var globalScale = 0.03;

var assetLibrary;

isLocalDebug = window.location.hostname.indexOf("dasprinzip.com") >= 0 || window.location.hostname.indexOf("prinzipiell.com") >= 0 || window.location.hostname.indexOf("localhost") >= 0 || window.location.toString().indexOf("file://") >= 0 || window.location.toString().indexOf("192.168.1.62") >= 0;

loadwebgl = function()
{
    if (isLocalDebug) ASSET_PATH = "self-test/assets/";
    tunnelFlat.flat = true;

    highPerformance = !isPlatformMobile() && !QueryString.lowPerformance;

    // need to do this before initializing project
    assetLibrary = new AssetLibrary();
    assetLibrary.queueAsset("locatorRotations", ASSET_PATH + "data/camRotationEuler.txt", AssetLibrary.Type.PLAIN_TEXT);
    assetLibrary.queueAsset("locatorPositions", ASSET_PATH + "data/locatorPositions.txt", AssetLibrary.Type.PLAIN_TEXT);
    assetLibrary.queueAsset("stopPositions", ASSET_PATH + "data/stopPositions.txt", AssetLibrary.Type.PLAIN_TEXT);
    assetLibrary.queueAsset("track-model", ASSET_PATH + "model/track_complete.obj", AssetLibrary.Type.MODEL, THREE.OBJLoader);
    assetLibrary.queueAsset("microbe01", ASSET_PATH + "model/microbe01.obj", AssetLibrary.Type.MODEL, THREE.OBJLoader);
    assetLibrary.queueAsset("microbe02", ASSET_PATH + "model/microbe02.obj", AssetLibrary.Type.MODEL, THREE.OBJLoader);
    assetLibrary.queueAsset("stop-circle-texture", ASSET_PATH + "textures/normal/kreis.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("globe-model", ASSET_PATH + "model/globe.obj", AssetLibrary.Type.MODEL, THREE.OBJLoader);
    assetLibrary.queueAsset("track-diffuse-texture-1", ASSET_PATH + "textures/normal/StringPatternBlueBG.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("track-diffuse-texture-2", ASSET_PATH + "textures/normal/StringPatternGreenBG.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("track-diffuse-texture-3", ASSET_PATH + "textures/normal/StringPatternPinkBG.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("track-diffuse-texture-4", ASSET_PATH + "textures/normal/StringPatternYellowBG.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("tunnel-texture", ASSET_PATH + "textures/normal/TunnelPattern2.png", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("globe-diffuse-texture", ASSET_PATH + "textures/normal/globe_tex.jpg", AssetLibrary.Type.TEXTURE_2D);
    assetLibrary.queueAsset("irradiance-map", ASSET_PATH + "textures/envmap/irradiance/", AssetLibrary.Type.TEXTURE_CUBE);
    assetLibrary.queueAsset("specular-map", ASSET_PATH + "textures/envmap/specular-02325/", AssetLibrary.Type.TEXTURE_CUBE);
    assetLibrary.queueAsset("skybox", ASSET_PATH + "textures/envmap/sky/", AssetLibrary.Type.TEXTURE_CUBE);

    assetLibrary.onComplete.bind(onAssetsLoaded);
    assetLibrary.onProgress.bind(onAssetsProgress);
    assetLibrary.load();
};

if( isLocalDebug ) loadwebgl();

function onAssetsProgress(ratio)
{
    try {
        application.webglProgress(ratio);
    }
    catch(err) {}
}

function onAssetsLoaded(assetLibrary)
{
    mainProject.init(true, assetLibrary);
    // all a bit icky
    mainProject.content = tunnelFlat;
    tunnelFlat.doPerformanceTest(onPerformanceTestComplete);
}

function onPerformanceTestComplete(time)
{
    var adequate = time < PERFORMANCE_TIME_OUT;

    console.log("Performance test " + (adequate? "succeeded" : "failed"));

    try {
        application.webglPerformanceResult(adequate);
    }
    catch(err) {}

    if (adequate)
        _startProject();
}

function _startProject()
{
    try {
        application.webglInitComplete();
    }
    catch(err) {}

    mainProject.start();
}

function playTrack()
{
    mainProject.content.playTrack();
}

function toggleFFWD(value)
{
    mainProject.timeScale = value? 3 : 1;
}

function jumpBack()
{
    mainProject.content.jumpBack();
}