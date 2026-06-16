---
title: "ROS2 6-Axis Robot Arm Control"
filter: "Coursework"
category: "ROS2 · Motion Planning"
date: "2025"
role: "Coursework · Solo"
order: 3
thumbnail: "/assets/img/portfolio/ros2-6axis-arm/cover.jpg"
description: "Simulated and controlled a 6-axis arm in ROS2, executing planned drawing trajectories."
tech: ["ROS2", "RViz", "Python", "Path Planning", "Trajectory Generation", "Forward/Inverse Kinematics"]
highlights:
  - "Simulated and controlled a 6-axis robotic arm in ROS2 with RViz visualization"
  - "Wrote Python nodes for path planning and trajectory generation"
  - "Executed complex drawing tasks end-to-end from plan to motion"
media:
  - { type: "image", src: "/assets/img/portfolio/ros2-6axis-arm/cover.jpg", alt: "6-axis robot arm" }
  - { type: "image", src: "/assets/img/portfolio/ros2-6axis-arm/01.png", alt: "Planning result" }
  - { type: "image", src: "/assets/img/portfolio/ros2-6axis-arm/02.png", alt: "Trajectory problem setup" }
---

A hands-on **ROS2** project built around a 6-axis manipulator. I modeled and
controlled the arm in simulation, using **RViz** to visualize joint states and
the planned end-effector path before anything moved.

The core of the work was the motion stack: **Python** nodes that take a target
path, solve for the joint trajectories, and stream them to the controller. To
prove the pipeline end-to-end, I drove the arm through **drawing tasks**,
following Cartesian paths accurately enough to trace shapes, which exercises
kinematics, planning, and timing together rather than in isolation.
