varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uColor; // new: color tint

void main(){
    float blocks = 20.0;
    vec2 blockUv = floor(vUv * blocks) / blocks;
    float distance = length(blockUv - uMouse);
    float effect = smoothstep(0.4, 0.0, distance);
    vec2 distortion = vec2(0.05) * effect;

    vec4 grayTex = texture2D(uTexture, vUv + (distortion * uHover));

    // Create a fake color version by multiplying grayscale with tint
    vec3 fakeColor = grayTex.rgb * uColor;

    // Interpolate between grayscale and tinted version
    vec3 finalColor = mix(grayTex.rgb, fakeColor, uHover);

    gl_FragColor = vec4(finalColor, grayTex.a);
}
