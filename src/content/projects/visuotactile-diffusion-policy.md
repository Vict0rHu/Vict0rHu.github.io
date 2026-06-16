---
title: "Visuotactile Manipulation with Diffusion Policy"
filter: "Research"
category: "Robot Learning · Manipulation"
date: "2026"
role: "Graduate Researcher · Purdue"
order: 1
thumbnail: "/assets/img/portfolio/visuotactile-diffusion-policy/cover.png"
description: "Tactile-enhanced imitation learning for contact-rich robotic disassembly."
tech: ["Diffusion Policy", "Imitation Learning", "GelSight Tactile", "PyTorch", "ROS", "Sensor Fusion"]
links:
  - label: "Project Site"
    icon: "bi-box-arrow-up-right"
    url: "https://vict0rhu.github.io/CONTACT-Website/"
highlights:
  - "Extended the Stanford Diffusion Policy framework to fuse GelSight tactile feedback with vision"
  - "Built a multi-modal training pipeline to study tactile-enhanced manipulation"
  - "Trained and deployed custom policies on a physical robot for contact-rich tasks"
  - "Measurable success-rate gains; results submitted to IROS"
media:
  - { type: "image", src: "/assets/img/portfolio/visuotactile-diffusion-policy/cover.png", alt: "CONTACT visuotactile learning pipeline" }
---

**CONTACT** (*CONtact-aware TACTile learning for robotic disassembly*) asks a
simple question with hard consequences: how much better can a robot manipulate
when it can *feel*, not just see?

We extended the Stanford **Diffusion Policy** framework to ingest **GelSight**
tactile readings alongside camera observations, building an end-to-end
multi-modal pipeline for data collection, training, and on-robot deployment. The
policy learns from demonstrations and conditions its action prediction on the
fused visual–tactile state, which matters most exactly when vision falls short:
during occluded contact, slip, and fine insertion.

Trained policies were deployed on physical hardware to verify the approach on
tactile-rich disassembly tasks, where the tactile channel produced measurable
success-rate improvements over a vision-only baseline. The results form the
basis of an **IROS** submission.
