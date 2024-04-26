class Rasteriser {
    constructor(textures) {
        console.log("loading WebGL context");
        const canvas = document.getElementById("canvas");
        this.gl = canvas.getContext("webgl", { depth: true });
        console.log("context loaded");
        this.gl.clearColor(0, 0, 0, 1.0);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.depthMask(true);

        // Create vertex shader
        this.vertexShaderSource = `
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            void main() {
                gl_Position = vec4(aPosition, 1.0);
                vTexCoord = aTexCoord;
            }
        `;                                                                                                                      
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, this.vertexShaderSource);
        this.gl.compileShader(this.vertexShader);
        if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)){
            console.error("ERROR compiling vertex shader", this.gl.getShaderInfoLog(this.vertexShader));
            return;
        }

        // Create fragment shader
        this.fragmentShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            varying vec2 vTexCoord;
            void main() {
                gl_FragColor = texture2D(uTexture, vTexCoord);
            }
        `;
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
        this.gl.compileShader(this.fragmentShader);
        if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)){
            console.error("ERROR compiling fragment shader", this.gl.getShaderInfoLog(this.fragmentShader));
            return;
        }

        // Create shader program
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)){
            console.error("ERROR linking program", this.gl.getProgramInfoLog(this.shaderProgram));
            return;
        }
        this.gl.validateProgram(this.shaderProgram);
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.VALIDATE_STATUS)) {
            console.log("ERROR validating", this.gl.getProgramInfoLog(this.shaderProgram))
            return;
        }
        this.gl.useProgram(this.shaderProgram);

        this.textureCache = {};
        this.loadTextures(textures);
        
        // Create buffers
        this.vertexBuffer = this.gl.createBuffer();
        this.texCoordBuffer = this.gl.createBuffer();
    }

    async loadTextures(textures){
        for (const textureUrl of textures){
            //Load image
            const image = await this.loadImage(textureUrl);
    
            // Create the texture
            let texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    
            // Set the parameters so we can render any size image
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    
            // Add the texture to the cache
            this.textureCache[textureUrl] = texture;
        };
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = url;
        });
    }

    async rasterise(triangle) {
        // Update vertex buffer
        const [vertex1, vertex2, vertex3] = triangle.vertexArr;
        const vertices = [
            vertex1.x, vertex1.y, vertex1.z,
            vertex2.x, vertex2.y, vertex2.z,
            vertex3.x, vertex3.y, vertex3.z
        ];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    
        // Bind vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        // Bind texture coordinate buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        const texCoords = [
            vertex1.u, vertex1.v,
            vertex2.u, vertex2.v,
            vertex3.u, vertex3.v
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);


        // Draw triangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    async rasteriseAll(triangles){
        // Clear buffers
        // this.gl.depthMask(true);
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const vertices = [];
        const texCoords = [];

        let nTriangles = 0;
        for (const triangle of triangles){
            if (triangle.vertexArr !== undefined && triangle.vertexArr.length === 3){
                nTriangles++;
                const [vertex1, vertex2, vertex3] = triangle.vertexArr;
                vertices.push(
                    vertex1.x, vertex1.y, vertex1.z,
                    vertex2.x, vertex2.y, vertex2.z,
                    vertex3.x, vertex3.y, vertex3.z
                );
                texCoords.push(
                    vertex1.u, vertex1.v,
                    vertex2.u, vertex2.v,
                    vertex3.u, vertex3.v
                );
            }
        }

        // Update vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        // Bind vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        // Update texture coordinate buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Draw all triangles
        this.gl.drawArrays(this.gl.TRIANGLES, 0, nTriangles * 3);
    }
}