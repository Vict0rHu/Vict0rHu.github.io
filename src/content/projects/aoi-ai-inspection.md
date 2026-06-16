---
title: "AI-Powered Automated Optical Inspection (AOI)"
filter: "Projects"
category: "Optical Inspection · AI · Mechatronics"
date: "2024 – 2025"
role: "Project Lead · Mechanism, Firmware & AI"
order: 5
thumbnail: "/assets/img/portfolio/aoi-ai-inspection/cover.jpg"
description: "Patent-pending photoelastic inspection device fusing custom optics, firmware, and a deep-learning pipeline."
tech: ["Autoencoder", "MLP", "OpenCV", "PyQt5", "SOLIDWORKS", "Microcontroller Firmware", "Edge Inference"]
highlights:
  - "Designed a modular non-destructive testing device with adjustable optics (patent pending, TW/US filed)"
  - "Built an Autoencoder + MLP pipeline with OpenCV for residual-stress inference on edge hardware"
  - "Wrote non-blocking microcontroller firmware for a stable automated inspection workflow"
  - "Developed a PyQt5 GUI for real-time results and hardware control"
  - "Presented the prototype at Intelligent Asia 2025, Taipei"
media:
  - { type: "image", src: "/assets/img/portfolio/aoi-ai-inspection/cover.jpg", alt: "AI photoelastic inspection system exhibited at Intelligent Asia 2025" }
  - { type: "image", src: "/assets/img/portfolio/aoi-ai-inspection/01.jpg", alt: "Photoelastic fringe analysis and edge-detection pipeline" }
  - { type: "video", src: "/assets/img/portfolio/aoi-ai-inspection/preview.mp4", alt: "AI inspection software preview" }
  - { type: "video", src: "/assets/img/portfolio/aoi-ai-inspection/automode.mp4", alt: "Fully automated inspection run" }
---

An end-to-end **automated photoelastic inspection** instrument that I led from
proof-of-concept to integrated system, and that is now **under patent review**
(Taiwan/US applications filed). It combines non-destructive optical inspection
with AI to make quality assessment faster, more repeatable, and ready to slot
into an automated line.

The work spanned every layer of the stack:

- **Mechanism & optics:** a modular device with adjustable optics for
  high-precision camera positioning, iterated through multiple rounds of
  SOLIDWORKS design and 3D printing with maintainability in mind.
- **Firmware & control:** non-blocking microcontroller firmware driving a
  stable, repeatable automated inspection workflow, with both manual and fully
  automated modes.
- **AI pipeline:** a hybrid **Autoencoder / MLP** model with OpenCV that infers
  residual stress from the optical signal, running fast enough on **edge
  hardware** for in-line use.
- **Interface:** a **PyQt5** GUI to visualize inspection results and tune
  hardware parameters in real time.

The prototype was invited to **Intelligent Asia 2025** at the Taipei Nangang
Exhibition Center, where we presented it to both industry and academia. The
project was developed in the Polymer and Smart Strategic Processing Laboratory
(P2SPLAB) under the guidance of Prof. Kun-Cheng Ke.
