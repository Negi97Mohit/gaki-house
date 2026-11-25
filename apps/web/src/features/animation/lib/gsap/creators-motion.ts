import gsap from "gsap";
import type { GSAPAnimationConfig } from "./types";

export const createCinematicReveal = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");
  const words = element.querySelectorAll(".word");
  const lines = element.querySelectorAll(".line");

  // If we have split text, animate each piece
  if (chars.length > 0) {
    tl.set(chars, { opacity: 0, y: 100, rotationX: -90 });
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: config.duration || 1.2,
      stagger: config.stagger || 0.03,
      ease: config.ease || "power4.out",
    });
  } else {
    // Fallback for non-split text
    tl.fromTo(
      element,
      { opacity: 0, y: 50, clipPath: "inset(100% 0% 0% 0%)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: config.duration || 1,
        ease: config.ease || "power3.out",
      },
    );
  }

  return tl;
};

export const createKineticType = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  tl.fromTo(
    element,
    {
      scale: 0,
      rotation: -180 * intensity,
      opacity: 0,
    },
    {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: config.duration || 0.8,
      ease: "back.out(2.5)",
    },
  );

  // Add a subtle bounce at the end
  tl.to(element, {
    scale: 1.05,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
  });

  return tl;
};

export const createMorphGlitch = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  // Initial glitch effect
  tl.set(element, { opacity: 1 });

  // Create glitch frames
  for (let i = 0; i < 5; i++) {
    const offset = (Math.random() - 0.5) * 20 * intensity;
    tl.to(element, {
      x: offset,
      skewX: offset * 0.5,
      duration: 0.05,
      ease: "none",
    });
    tl.set(element, {
      textShadow: `${offset}px 0 cyan, ${-offset}px 0 magenta`,
    });
  }

  // Settle
  tl.to(element, {
    x: 0,
    skewX: 0,
    textShadow: "none",
    duration: 0.3,
    ease: "power2.out",
  });

  return tl;
};

export const createElasticBounce = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "up";

  const fromVars: gsap.TweenVars = {
    opacity: 0,
    scale: 0.3,
  };

  switch (direction) {
    case "up":
      fromVars.y = 100;
      break;
    case "down":
      fromVars.y = -100;
      break;
    case "left":
      fromVars.x = 100;
      break;
    case "right":
      fromVars.x = -100;
      break;
  }

  tl.fromTo(element, fromVars, {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    duration: config.duration || 1,
    ease: "elastic.out(1, 0.5)",
  });

  return tl;
};

export const createStaggerWave = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    tl.set(chars, { opacity: 0, y: 30 });
    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: config.duration || 0.6,
      stagger: {
        each: config.stagger || 0.05,
        from: "start",
        ease: "sine.inOut",
      },
      ease: "power2.out",
    });
  } else {
    tl.fromTo(
      element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: config.duration || 0.6,
        ease: "power2.out",
      },
    );
  }

  return tl;
};

export const createPerspectiveFlip = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "up";

  gsap.set(element.parentElement, { perspective: 1000 });

  const rotationProp =
    direction === "up" || direction === "down" ? "rotationX" : "rotationY";
  const rotationValue = direction === "up" || direction === "left" ? 90 : -90;

  tl.fromTo(
    element,
    {
      opacity: 0,
      [rotationProp]: rotationValue,
      transformOrigin:
        direction === "up"
          ? "bottom center"
          : direction === "down"
            ? "top center"
            : direction === "left"
              ? "right center"
              : "left center",
    },
    {
      opacity: 1,
      [rotationProp]: 0,
      duration: config.duration || 1,
      ease: "power3.out",
    },
  );

  return tl;
};

export const createLiquidFill = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.fromTo(
    element,
    {
      scaleY: 0,
      transformOrigin: "bottom center",
      opacity: 1,
    },
    {
      scaleY: 1,
      duration: config.duration || 1.2,
      ease: "power2.inOut",
    },
  );

  return tl;
};

export const createNeonFlicker = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const color = config.color || "#00ffff";

  // Initial state
  tl.set(element, { opacity: 0 });

  // Flicker sequence
  const flickerPattern = [0.1, 0.05, 0.1, 0.05, 0.2, 0.05, 0.3];
  flickerPattern.forEach((duration, i) => {
    tl.to(element, {
      opacity: i % 2 === 0 ? 1 : 0.3,
      textShadow:
        i % 2 === 0
          ? `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`
          : `0 0 5px ${color}`,
      duration,
      ease: "none",
    });
  });

  // Final glow
  tl.to(element, {
    opacity: 1,
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
    duration: 0.3,
    ease: "power2.out",
  });

  return tl;
};

