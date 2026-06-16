---
title: "Smart-Manufacturing Quality Prediction System"
filter: "Projects"
category: "Smart Manufacturing · ML"
date: "2022 – 2023"
role: "Developer · Software & Signal Chain"
order: 7
thumbnail: "/assets/img/portfolio/smart-mfg-quality-prediction/cover.png"
description: "MLP system predicting product weight to 0.2% from live sensor signals, with a traceable SQL-backed dashboard."
tech: ["MLP", "PyQt5", "SQL", "ADC Interfacing", "Signal Processing", "Python"]
highlights:
  - "Trained an MLP that predicts product weight within 0.2% deviation from processed sensor data"
  - "Interfaced with external ADC chips for real-time signal capture and computation"
  - "Built a PyQt5 dashboard and synced processed data to an SQL database for traceability"
media:
  - { type: "image", src: "/assets/img/portfolio/smart-mfg-quality-prediction/cover.png", alt: "Quality prediction dashboard" }
  - { type: "image", src: "/assets/img/portfolio/smart-mfg-quality-prediction/01.png", alt: "Prediction results view" }
---

A production-oriented quality system that predicts a product's weight **before**
it is physically weighed, replacing a slow manual check with an instant,
software-based one.

I built the full signal-to-insight chain. At the front end, the system
interfaces with external **ADC** chips to capture sensor signals and runs
real-time processing on them. Those processed features feed an **MLP** model
that predicts product weight to within **0.2%** of the true value.

Results surface on a **PyQt5** dashboard for on-site operators, while every
processed record is synchronized to an **SQL** database so measurements stay
**traceable**, the foundation for a smart-manufacturing workflow.

This project took
[**first place** at the NTNU Mechatronic Capstone Competition (2023)](/portfolio/ntnu-mechatronics-capstone/)
and later became the basis of a peer-reviewed conference paper at the **2023 ARIS
International Conference**.
