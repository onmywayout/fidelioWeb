// var ultimaPosCamara = {"scene.camera":{"up":{"x":0,"y":0,"z":1},"center":{"x":0,"y":0,"z":0},"eye":{"x":1.5000000000000002,"y":1.2500000000000002,"z":1.2499999999999998}}};
//se guardan los parametros actuales de la posicion de la cama
var ultimaPosCamara ;
//la gráfica de plotly
var gd;

/**
 * Inicialización de la gráfica
 */
window.onload = function()
{
    gd = document.getElementById('graficaPlotly');
    window.setTimeout(esconderTextoGrafica, 3000);
    
    var resizeDebounce = null;
    Plotly.plot(gd,  {
        data: figure.data,
        layout: figure.layout,
        frames: figure.frames,
    });
    colorscale: 'Portland'

    //se actualiza la posicion inicial de la grafica y la variable anguloActual se incializa de acuerdo a esos valores
    actualizarVistaCamara(0.75,0.75,0.75);
    anguloActual = 45;
    ultimaPosCamara = {"scene":{"camera":{"eye":{"x":1,"y":1,"z":1}}}};
    
    gd.on('plotly_relayout', function(eventData) 
    {
        console.log("Event:" + JSON.stringify(eventData));
        // console.log("Cambio:" + JSON.stringify(deepMergeSum (ultimaPosCamara,eventData)));
        ultimaPosCamara = eventData;
    }); 

    setInterval( moverVistaCelular, 10);
    
}

/**
 * Esconde el texto sobre la gráfica
 */
function esconderTextoGrafica()
{
    var etg = document.getElementById('textoSobreGrafica');
    etg.style.display= "none";
}

/**
 * Funcion requerida ppor Plotly para cambio del tamaño de ventana
 */
function resizePlot() 
{
    var bb = gd.getBoundingClientRect();
    Plotly.relayout(gd, {
        width: bb.width,
        height: bb.height
    });
}


/**
 *--------------------------------   Funciones relacionadas con el acelerometro---------------------------------------------
 * 
 */


var deltax = 0, deltay = 0, deltaz = 0,
    ax = 0, ay = 0, az =0;
var posInicialZ = undefined; //la posicion del celular en el eje z( vertical) cuando se abrió la pg
	
var sphere = document.getElementById("sphere");

if (window.DeviceMotionEvent != undefined) 
{
	window.ondevicemotion = function(e) {
		ax = event.accelerationIncludingGravity.x ;
        ay = event.accelerationIncludingGravity.y ;
        az = event.accelerationIncludingGravity.z ;
        //https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Using_device_orientation_with_3D_transforms
        deltax = e.rotationRate.beta;
        deltay = -e.rotationRate.gamma;
        deltaz = e.rotationRate.alpha;

        if(!posInicialZ)
            posInicialZ = az;
        
	}
} 

// setInterval(actualizarValores,50);

function actualizarValores()
{
    document.getElementById("alfa").innerHTML = ("" + deltax).substring(0,4);
    document.getElementById("beta").innerHTML = ("" + deltay).substring(0,4);
    document.getElementById("gamma").innerHTML = ("" + deltaz).substring(0,4);
}


/**
 * Actualiza la posicion de la gráfica de acuerdo a la posicion del celular
 * la tasa de refresco se configura en window.onload (setInterval( moverVistaCelular, 100))
 */
function moverVistaCelular()
{

    var rangoLateral = 10;
    var rangoVertical = 10;
    var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
    // document.getElementById("info").innerHTML = ("deltaX: " + (deltax>rangoLateral||deltax<rangoLateral*-1) + "deltaZ: "  + (deltaz>rangoVertical||deltaz<rangoVertical*-1) );
    
    if(deltax>rangoLateral)
        cambiarAngulo(true,1)
    else if(deltax<rangoLateral*-1)
        cambiarAngulo(true,-1)
        
    // cambioEnZ = posInicialZ - az;
        
    if(deltaz>rangoVertical)
        cambiarAngulo(false,-1)
    else if(deltaz<rangoVertical*-1)
        cambiarAngulo(false,1)
    
        /* cambioEnZ = posInicialZ - az;
    var rangoVertical = 2;
    if(cambioEnZ>rangoVertical)
        zoomIn(0.025);
    else if(cambioEnZ<rangoVertical*-1)
        zoomIn(-0.025); */

    // boundingBoxCheck();
    
    /* sphere.style.top = y + "px";
    sphere.style.left = x + "px";
     */
}

function boundingBoxCheck(){
	if (x<0) { x = 0; vx = -vx; }
	if (y<0) { y = 0; vy = -vy; }
	if (x>document.documentElement.clientWidth-20) { x = document.documentElement.clientWidth-20; vx = -vx; }
	if (y>document.documentElement.clientHeight-20) { y = document.documentElement.clientHeight-20; vy = -vy; }
	
}

/*
Alfa (Eje Z): Eje X gráfica
Beta (Eje X): Zoom
Gamma (Eje y):  Eje Y gráfica

 scene:{
            camera: {
          center: { x: icenter[0], y: icenter[1], z: icenter[2] }, 
          eye: {x: ieye[0], y: ieye[1], z: ieye[2] }, 
           up: { x: iup[0], y: iup[1], z: iceiupnter[2] }
            }
        },
    };


*/


