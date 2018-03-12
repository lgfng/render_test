var VSHADER_SOURCE=`
uniform mat4 u_matrix;
attribute vec4 a_point;
attribute vec2 a_textureCoord;
varying vec2 v_textureCoord;
void main(){
    gl_Position = u_matrix * a_point;
    v_textureCoord = a_textureCoord;
}
`;
var FSHADER_SOURCE=`
precision mediump float;
varying vec2 v_textureCoord;
uniform sampler2D u_sampler;
void main(){
    gl_FragColor=texture2D(u_sampler, v_textureCoord);
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

    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(3.0,3.0,7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var u_matrix = gl.getUniformLocation(gl.program, "u_matrix");
    if(!u_matrix){
        console.log("failed to get the storage location of u_matrix");
        return;
    }

    gl.clearColor(0.0, 0.0,0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    if(!initTextures(gl, n)){
        return;
    }

    var tick = function(){
        if(img_loaded >= 1){
            draw(gl, viewProjMatrix, u_matrix, n);
        }
        window.requestAnimationFrame(tick);
    };
    tick();

    initEventHandler(canvas);
}

function initEventHandler(canvas){
    var dragging = false;
    var lastX = -1, lastY = -1;
    canvas.onmousedown = function(ev){
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if(rect.left <= x && x < rect.right && rect.bottom > y && rect.top <= y){
            lastX = x;
            lastY = y;
            dragging = true;
        }
    }

    canvas.onmouseup = function(ev){
        dragging = false;
    }

    canvas.onmousemove = function(ev){
        var x = ev.clientX;
        var y = ev.clientY;
        if(dragging){
            var factor = 100/ canvas.height;
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);

            g_rotate_x = Math.max(Math.min(g_rotate_x + dy, 90.0), -90);
            g_rotate_y = g_rotate_y + dx;
            console.log(g_rotate_x, g_rotate_y);
        }
        lastX = x; 
        lastY = y;
    }
}

var g_rotate_x = 0.0, g_rotate_y = 0.0;
var g_mvpMatrix = new Matrix4();
function draw(gl, viewProjMatrix, u_matrix, n){
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.rotate(g_rotate_x, 1, 0, 0);
    g_mvpMatrix.rotate(g_rotate_y, 0, 1, 0);
    gl.uniformMatrix4fv(u_matrix, false, g_mvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffer(gl){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create buffer object");
        return -1;
    }
    var n = 4;

    var points = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, -1.0, 1.0, 1.0, 0.0,

        1.0, 1.0, 1.0, 1.0,1.0,
        -1.0, 1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, -1.0, 0.0, 0.0,
        1.0, 1.0, -1.0, 1.0, 0.0,

        1.0, 1.0, 1.0,1.0,1.0,
        1.0, -1.0, 1.0, 0.0,1.0,
        1.0, -1.0, -1.0,0.0,0.0,
        1.0, 1.0, -1.0,1.0,0.0,

        -1.0, 1.0, 1.0,1.0,1.0,
        -1.0, -1.0, 1.0,0.0,1.0,
        -1.0, -1.0, -1,0.0,0.0,
        -1.0, 1.0, -1.0,1.0,0.0,

        -1.0, -1.0, 1.0,0.0,1.0,
        1.0, -1.0, 1.0,1.0,1.0,
        1.0, -1.0, -1.0,1.0,0.0,
        -1.0, -1.0, -1.0,0.0,0.0,

        -1.0, -1.0, -1.0,0.0,0.0,
        1.0, -1.0, -1.0,1.0,0.0,
        1.0, 1.0, -1.0,1.0,1.0,
        -1.0, 1.0, -1.0, 0.0,1.0,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    var fSize = points.BYTES_PER_ELEMENT;

    var a_point = gl.getAttribLocation(gl.program, "a_point");
    gl.vertexAttribPointer(a_point, 3, gl.FLOAT, false, fSize * 5, 0);
    gl.enableVertexAttribArray(a_point);

    var a_textureCoord = gl.getAttribLocation(gl.program, "a_textureCoord");
    gl.vertexAttribPointer(a_textureCoord, 2, gl.FLOAT, false, fSize * 5, fSize * 3);
    gl.enableVertexAttribArray(a_textureCoord);

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

    var image = new Image();
    image.onload = function(){
        loadTexture(gl, n, u_sampler, texture, image);
    };
    image.src = "../resources/sky.jpg";

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
