//la gráfica de plotly
var gd;
/**cada cuantos ms se actualiza la vista */
var tasaActualizacion = 10;
/*
 * Inicialización de la gráfica
 */
window.onload = function()
{
    
    inicializarGrafica();
    
    //en cada movimiento de camara con el dedo (movil), se recalcula el angulo de vision
    gd.on('plotly_selected', function(eventData) 
    {
        calcularAnguloActual();
        console.log("plotly__click");
    }); 
    gd.on('plotly_afterplot', function() 
    {
        calcularAnguloActual();
        console.log("plotly__click");
    }); 
    gd.on('plotly_restyle', function(eventData) 
    {
        // console.log("Event:" + JSON.stringify(eventData));
        // console.log("Event:" + "x: " + eventData.points[0].x  + "y: " + eventData.points[0].y  + "z: " + eventData.points[0].z );
        // console.log("Cambio:" + JSON.stringify(deepMergeSum (ultimaPosCamara,eventData)));
        calcularAnguloActual();
        console.log("plotly__relayout");
    }); 

// setInterval( moverVistaCelular, tasaActualizacion);

}

/**
 * Si inicia la gráfica y
 * se personaliza la con cosas que no pueden configurarse desde el archivo inicial
 * */
function inicializarGrafica()
{
    gd = document.getElementById('graficaPlotly');
    window.setTimeout(esconderTextoGrafica, 4000);

    var resizeDebounce = null;
    Plotly.plot(gd,  {
        data: figure.data,
        layout: figure.layout,
        frames: figure.frames,
    });
    colorscale: 'Portland'

    //se actualiza la posicion inicial de la grafica y la variable anguloActual se incializa de acuerdo a esos valores
    // actualizarVistaCamara(0.75,0.75,0.75);
    anguloActual = 45;

    var styling = 
    {
        showgrid: false, //grid de fondo
        zeroline: false, //ejes
        ticks: '', //lineas de los rangos
        showticklabels: false, //numeros de los rangos
        showspikes:false, //quita las lineas que aparecen on hover
        title: "" //quita las etiquetas de eje (x, y, z)
    };

/*
        para futuras modificaciones: 
        orbital rotation es más atractiva y además no causa errores al mover la gráfica programáticamente
        existe un caso que cuanod la gráfica esta en turntable mode y se llega al limite del eje z los
        valores de x, y, z cambian algo erraticamente
    */
   //En modo movil se selecciona el modo zoom. En modo pantalla completa se selecciona orbital
    var movil = window.matchMedia("(max-width: 599px)")
    var dragmode;
   if(movil.matches)
      dragmode = "zoom";
    else
      dragmode = "orbital";
   var zoomInicial = 0.45;

 var update = {
                dragmode: dragmode,
                scene:{
                    xaxis:styling,
                    yaxis:styling,
                    zaxis:styling,
                    camera: {
                        eye: {x: zoomInicial, y:zoomInicial, z: zoomInicial } 
                    }
                },
            };

        Plotly.relayout(gd, update);
        
    
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
        moverVistaCelular();
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
function imprimirUltimaPosicionCamara()
{
    if(gd.layout.scene.camera)
    console.log("Event:" + "x: " +  gd.layout.scene.camera.eye.x  + "y: " +  gd.layout.scene.camera.eye.y  + "z: " +  gd.layout.scene.camera.eye.z );

}
/**
 * Recibe un valor para alejar (+) o acercar (-) la camara
 * @param {double} zoom Valor positivo o negativo
 */
function zoomIn(zoom)
{

    x0 = gd.layout.scene.camera.eye.x;
    y0 = gd.layout.scene.camera.eye.y;
    z0 = gd.layout.scene.camera.eye.z;


    xn = x0 + zoom;
    yn = y0 + zoom;
    zn = z0 + zoom;
    //verifique los valores no sean menos de 0 (pq el efecto de vuelve opuesto. ie. en vez de zoom in se vuelve zoom out)
    xn = xn < 0 ? x0:xn 
    yn = yn < 0 ? y0:yn 
    zn = zn < 0 ? z0:zn 

    actualizarVistaCamara(xn,yn,zn)
}

window.onerror = function (message, file, line, col, error) {
    alert("Error occurred: " + error.message + "\rline:" + line);
    return false;
 };



 function calcularAnguloActual()
{
    //corrige un mensaje error que se da en la primera carga
    if(!gd.layout.scene.camera)
    {
        // alert(JSON.stringify(gd.layout.scene));
        return
    }
    // imprimirUltimaPosicionCamara();
    x0 = gd.layout.scene.camera.eye.x;
    y0 = gd.layout.scene.camera.eye.y;
    z0 = gd.layout.scene.camera.eye.z;    

    /* anguloActualY = Math.asin(x0/hipotenusaY)* (180/Math.PI);
    anguloActualZ = Math.asin(x0/hipotenusaZ)* (180/Math.PI);
    */
    anguloActualY = Math.atan(y0/x0);
    anguloActualZ = Math.atan(z0/x0);

    //hallamos la hipotenusa  del triangulo formado por X y Y
    //    hipotenusaY = Math.sqrt(x0*x0 + y0*y0);
    hipotenusaY = x0/Math.cos(anguloActualY);
    //hallamos la hipotenusa  del triangulo formado por X y Z
    //    hipotenusaZ = Math.sqrt(x0*x0 + z0*z0);
    hipotenusaZ = x0/Math.cos(anguloActualZ);

    hipotenusaXY = y0/Math.cos(anguloActualY);
    hipotenusaXZ = z0/Math.cos(anguloActualZ);
    actualXY = hipotenusaY*Math.sin(anguloActualY);
    actualXZ = hipotenusaZ*Math.sin(anguloActualZ);

    actualY = hipotenusaY*Math.sin(anguloActualY);
    actualZ = hipotenusaZ*Math.sin(anguloActualZ);
    console.log(" Angulo XY : " + cortar(anguloActualY) +" Angulo XZ : " + cortar(anguloActualZ) );
    tolerancia = 0.1;
    if(Math.abs(actualY - y0) > tolerancia)
    {
        console.log(" nuevaPos X : " + cortar(x0) +" nuevaPos Y : " + cortar(actualY) + " nuevaPos Z : " + cortar(actualZ));
        console.log("--- Y0 : " + y0 + "  YN : " + actualY);
        console.log("--- XY0 : " + x0 + "  XYN : " + actualXY);
        console.log("--- XZ0 : " + x0 + "  XZN : " + actualXZ);
    }
    if(Math.abs(actualZ - z0) > tolerancia)
    {
        console.log(" nuevaPos X : " + cortar(x0) +" nuevaPos Y : " + cortar(actualY) + " nuevaPos Z : " + cortar(actualZ));
        console.log("--- Z0 : " + z0 + "  ZN : " + actualZ);
        console.log("--- XY0 : " + x0 + "  XYN : " + actualXY);
        console.log("--- XZ0 : " + x0 + "  XZN : " + actualXZ);
    }

}

function cortar(b)
{
    return ("" + b).substring(0,7);

}

var anguloActualY;
var anguloActualZ;
var cambioAngulo = 0.025;
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
    calcularAnguloActual();
    
    if (direccion!=1 && direccion != -1) //Chequeo de valores
        direccion = 1

    imprimirUltimaPosicionCamara();
  /*   if(!gd.layout.scene.camera)
    {
        alert(JSON.stringify(gd.layout.scene));
        return
    } */
        x0 = gd.layout.scene.camera.eye.x;
        y0 = gd.layout.scene.camera.eye.y;
        z0 = gd.layout.scene.camera.eye.z;


    hipotenusa = 0;
    // cambioAngulo = 0.001;
    

    a0 = x0;
    b0 = ejeY? y0: z0; //nos movemos en el eje Y (izq - Der) o en el Z (arriba- abajo)
    anguloActual = ejeY? anguloActualY: anguloActualZ;/*  */

    //hallamos la hipotenusa  del triangulo formado por X y Y
    hipotenusa = Math.sqrt(a0*a0 + b0*b0)
    /* console.log("a0: " + a0 + " - b0: " + b0);
    console.log("hipotenusa: " + hipotenusa);
    console.log("Nuevo Angulo: " + (anguloActual - cambioAngulo));
        */
    //ahora hallamos la nueva posicion de los puntos X Y Y habiendolos movido 0.1 grados (cambioAngulo)
    bn = hipotenusa*Math.sin(anguloActual + (cambioAngulo*direccion));
    an = hipotenusa*Math.cos(anguloActual + (cambioAngulo*direccion));
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


function cambiarStyling()
{
    var styling = {rangeslider : {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        autotick: true,
        ticks: '',
        showticklabels: false,
        gridcolor: 'black',
        zerolinecolor: 'black',
        linecolor: 'black',
    }};
    
    var update = 
    {
        
            xaxis:styling,
            yaxis:styling,
            zaxis:styling,
    
    }
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
