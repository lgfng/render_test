var VSHADER_SOURCE=`
attribute vec4 a_point;
attribute vec4 a_Normal;
attribute vec4 a_Color;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_NormalMatrix;
uniform vec3 u_AmbientColor;
uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform mat4 u_ModelMatrix;

varying vec4 v_Color;
void main(){
    gl_Position = u_ModelViewMatrix * a_point;

    vec4 position = u_ModelMatrix * a_point;
    vec3 direction = normalize(u_LightPosition - vec3(position));
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    float nDotL = max(dot(normal, direction), 0.0);
    vec3 color = vec3(a_Color);
    vec3 diffuse = u_LightColor * color * nDotL;
    vec3 ambient = u_AmbientColor * color;
    v_Color = vec4(diffuse + ambient, a_Color.a);
    // v_Color = vec4(direction, 1.0);
}
`;
var FSHADER_SOURCE=`
precision mediump float;
varying vec4 v_Color;
void main(){
    gl_FragColor=v_Color;
}
`;

var img_loaded = 0;
function main(){
    var canvas = document.getElementById("canvas");
    if(!canvas){
        console.log("failed to retrieve the <canvas> element");
        return false;
    }

    gl = getWebGLContext(canvas);
    if(!gl){
        console.log("failed to get the rendering context for webgl");
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("failed to initialize shaders");
        return;
    }

    var n = initVertexBuffer(gl);

    var u_ModelViewMatrix = gl.getUniformLocation(gl.program, "u_ModelViewMatrix");
    if(!u_ModelViewMatrix){
        console.log("failed to get the storage location of u_ModelViewMatrix");
        return;
    }

    gl.clearColor(0.0, 0.0,0.0, 1.0);
    var matrix = new Matrix4();

    gl.enable(gl.DEPTH_TEST); 

    var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");

    var rotate = 0;

    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, canvas.width/ canvas.height, 1, 100);
    viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0, 0, 0, 0, 1, 0);

    var tick = function(){
        // if(img_loaded >= 2){
        rotate = draw(gl, n, viewProjMatrix, u_ModelViewMatrix, u_ModelMatrix, u_NormalMatrix);

        // }
        window.requestAnimationFrame(tick);
    };
    tick();

    window.onkeydown = function(ev){onKeyPressed(ev)};
    this.updateNearFar();
}

var g_arm1Angle = 0, g_joint1Angle = 0;
var g_joint2Angle = 0;
var g_joint3Angle = 0;
var ANGLE_PER_CLICK = 3.0;
function onKeyPressed(ev){
    switch(ev.keyCode){
        case 37: g_arm1Angle += ANGLE_PER_CLICK; break;
        case 39: g_arm1Angle -= ANGLE_PER_CLICK; break;
        case 38: g_joint1Angle += ANGLE_PER_CLICK; break;
        case 40: g_joint1Angle -= ANGLE_PER_CLICK; break;
        case 90: g_joint2Angle += ANGLE_PER_CLICK; break;
        case 88: g_joint2Angle -= ANGLE_PER_CLICK; break;
        case 86: g_joint3Angle += ANGLE_PER_CLICK; break;
        case 67: g_joint3Angle -= ANGLE_PER_CLICK; break;
    }
    this.updateNearFar();
}

function updateNearFar(){
    var ele = document.getElementById("nearFar");
    ele.innerHTML = "g_arm1Angle: " + clamp(g_arm1Angle) + "; g_joint1Angle:" + clamp(g_joint1Angle);
}

function clamp(n){
    return Math.floor(n * 100) / 10
}

