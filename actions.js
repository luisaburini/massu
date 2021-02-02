const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 1 );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far);
camera.position.z = 5;
const light = new THREE.HemisphereLight( 0xfffffb, 0x080820, 2.5 );
/*var light = new THREE.DirectionalLight( 0xfdffd9 );
light.position.set( 0, 10, 10 ).normalize();*/
/*const spotLight = new THREE.SpotLight( 0xfdffd9 );
spotLight.position.set( 100, 100, 200 );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );*/
scene.add(light);


//const colorPallete = [0x451d15, 0x6c4325, 0x652317, 0x451d15, 0x1f391d, 0xd0a875, 0xb08149, 0x2f182c, 0x6c4325, 0x652317 ];
const colorPallete = [ 0x5f8a33, 0xdb9900, 0x4600e0, 0xff009f ];

const callbacks = [cube1Callback, cube2Callback, cube3Callback];
var callbackI = 0;

generatePenetraveis();

function generatePenetraveis()
{
	var i=0;
	var colorPalleteI = 0;
	const n = 50;
	for(i=0; i<n;i++)
	{
		const cubeSize = Math.random()*2;
		const cubeConst = Math.random()*3;
		const cubeGeo = new THREE.BoxBufferGeometry(cubeSize*cubeSize, cubeSize*cubeConst, cubeSize/10);

		if(colorPalleteI >= colorPallete.length-1)
		{
			colorPalleteI = 0;
		}
		else
		{
			colorPalleteI++;
		}
		console.log("colorPallete[colorPalleteI] " + colorPallete[colorPalleteI] + " colorPallete.length " + colorPallete.length);
		const cubeMat = new THREE.MeshPhongMaterial({color: colorPallete[colorPalleteI],
		    polygonOffset: true,
		    polygonOffsetFactor: 1, // positive value pushes polygon further away
    		polygonOffsetUnits: 1});		
		//const cubeMat = new THREE.MeshLambertMaterial({color: 0x6c4325});
		const mesh = new THREE.Mesh(cubeGeo, cubeMat);
		const xOffset = Math.random()*20 - 10;
		const yConst = Math.random()*3;
		const zOffset = Math.random()*10;
		mesh.position.set(cubeSize - xOffset, cubeSize - yConst, zOffset);
		mesh.callback = callbacks[callbackI];
		if(callbackI >= callbacks.length -1)
		{
			callbackI = 0;
		}
		else
		{
			callbackI++;
		}
		scene.add(mesh);
		
		// wireframe
		var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
		var mat = new THREE.LineBasicMaterial( {
						color: 0xffffff,
						linewidth: 0.1,
						linecap: 'round', //ignored by WebGLRenderer
						linejoin:  'round' //ignored by WebGLRenderer
					} );
		var wireframe = new THREE.LineSegments( geo, mat );
		mesh.add( wireframe );
	}
}



var cursorTextElem = document.getElementById("cursorText");
var pageItems = ["PORTFÓLIO", "LOJA", "QUEM SOU"];

function cube1Callback()
{
	console.log("Clicked cube1!");
	updateCursorText(0);
}


function cube2Callback()
{
	console.log("Clicked cube2!");
	updateCursorText(1);
}

function cube3Callback()
{
	console.log("Clicked cube2!");
	updateCursorText(2);
}

function updateCursorText(index)
{
	cursorTextElem.innerHTML = pageItems[index];
  cursorTextElem.style.top = event.pageY + "px";
  cursorTextElem.style.left = event.pageX + "px";
}



function animate() 
{
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
}


animate();


var isUserInteracting =  false;
var isMouseDown = false;
var downPointer;
var downPointerLat = 0;
var downPointerLon = 0;
var dragFactor = 0.5;
var radius = 10;
var lat;
var long;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onDocumentMouseMove( event ) 
{
    event.preventDefault();

    if ( isUserInteracting ) 
    {
	  
        lon = (downPointer.x - event.clientX) * dragFactor + downPointerLon;
        //console.log("lon " + lon);
				lat = (event.clientY - downPointer.y) * dragFactor + downPointerLat;
				lat = Math.max(-85, Math.min(85, lat));
				//console.log("lat " + lat);

				const phi = THREE.Math.degToRad(90 - lat);
				const theta = THREE.Math.degToRad(lon);
				//console.log("phi " + phi);
				//console.log("theta " + theta);
				var x = (radius * Math.sin(phi) * Math.cos(theta)) ;
				var y = radius * Math.cos(phi) ;
				var z = (radius * Math.sin(phi) * Math.sin(theta));
				//console.log("radius * Math.sin(phi) * Math.cos(theta) " + x);
				//console.log("radius * Math.cos(phi) " + y);
				//console.log("radius * Math.sin(phi) * Math.sin(theta) " + z);
        camera.lookAt(x, y, z);
        animate();
    }
    
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( scene.children ); 

		if ( intersects.length > 0 ) 
		{
		    intersects[0].object.callback();
		}
		else
		{
			cursorTextElem.innerHTML = "";
		}
  
}

/**
 * converts a XYZ THREE.Vector3 to longitude latitude. beware, the vector3 will be normalized!
 * @param vector3 
 * @returns an array containing the longitude [0] & the lattitude [1] of the Vector3
 */
function vector3toLonLat( vector )
{
		const vector3 = new THREE.Vector3(vector.x, vector.y, vector.z);
    vector3.normalize();

    //longitude = angle of the vector around the Y axis
    //-( ) : negate to flip the longitude (3d space specific )
    //- PI / 2 to face the Z axis
    var lng = -( Math.atan2( -vector3.z, -vector3.x ) ) - Math.PI / 2;

    //to bind between -PI / PI
    if( lng < - Math.PI )lng += Math.PI * 2;

    //latitude : angle between the vector & the vector projected on the XZ plane on a unit sphere

    //project on the XZ plane
    var p = new THREE.Vector3( vector3.x, 0, vector3.z );
    //project on the unit sphere
    p.normalize();

    //commpute the angle ( both vectors are normalized, no division by the sum of lengths )
    var lat = Math.acos( p.dot( vector3 ) );

    //invert if Y is negative to ensure teh latitude is comprised between -PI/2 & PI / 2
    if( vector3.y < 0 )
    {
    	 lat *= -1;
    }

    return [ lng,lat ];

}

function onDocumentMouseDown( event )
{
	downPointer = event;	
	isUserInteracting = true;
	var lonLat = vector3toLonLat(downPointer);
  downPointerLon = lonLat[0];
	downPointerLat = lonLat[1];
	console.log("downPointer.x " + downPointerLon.x + "downPointer.y " + downPointer.y);
	console.log("downPointerLon " + downPointerLon);
	console.log("downPointerLat " + downPointerLat);
	
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children ); 

  if ( intersects.length > 0 ) 
  {
      intersects[0].object.callback();
  }
}

function onDocumentMouseUp( event )
{
	isUserInteracting = false;
}

function onResize() 
{
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				insetWidth = window.innerHeight / 4; // square
				insetHeight = window.innerHeight / 4;

				camera2.aspect = insetWidth / insetHeight;
				camera2.updateProjectionMatrix();
}

document.addEventListener('pointerdown', onDocumentMouseDown, false);
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('pointermove', onDocumentMouseMove, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
