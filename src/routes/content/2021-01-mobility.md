---
title: Mobility / Stretching Web App
date: 2021-01
image: ../images/portfolio/mobility.png
summary: A web-app designed for personal use to help me stretch better
technologies: ["react"]
link: https://mobility.chrskerr.com
---

#### What We Did:
A React web app originally designed & built for our personal use, and since passed onto friends & family, it simplifies daily stretching. A very minimalist design, this web app allows users to track their stretching, including the ability to add/remove stretches and change the order of stretches, switch between day and night mode, and easily time their stretches with built in timer.

#### How We Did It:
We built the page using React with React-Spring as the animation library. It uses Workbox to generate a service-worker and LocalForage for state persistence to allow ongoing and offline use, plus Material UI makeStyles for CSS-in-JS and React-Snap for HTML pre-rendering. 

It is built around a basic queuing and timer mechanism which tracks and records progress through a queue of stretches and notifies the user when they finish a stretch. This same recording mechanism allows users to edit their stretching queue, and retain that config on the same device.