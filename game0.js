var scene, renderer;
	var camera, avatarCam, edgeCam;
	var avatar;
	var cone;
	var npc;
	var blackbox;
	var bomb;
	var clock;
	var startScene, startText, endScene, endCamera, endText, endSceneL, endCameraL, endTextL;



	var controls =
	{fwd:false, bwd:false, left:false, right:false,
			speed:20, fly:false, reset:false,
			camera:camera, blackbox:false }


	var gameState =
	{health:10, scene:'start', camera:'none' }


	init();
	initControls();
	animate();



	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}

	function createEndSceneL(){
		endSceneL = initScene();
		endTextL = createSkyBox('youlose.png',10);
		//endText.rotateX(Math.PI);
		endSceneL.add(endTextL);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endSceneL.add(light1);
		endCameraL = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCameraL.position.set(0,50,1);
		endCameraL.lookAt(0,0,0);

	}


	function createStartScene(){
		startScene = initScene();
		startText = createSkyBox('start.jpg',10);
		startScene.add(startText);
		var light2 = createPointLight();
		light2.position.set(0,200,20);
		startScene.add(light2);
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);

	}

	function init(){
		initPhysijs();
		scene = initScene();
		createEndScene();
		createEndSceneL();
		initRenderer();
		createMainScene();
		createStartScene();
	}


	function createMainScene(){
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		scene.add(light1);
		var light0 = new THREE.AmbientLight( 0xffffff,0.25);
		scene.add(light0);

		//main camera
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,50,0);
		camera.lookAt(0,0,0);

		bomb = createBall1();
		bomb.position.set(50,30,50);
		scene.add(bomb);

		bomb.addEventListener('collision',function(other_object){
			if (other_object==avatar){
				gameState.scene='youlose';
			}
		})

		var ground = createGround('grass.png');
		scene.add(ground);

		// the avatar
		avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
		var loader = new THREE.JSONLoader();
		loader.load("../models/suzanne.json",
				function ( geometry, materials ) {
			var texture = new THREE.TextureLoader().load( '../images/cement.jpg' );
			var material = new THREE.MeshLambertMaterial( { color: 0x00FA9A, material: texture, side:THREE.DoubleSide} );
			var pmaterial = new Physijs.createMaterial(material,0.9,2);
			avatar = new Physijs.BoxMesh( geometry, pmaterial );
			avatar.setDamping(0.1,0.1);
			avatar.castShadow = true;
			avatar.scale.x = 5;
			avatar.scale.y = 5;
			avatar.scale.z = 5;

			avatarCam.position.set(0,5,0);
			avatarCam.lookAt(0,4,10);
			avatar.add(avatarCam);

			avatar.position.y = 20;
			avatarCam.translateY(-4);
			avatarCam.translateZ(3);
			scene.add(avatar);
		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
			function(err){console.log("error in loading: "+err);}
		)
		gameState.camera = avatarCam;
		edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
		edgeCam.position.set(20,20,10);


		addBalls();


		blackbox = createBoxMesh(0x0000ff, 10,2,10);
		blackbox.position.set(0,60,30);
		scene.add(blackbox);

		npc = createBoxMesh2(0x0000ff,1,2,4);
		npc.position.set(30,5,-30);
		scene.add(npc);
		npc.addEventListener('collision',function(other_object){
			if (other_object==avatar){
				gameState.health --;
				if (gameState.health==0){
					gameState.scene='youlose';
				}
				npc.__dirtyPosition = true;
				npc.position.set(randN(20)+15,30,randN(20)+15);
			}
		})

		npc2 = createConeMesh(0xff0000);
		npc2.position.set(-100,5,-20);
		scene.add(npc2);
		npc2.addEventListener('collision',function(other_object){
			if (other_object==avatar){
				gameState.health -= 2;
				npc2.__dirtyPosition = true;
				npc2.position.set(randN(30)+15,10,randN(30)+15);
			}
			if(gameState.health==0){
				gameState.scene='youlose';
			}
		})

		winnerBox = createBoxMesh2(0xffe000,20,20,20);
		winnerBox.position.set(0,500,0);
		scene.add(winnerBox);


		winnerBoxx = createBoxMesh2(0xffe000,20,.01,20);
		winnerBoxx.position.set(0,510,0);
		scene.add(winnerBoxx);
		winnerBoxx.addEventListener('collision',function(other_object){
			if (other_object==avatar){
					gameState.scene='youwon';
			}
		})



		var sphere1 =createBall();
		sphere1.position.set(100,200,100);
		sphere1.scale.x = 10;
		sphere1.scale.y = 10;
		sphere1.scale.z = 10;
		scene.add(sphere1);

		var sphere2 =createBall();
		sphere2.position.set(40,200,-40);
		sphere2.scale.x = 10;
		sphere2.scale.y = 10;
		sphere2.scale.z = 10;
		scene.add(sphere2);

		var sphere3 =createBall();
		sphere3.position.set(70,300,-70);
		sphere3.scale.x = 10;
		sphere3.scale.y = 10;
		sphere3.scale.z = 10;
		scene.add(sphere3);

		var sphere4 =createBall();
		sphere4.position.set(10,400,-10);
		sphere4.scale.x = 10;
		sphere4.scale.y = 10;
		sphere4.scale.z = 10;
		scene.add(sphere4);

		var sphere5 =createBall2();
		sphere5.position.set(10,150,-30);
		sphere5.scale.x = 8;
		sphere5.scale.y = 8;
		sphere5.scale.z = 8;
		scene.add(sphere5);

		var sphere6 =createBall2();
		sphere6.position.set(30,100,-20);
		sphere6.scale.x = 8;
		sphere6.scale.y = 8;
		sphere6.scale.z = 8;
		scene.add(sphere6);

		var sphere7 =createBall3();
		sphere7.position.set(13,72,18);
		sphere7.scale.x = 12;
		sphere7.scale.y = 12;
		sphere7.scale.z = 12;
		scene.add(sphere7);

		var sphere8 =createBall3();
		sphere8.position.set(58,167,78);
		sphere8.scale.x = 8;
		sphere8.scale.y = 8;
		sphere8.scale.z = 8;
		scene.add(sphere8);

		var sphere9 =createBall3();
		sphere9.position.set(282,245,-78);
		sphere9.scale.x = 8;
		sphere9.scale.y = 8;
		sphere9.scale.z = 8;
		scene.add(sphere9);

		var sphere10 =createBall3();
		sphere10.position.set(-99,57,88);
		sphere10.scale.x = 8;
		sphere10.scale.y = 8;
		sphere10.scale.z = 8;
		scene.add(sphere10);

		var cylinder1 = createCylinder(0xffcccc);
		cylinder1.position.set(-38,77,99);
		scene.add(cylinder1);

		var cylinder2 = createCylinder(0xffcccc);
		cylinder2.position.set(-18,177,199);
		scene.add(cylinder2);

		var cylinder3 = createCylinder(0xffcccc);
		cylinder3.position.set(-200,89,156);
		scene.add(cylinder3);

		var cylinder4 = createCylinder(0xffe5cc);
		cylinder4.position.set(284,203,-23);
		scene.add(cylinder4);

		var cylinder5 = createCylinder(0xffe5cc);
		cylinder5.position.set(5,333,-73);
		scene.add(cylinder5);

		var cylinder6 = createCylinder(0xffe5cc);
		cylinder6.position.set(37,423,189);
		scene.add(cylinder6);

		var cylinder7 = createCylinder(0xe5ffcc);
		cylinder7.position.set(-134,302,58);
		scene.add(cylinder7);

		var cylinder8 = createCylinder(0xe5ffcc);
		cylinder8.position.set(206,111,-32);
		scene.add(cylinder8);

		var cylinder9 = createCylinder(0xe5ffcc);
		cylinder9.position.set(-296,387,-121);
		scene.add(cylinder9);

		var cylinder10 = createCylinder(0xffffcc);
		cylinder10.position.set(10,356,135);
		scene.add(cylinder10);

		var cylinder11 = createCylinder(0xffffcc);
		cylinder11.position.set(80,256,178);
		scene.add(cylinder11);

		var cylinder12 = createCylinder(0xffffcc);
		cylinder12.position.set(-40,178,-135);
		scene.add(cylinder12);



	}

	function createBall1(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 4,20,20);
		var material = new THREE.MeshLambertMaterial( { color: 0xff0000} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95,);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	function randN(n){
		return Math.random()*n;
	}

	function addBalls(){
		var numBalls = 500;
			for (var i = 0; i < numBalls; i++) {
			var ball = createBoxMesh();

			ball.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
			ball.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
			ball.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

				scene.add(ball);
	}
	}



	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	 */
	function initScene(){
		var scene = new Physijs.Scene();
		return scene;
	}


	function initPhysijs(){
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}


	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}



	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry(20,20,20);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material,0 );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createConeMesh(){
		var geometry = new THREE.ConeGeometry(5,20,32);
		geometry.rotateX(Math.PI/2);
		// it better to rotate the geometry before making a Mesh
		// because it doesn't mess up our notion of the local x,y,z axes
		// doing it this way, (0,0,1) is the direction of the pointy end of the coneAvatar

		var material = new THREE.MeshLambertMaterial({color: 0xff0000});
		var pmaterial = new Physijs.createMaterial(material, 0.9, 0.5);
		var mesh = new Physijs.BoxMesh(geometry, pmaterial);
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		mesh.position.set(-10,20,-10);
		return mesh;
	}



	function createSphere(){
		var geometry = new THREE.SphereGeometry( 3, 16, 16);
		var material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);

		var mesh = new Physijs.SphereMesh( geometry, pmaterial, 5 );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		mesh.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
			if (other_object==avatar){
				console.log("avatar hit the sphere");
				gameState.health = gameState.health + 1;
			}
		}
		)
		return mesh
	}

	function createBoxMesh2(color,w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
		mesh.castShadow = true;
		return mesh;
	}



	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry(2000, 2000, 2000 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );
		mesh.receiveShadow = true;
		mesh.rotateX(Math.PI/2);
		return mesh
	}


	function createSkyBox(image,k){
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material, 0 );
		mesh.receiveShadow = false;
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}


	function createAvatar(){
		var geometry = new THREE.BoxGeometry( 5, 5, 6);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		avatarCam.position.set(0,4,0);
		avatarCam.lookAt(0,4,10);
		mesh.add(avatarCam);
		return mesh;
	}


	function createBall(){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffccff} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial,0 );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createBall2(){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xccccff} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial,0 );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createBall3(){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xccffcc} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial,0 );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	function createCylinder(c){
		var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    var material = new THREE.MeshBasicMaterial( {color: c} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial,0 );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	function initControls(){
		// here is where we create the eventListeners to respond to operations
		//create a clock for the time-based animation ...
		clock = new THREE.Clock();
		clock.start();
		window.addEventListener( 'keydown', keydown);
		window.addEventListener( 'keyup',   keyup );
	}

	function keydown(event){
		var velocity = avatar.getLinearVelocity();
		var yVelocity = velocity.y;
		console.dir(event);
		console.log("Keydown: '"+event.key+"'");
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			return;
		}
		if (gameState.scene == 'youlose' && event.key=='r') {
			gameState.scene = 'main';
			return;
		}

		// this is the regular scene
		switch (event.key){
		// change the way the is moving
		case "w": controls.fwd = true;  break;
		case "s": controls.bwd = true; break;
		case "a": controls.left = true; break;
		case "d": controls.right = true; break;
		case "r": controls.up = true; break;
		case "f": controls.down = true; break;
		case " ": controls.fly = (Math.abs(yVelocity)<0.1);
		console.log("space!!"); break;
		case "h": controls.reset = true; break;
		case "q": avatarCam.rotateY(.2); break;
		case "e": avatarCam.rotateY(-.2); break;
		case "k": controls.blackbox = true; break;

		// switch cameras
		case "1": gameState.camera = camera; break;
		case "2": gameState.camera = avatarCam; break;
		case "3": gameState.camera = edgeCam; break;

		// move the camera around, relative to the avatar
		case "ArrowLeft": avatarCam.translateY(1);break;
		case "ArrowRight": avatarCam.translateY(-1);break;
		case "ArrowUp": avatarCam.translateZ(-1);break;
		case "ArrowDown": avatarCam.translateZ(1);break;
		case "t":
			controls.fwd=true;
			var xzVelocity = avatar.getAngularVelocity();
			avatar.rotation.x=avatar.rotation.z=0;
			avatar.__dirtyRotation=true;
			avatar.setAngularVelocity(xzVelocity);
			//avatar.rotation.set(0,0,0);
			avatar.__dirtyRotation = true;break;
		case "p": gameState.scene = "main";break;

		}

	}

	function keyup(event){
		switch (event.key){
		case "w": controls.fwd   = false;  break;
		case "s": controls.bwd   = false; break;
		case "a": controls.left  = false; break;
		case "d": controls.right = false; break;
		case "r": controls.up    = false; break;
		case "f": controls.down  = false; break;
		case " ": controls.fly = false; break;
		case "h": controls.reset = false; break;
		case "k": controls.blackbox = false; break;
		case "t": controls.fwd	= false;break;
		}
	}

	function updateNPC(){
		npc.lookAt(avatar.position);
		npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(-0.5));

		npc2.lookAt(avatar.position);
		npc2.__dirtyPosition = true;
		if(avatar.position.distanceTo(npc2.position)<500){
			npc2.setLinearVelocity(npc2.getWorldDirection().multiplyScalar(5));
		}
	}


	function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"
		var forward = avatar.getWorldDirection();
		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
			//avatar.setLinearVelocity(new THREE.Vector3(0,0,controls.speed*1));
			avatar.setAngularVelocity(new THREE.Vector3(0,0,0));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
			//avatar.setLinearVelocity(new THREE.Vector3(0,0,-controls.speed*1));
			avatar.setAngularVelocity(new THREE.Vector3(0,0,0));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}
		if (controls.fly){
			avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed*2,0));
			avatar.setAngularVelocity(new THREE.Vector3(0,0,0));
		}
		if (controls.left){
		  avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.05,0));
			//avatar.setLinearVelocity(new THREE.Vector3(controls.speed*1,0,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.05,0));
			//avatar.setLinearVelocity(new THREE.Vector3(-controls.speed*1,0,0));
		}
		if (controls.reset){
			avatar.__dirtyPosition = true;
			avatar.position.set(40,10,40);
		}
		if (controls.blackbox) {
			avatar.__dirtyPosition = true;
			avatar.position.set(0,30,30);
		}
	}



	function animate() {
		requestAnimationFrame( animate );
		var delta = clock.getDelta();
		camera.translateZ(controls.zSpeed*delta*10);
		camera.translateY(controls.ySpeed*delta*10);
		camera.translateX(controls.xSpeed*delta*10);

		switch(gameState.scene) {
		case "youwon":
			//endText.rotateY(0.005);
			renderer.render( endScene, endCamera );
			break;
		case "youlose":
			//endText.rotateY(0.005);
			renderer.render( endSceneL, endCameraL );
			break;
		case "main":
			updateAvatar();
			updateNPC();
			edgeCam.lookAt(avatar.position);
			scene.simulate();
			if (gameState.camera!= 'none'){
				renderer.render( scene, gameState.camera );
			}
			break;
		case "start":
			renderer.render( startScene, startCamera);
			break;
		default:
			console.log("don't know the scene "+gameState.scene);
		}

		//draw heads up display ..
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Health: '+gameState.health+ '</div>';

	}
