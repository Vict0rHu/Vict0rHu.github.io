---
title: "Autonomous Ball-Shooting Mechatronic Robot"
filter: "Coursework"
category: "Mechatronics · Control · FSM"
date: "2023"
role: "System Integration Lead"
order: 6
thumbnail: "/assets/img/portfolio/mechatronics-flywheel-robot/cover.png"
description: "Fully autonomous robot with a PI-controlled flywheel launcher; A+ and course semifinalist."
tech: ["Finite State Machine", "PWM Control", "PI Control", "Circuit Design", "Mechanism Design", "SOLIDWORKS"]
highlights:
  - "Led system integration: finite-state-machine logic, circuit design, and mechanism design"
  - "Designed a flywheel launcher with PWM drive and PI speed control for repeatable shots"
  - "Landed balls in the target hill within tolerance, fully autonomously"
  - "Earned an A+ and advanced to the course's final four"
media:
  - { type: "image", src: "/assets/img/portfolio/mechatronics-flywheel-robot/cover.png", alt: "Isometric CAD view of the robot" }
  - { type: "image", src: "/assets/img/portfolio/mechatronics-flywheel-robot/01.png", alt: "Top CAD view" }
  - { type: "image", src: "/assets/img/portfolio/mechatronics-flywheel-robot/02.jpg", alt: "Assembled robot hardware" }
  - { type: "image", src: "/assets/img/portfolio/mechatronics-flywheel-robot/03.jpg", alt: "Robot build detail" }
  - { type: "video", src: "/assets/img/portfolio/mechatronics-flywheel-robot/demo.mp4", alt: "Autonomous run demo" }
---

The capstone build for my Mechatronics course: a **fully autonomous robot** that
finds its target and lands balls in a goal hill, with no operator in the loop. I led
**system integration**, the part where the mechanical, electrical, and control
subsystems either work together or fall apart.

That meant owning three things at once: the **finite state machine** that
sequences the robot's behavior, the **circuit design** that powers and wires the
actuators and sensors, and the **mechanism design** for the chassis and
launcher.

The heart of the scoring system is a **flywheel launcher**. I drove it with
**PWM** and closed a **PI speed loop** around it so the wheel holds a commanded
RPM regardless of load, which is what makes shot distance consistent enough to
land in the target within tolerance, shot after shot. The robot earned an **A+**
and advanced to the **final four** of the course competition.
