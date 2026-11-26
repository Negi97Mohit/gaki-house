import gsap from "gsap";
import type { GSAPAnimationConfig } from "./types";

export const createTypewriter = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    tl.set(chars, { opacity: 0 });
    tl.to(chars, {
      opacity: 1,
      duration: 0.01,
      stagger: config.stagger || 0.08,
      ease: "none",
    });
  }

  return tl;
};

export const createScramble = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";

  if (chars.length > 0) {
    chars.forEach((char, i) => {
      const originalText = char.textContent || "";
      let iterations = 0;

      tl.to(
        char,
        {
          duration: config.duration || 0.8,
          onUpdate: function () {
            iterations++;
            if (iterations < 10) {
              (char as HTMLElement).textContent =
                scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            } else {
              (char as HTMLElement).textContent = originalText;
            }
          },
        },
        i * (config.stagger || 0.05),
      );
    });
  }

  return tl;
};

export const createMagneticPull = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    // Scatter chars
    tl.set(chars, {
      opacity: 0,
      x: () => (Math.random() - 0.5) * 200,
      y: () => (Math.random() - 0.5) * 200,
      rotation: () => (Math.random() - 0.5) * 180,
    });

    // Pull to center
    tl.to(chars, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: config.duration || 1,
      stagger: config.stagger || 0.02,
      ease: "back.out(1.5)",
    });
  }

  return tl;
};

export const createRubberBand = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.fromTo(
    element,
    { scaleX: 1, scaleY: 1, opacity: 0 },
    { opacity: 1, duration: 0.1 },
  )
    .to(element, {
      scaleX: 1.25,
      scaleY: 0.75,
      duration: 0.15,
      ease: "power2.out",
    })
    .to(element, {
      scaleX: 0.75,
      scaleY: 1.25,
      duration: 0.15,
      ease: "power2.out",
    })
    .to(element, {
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 0.1,
      ease: "power2.out",
    })
    .to(element, {
      scaleX: 0.95,
      scaleY: 1.05,
      duration: 0.1,
      ease: "power2.out",
    })
    .to(element, { scaleX: 1, scaleY: 1, duration: 0.1, ease: "power2.out" });

  return tl;
};

export const createShatter = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    // Start assembled
    tl.set(chars, { opacity: 1, x: 0, y: 0, rotation: 0 });

    // Shatter outward
    tl.to(chars, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      rotation: () => (Math.random() - 0.5) * 360,
      opacity: 0,
      duration: config.duration || 0.8,
      stagger: config.stagger || 0.02,
      ease: "power4.in",
    });

    // Reassemble
    tl.to(chars, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: config.duration || 0.8,
      stagger: config.stagger || 0.02,
      ease: "power4.out",
    });
  }

  return tl;
};

export const createInkReveal = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  // Create a unique mask effect
  const maskId = `ink-mask-${Date.now()}`;

  tl.fromTo(
    element,
    {
      clipPath: "circle(0% at 50% 50%)",
      opacity: 1,
    },
    {
      clipPath: "circle(150% at 50% 50%)",
      duration: config.duration || 1.5,
      ease: "power2.out",
    },
  );

  return tl;
};

export const createSpotlight = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.set(element, {
    backgroundImage:
      "radial-gradient(circle at 0% 50%, transparent 0%, black 0%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  });

  tl.to(element, {
    backgroundImage:
      "radial-gradient(circle at 100% 50%, transparent 100%, black 100%)",
    duration: config.duration || 1.5,
    ease: "power2.inOut",
  });

  // Reset to normal
  tl.set(element, {
    backgroundImage: "none",
    backgroundClip: "border-box",
    WebkitBackgroundClip: "border-box",
    color: config.color || "inherit",
  });

  return tl;
};

export const createWhipPan = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "left";
  const distance =
    direction === "left" || direction === "right" ? "100vw" : "100vh";
  const prop = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "left" || direction === "up" ? 1 : -1;

  tl.fromTo(
    element,
    {
      [prop]: `${sign * -100}%`,
      opacity: 1,
    },
    {
      [prop]: 0,
      duration: config.duration || 0.4,
      ease: "power4.out",
    },
  );

  // Motion blur effect simulation
  tl.fromTo(
    element,
    { filter: "blur(10px)" },
    { filter: "blur(0px)", duration: 0.2 },
    "<",
  );

  return tl;
};

export const createZoomPunch = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  tl.fromTo(
    element,
    {
      scale: 3 * intensity,
      opacity: 0,
      filter: "blur(20px)",
    },
    {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: config.duration || 0.5,
      ease: "power4.out",
    },
  );

  // Subtle overshoot
  tl.to(element, {
    scale: 0.95,
    duration: 0.1,
    ease: "power2.inOut",
  }).to(element, {
    scale: 1,
    duration: 0.1,
    ease: "power2.out",
  });

  return tl;
};

// PRESET LIBRARY