var g_mvpMatrix = new Matrix4(); var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var baseHeight = 2.0;
    g_mvpMatrix.setTranslate(0.0, -12.0, 0.0);
    drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);

    var armLength = 10.0;
    g_mvpMatrix.translate(0, baseHeight, 0);
    g_mvpMatrix.rotate(g_arm1Angle, 0, 1, 0);
    drawBox(gl, n, 3.0, armLength, 3.0, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);

    g_mvpMatrix.translate(0.0, armLength, 0.0);
    g_mvpMatrix.rotate(g_joint1Angle, 0, 0, 1);
    drawBox(gl, n, 4.2, armLength, 4.2, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);
    
    var palmLength = 2.0;
    g_mvpMatrix.translate(0.0, armLength, 0.0);
    g_mvpMatrix.rotate(g_joint2Angle, 0, 1, 0);    
    drawBox(gl, n, 6, palmLength, 6, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);

    g_mvpMatrix.translate(0.0, palmLength, 0.0);
    pushMatrix(g_mvpMatrix);

    g_mvpMatrix.translate(0.0, 0.0, 2.0);
    g_mvpMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1, 2, 1, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);
    g_mvpMatrix = popMatrix();

    g_mvpMatrix.translate(0.0, 0.0, -2.0);
    g_mvpMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1, 2, 1, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix);
}


function drawBox(gl, n, width, height, depth, viewProjMatrix, u_matrix, u_ModelMatrix, u_NormalMatrix){
    pushMatrix(g_mvpMatrix);

    g_mvpMatrix.translate(0.0, height / 2, 0.0);
    g_mvpMatrix.scale(width/2, height/2, depth/2);
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_mvpMatrix);
    gl.uniformMatrix4fv(u_matrix, false, g_mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_mvpMatrix.elements);

    g_normalMatrix.setInverseOf(g_mvpMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    g_mvpMatrix = popMatrix();
}

var g_matrixStack = [];
function pushMatrix(matrix){
    g_matrixStack.push(new Matrix4(matrix));
}

function popMatrix(){
    return g_matrixStack.pop();
}

function initVertexBuffer(gl){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create buffer object");
        return -1;
    }
    var points = new Float32Array([
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,

        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,

        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1,
        -1.0, 1.0, -1.0,

        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0
    ]);

    var colors = new Float32Array([
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
    ]);

    var normals = new Float32Array([
       0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
       0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
       1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
       -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
       0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
       0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0, 
    ]);
    
    initArraryBuffer(gl, points, 3, gl.FLOAT, "a_point");
    initArraryBuffer(gl, colors, 3, gl.FLOAT, "a_Color");
    initArraryBuffer(gl, normals, 3, gl.FLOAT, "a_Normal");

    var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    var u_LightPosition = gl.getUniformLocation(gl.program, "u_LightPosition");

    gl.uniform3f(u_LightColor, 1.0, 0.0, 0.0);
    gl.uniform3f(u_LightPosition, 0.0, 10.0, 8.0);

    var u_AmbientColor = gl.getUniformLocation(gl.program, "u_AmbientColor");
    gl.uniform3f(u_AmbientColor, 0.2, 0.2, 0.2);

    var n = 4;
    var indeices = new Uint8Array([
        0, 1, 2, 0, 2, 3, 
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indeices, gl.STATIC_DRAW);

    return indeices.length;
}

function initArraryBuffer(gl, data, size, type, name){
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var position = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(position, size, type, false, 0, 0);
    gl.enableVertexAttribArray(position);
}

function initTextures(gl, n){
    var texture = gl.createTexture();
    if(!texture){
        console.log("failed to create texture");
        return false;
    }
    var u_sampler = gl.getUniformLocation(gl.program, "u_sampler");
    if(!u_sampler){
        console.log("failed to get the storage of u_sampler");
        return false;
    }

    var u_sampler_1 = gl.getUniformLocation(gl.program, "u_sampler_1");

    var image = new Image();
    image.onload = function(){
        loadTexture(gl, n, u_sampler, texture, image);
    };
    image.src = "../resources/sky.jpg";
    var image1 = new Image();
    image1.onload = function(){
        loadTexture(gl, n, u_sampler_1, texture, image1);
    };
    image1.src = "../resources/circle.gif";

    // image.crossOrigin = "anonymous";
    // image.src = "http://rodger.global-linguist.com/webgl/resources/sky.jpg";
    return true;
}

function loadTexture(gl, n, u_sampler, texture, image){
    var textId, unit;
    unit = img_loaded;
    if(img_loaded === 0){
        textId = gl.TEXTURE0;
    } else {
        textId = gl.TEXTURE1;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(textId);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_sampler, unit);

    img_loaded ++;
}
