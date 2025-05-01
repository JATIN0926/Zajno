import * as THREE from "three";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";

const locomotiveScroll = new LocomotiveScroll({
  el: document.querySelector(".main"),
  smooth: true,
  smoothMobile: true, 
  lerp: 0.05, 
  class: "is-inview", 
});

let hoveredPlane = null;
let quickHover = null;
let quickMouseX = null;
let quickMouseY = null;

// Check if window width is desktop size
const isDesktop = window.innerWidth >= 1024;

if (isDesktop) {
  const scene = new THREE.Scene();
  const distance = 20;
  const fov =
    2 * Math.atan(window.innerHeight / 2 / distance) * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = distance;

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const images = document.querySelectorAll("img");
  const planes = [];
  const tintColors = [
    new THREE.Color(0.95, 0.75, 0.75), // blush pink
    new THREE.Color(0.85, 0.9, 1.0), // soft baby blue
    new THREE.Color(0.8, 0.85, 1.0), // pale blue
    new THREE.Color(1.0, 0.95, 0.8), // creamy yellow
    new THREE.Color(0.9, 0.8, 1.0), // soft violet
  ];

  images.forEach((image, index) => {
    const imgBounds = image.getBoundingClientRect();
    const texture = new THREE.TextureLoader().load(image.src);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {
          value: texture,
        },
        uMouse: {
          value: new THREE.Vector2(0.5, 0.5),
        },
        uHover: {
          value: 0,
        },
        uColor: { value: tintColors[index % tintColors.length] },
      },
      vertexShader,
      fragmentShader,
    });
    const geometry = new THREE.PlaneGeometry(imgBounds.width, imgBounds.height);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(
      imgBounds.left - window.innerWidth / 2 + imgBounds.width / 2,
      -imgBounds.top + window.innerHeight / 2 - imgBounds.height / 2,
      0
    );
    planes.push(plane);
    scene.add(plane);
  });

  function updatePlanePosition() {
    planes.forEach((plane, index) => {
      const image = images[index];
      const imgBounds = image.getBoundingClientRect();
      plane.position.set(
        imgBounds.left - window.innerWidth / 2 + imgBounds.width / 2,
        -imgBounds.top + window.innerHeight / 2 - imgBounds.height / 2,
        0
      );
    });
  }

  const animate = () => {
    requestAnimationFrame(animate);
    updatePlanePosition();
    renderer.render(scene, camera);
  };

  animate();

  window.addEventListener("resize", () => {
    const newFov =
      2 * Math.atan(window.innerHeight / 2 / distance) * (180 / Math.PI);
    camera.fov = newFov;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updatePlanePosition();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planes);

    if (intersects.length > 0) {
      const intersectedPlane = intersects[0].object;

      if (hoveredPlane !== intersectedPlane) {
        if (hoveredPlane) {
          quickHover(0);
        }

        hoveredPlane = intersectedPlane;
        quickHover = gsap.quickTo(
          hoveredPlane.material.uniforms.uHover,
          "value",
          {
            duration: 0.4,
            ease: "power2.out",
          }
        );

        quickMouseX = gsap.quickTo(
          hoveredPlane.material.uniforms.uMouse.value,
          "x",
          {
            duration: 0.4,
            ease: "power2.out",
          }
        );

        quickMouseY = gsap.quickTo(
          hoveredPlane.material.uniforms.uMouse.value,
          "y",
          {
            duration: 0.4,
            ease: "power2.out",
          }
        );
      }

      const uv = intersects[0].uv;
      quickMouseX(uv.x);
      quickMouseY(uv.y);
      quickHover(1);
    } else if (hoveredPlane) {
      quickHover(0);
      hoveredPlane = null;
    }
  });
} else {
  document.getElementById("canvas").style.display = "none";
  const images = document.querySelectorAll("img");
  images.forEach((image) => {
    image.style.opacity = 1;
  });
}

// locomotiveScroll.on("scroll", updatePlanePosition);