var stop = false;
function pruebaHipotesis(a,b)
{
    if(!stop)
    {
        setTimeout(() => {
            cambiarAngulo(a, b);
            pruebaHipotesis(a,b)
        }, 100);
    }
}

/**
 * funciones relacionadas con el posicionamiento de la camara
 * ---------------------------------------------------------------------------------------------------------------------*
 */

/**
 * Recibe un valor para alejar (+) o acercar (-) la camara
 * @param {double} zoom Valor positivo o negativo
 */
function zoomIn(zoom)
{
    if(ultimaPosCamara["scene.camera"])
    {
        x0 = ultimaPosCamara["scene.camera"].eye.x;
        y0 = ultimaPosCamara["scene.camera"].eye.y;
        z0 = ultimaPosCamara["scene.camera"].eye.z;
    }
    else
    {
        x0 = ultimaPosCamara.scene.camera.eye.x;
        y0 = ultimaPosCamara.scene.camera.eye.y;
        z0 = ultimaPosCamara.scene.camera.eye.z;
    }

    xn = x0 + zoom;
    yn = y0 + zoom;
    zn = z0 + zoom;
    //verifique los valores no sean menos de 0 (pq el efecto de vuelve opuesto. ie. en vez de zoom in se vuelve zoom out)
    xn = xn < 0 ? x0:xn 
    yn = yn < 0 ? y0:yn 
    zn = zn < 0 ? z0:zn 
    
     actualizarVistaCamara(xn,yn,zn)
}

var anguloActual;
/**
 * se calculan las nuevas coordenadas X,Y o X,Z
 * Para hacerlo se tiene en cuenta que el punto desde donde se esta viendo la gráfica es como si se estuviera dentor d euna esfera
 * Entonces las coordenadas x,y,z consisten en un punto de esa esfera desde donde se esta viendo hacia el centro
 * Luego utilizando las propiedades de los triangulos se calculan las nuevas coordenadas haciendo de cuenta que
 * nos movemos en direccion X o Z con un radio constante respecto al centro del circulo
 * Por lo tanto se calcula la hipotenusa actual (el radio hacia el centro) y se obtienen las nuevas coordenadas
 * @param {boolean} ejeY. En caso true rota en el Y, en caso false rota en el eje z 
 * @param {int} direccion {1,-1} //1: se mueve hacia la izq o hacia arriba. -1 se mueve a la derecha o hacia abajo
 */
function cambiarAngulo(ejeY, direccion)
{
    if (direccion!=1 && direccion != -1) //Chequeo de valores
        direccion = 1

    if(ultimaPosCamara["scene.camera"])
    {
        x0 = ultimaPosCamara["scene.camera"].eye.x;
        y0 = ultimaPosCamara["scene.camera"].eye.y;
        z0 = ultimaPosCamara["scene.camera"].eye.z;
    }
    else
    {
        x0 = ultimaPosCamara.scene.camera.eye.x;
        y0 = ultimaPosCamara.scene.camera.eye.y;
        z0 = ultimaPosCamara.scene.camera.eye.z;
    }

    hipotenusa = 0;
    cambioAngulo = 0.1;

    a0 = x0;
    b0 = ejeY? y0: z0; //nos movemos en el eje Y (izq - Der) o en el Z (arriba- abajo)
    
    //hallamos la hipotenusa  del triangulo formado por X y Y
    hipotenusa = Math.sqrt(a0*a0 + b0*b0)
    /* console.log("a0: " + a0 + " - b0: " + b0);
    console.log("hipotenusa: " + hipotenusa);
    console.log("Nuevo Angulo: " + (anguloActual - cambioAngulo));
     */
    //ahora hallamos la nueva posicion de los puntos X Y Y habiendolos movido 0.1 grados (cambioAngulo)
    an = hipotenusa*Math.sin(anguloActual + (cambioAngulo*direccion));
    bn = hipotenusa*Math.cos(anguloActual + (cambioAngulo*direccion));
    anguloActual = anguloActual  + cambioAngulo*direccion;
    /* if(isNaN(an+bn))
        stop = true; */
        
    if(ejeY)
        actualizarVistaCamara(an,bn,z0);
    else
        actualizarVistaCamara(an,y0,bn);
   
}
/**
 * Hace set de las coordenadas x,y,z desde donde se esta viendo la gráfica
 * las coordenadas 1,1,1 tienen el mimso punto de vista que 2,2,2 pero con menos zoom
 * @param {int} xa Pos X
 * @param {int} ya Pos Y
 * @param {int} za Pos Z
 */
function actualizarVistaCamara(xa,ya,za)
{
    var update = {
            scene:{
                camera: {
                         eye: {x: xa, y: ya, z: za } 
                        }
                    },
                };

    Plotly.relayout(gd, update);
}


/**
 * En desuso
 * Metodo usado para comparar dos objetos complejos (como el eventData del plotly_relayout) y ver que ha cambiado
 * @param {*} obj1 
 * @param {*} obj2 
 */
const deepMergeSum = (obj1, obj2) => {
    return Object.keys(obj1).reduce((acc, key) => {
      if (typeof obj2[key] === 'object') {
        acc[key] = deepMergeSum(obj1[key], obj2[key]);
      } else if (obj2.hasOwnProperty(key) && !isNaN(parseFloat(obj2[key]))) {
        acc[key] = obj1[key] - obj2[key]
      }
      return acc;
    }, {});
  };
