---
title: "VR Teleoperation: Franka Arm + FPV PTZ Camera"
filter: "Projects"
category: "Teleoperation · VR · Robot Arm"
date: "2025"
role: "Developer · Teleoperation Pipeline"
order: 2
thumbnail: "/assets/img/portfolio/fpv-ptz-teleoperation/cover.png"
description: "Immersive first-person teleoperation of a Franka arm and PTZ camera via Meta Quest 3."
tech: ["Meta Quest 3", "Franka Emika Panda", "PTZ Camera", "Teleoperation", "Low-Latency Control", "Safety Workspace"]
highlights:
  - "Mapped VR headset pose to camera pan/tilt motor commands with low latency"
  - "Streamed the live feed into Meta Quest 3 for an immersive first-person view (FPV)"
  - "Teleoperated a Franka Emika Panda arm with the headset for intuitive control"
  - "Defined workspace safety bounds to keep teleoperation within safe limits"
media:
  - { type: "image", src: "/assets/img/portfolio/fpv-ptz-teleoperation/cover.png", alt: "VR teleoperation system overview" }
  - { type: "image", src: "/assets/img/portfolio/fpv-ptz-teleoperation/01.jpg", alt: "Franka arm with FPV PTZ camera teleoperation rig" }
  - { type: "video", src: "/assets/img/portfolio/fpv-ptz-teleoperation/demo.mp4", alt: "Teleoperation demo" }
---

This project turns a VR headset into a natural teleoperation interface. Head
motion drives a **pan-tilt-zoom (PTZ) camera** while its video streams back into a
**Meta Quest 3**, so the operator looks around the robot's workspace as if
standing inside it, a true first-person view.

On top of the camera link I integrated a **Franka Emika Panda** arm, letting the
operator command the manipulator through the same headset. The control pipeline
was tuned to keep motion-to-photon latency low enough for the mapping to feel
direct rather than laggy.

Because teleoperation puts a real arm under human control, I added explicit
**workspace safety bounds** that constrain commanded motion to a safe region,
the kind of guardrail that makes a teleop rig usable for real data collection
and demonstration rather than just a demo.
