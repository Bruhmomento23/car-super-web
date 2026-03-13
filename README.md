# Car Super Web

This repository hosts the web frontend and backend for the Car Super project.

The `check-here/car-super-app` directory contains the existing Flutter mobile app. The web application is intended to mimic the same features and eventually share a common backend so that both app and web interface operate against the same services.

## Repository Structure

- `backend/` – server code (controllers, models, routes, etc.)
- `frontend/` – web UI (components, pages, features, etc.)
- `check-here/car-super-app` – original Flutter mobile application
- `docs/` – architecture design and documentation
- `.github/workflows` – CI configurations
- `App.tsx` - helps to set the structure, for example the first route path is to the landing page, meaning the moment the user the site, they are at the landing page.

Refer to the docs folder for more details on APIs and linking strategies.