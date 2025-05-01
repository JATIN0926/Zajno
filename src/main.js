import * as THREE from "three";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
const locomotiveScroll = new LocomotiveScroll();

// Check if window width is desktop size
const isDesktop = window.innerWidth >= 1024;

if (isDesktop) {
  const scene = new THREE.Scene();
  const distance = 20;
  const fov = 2 * Math.atan(window.innerHeight / 2 / distance) * (180 / Math.PI);
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
  images.forEach((image) => {
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
      2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
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

    planes.forEach((plane) => {
      gsap.to(plane.material.uniforms.uHover, {
        value: 0,
        duration: 0.3,
      });
    });

    if (intersects.length > 0) {
      const intersectedPlane = intersects[0];
      const uv = intersectedPlane.uv;
      gsap.to(intersectedPlane.object.material.uniforms.uMouse.value, {
        x: uv.x,
        y: uv.y,
        duration: 0.3,
      });
      gsap.to(intersectedPlane.object.material.uniforms.uHover, {
        value: 1,
        duration: 0.3,
      });
    }
  });
} else {
    document.getElementById("canvas").style.display = 'none'
  const images = document.querySelectorAll("img");
  images.forEach((image) => {
    image.style.opacity = 1;
  });
}

// locomotiveScroll.on("scroll", updatePlanePosition);
