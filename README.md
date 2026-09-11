# NDF Plotter

Static web application for plotting expected neutron dark-field curves as a function of correlation length.

## Current equation

ln(DFI) / lambda^2 = (Delta rho)^2 phi [G(xi) - 1] chi

## Multi-curve interface

The app supports multiple independent curves. Each curve can have its own:

- wavelength
- SLD contrast
- volume fraction
- structure model
- model-specific parameters

Use **Add curve** to create a new parameter set, **Duplicate** to copy an existing curve, and **Remove** to delete one. The correlation-length range and plotted Y quantity are shared by all curves.

## Important

The current G(xi) and chi functions in `js/models.js` are placeholders only. Replace them with the validated expressions for spheres, cylinders, fractals, or other structures.

## Files

- `index.html` - page structure and controls
- `style.css` - layout and styling
- `js/app.js` - multi-curve UI logic and curve generation
- `js/physics.js` - common DFI equation
- `js/models.js` - structure-dependent G(xi) and chi models
- `js/plot.js` - Plotly multi-curve rendering
- `render.yaml` - Render static-site configuration

## Local use

Open `index.html` in a browser. An internet connection is required to load Plotly from its CDN.

## Render deployment

Create a new Render Static Site from the repository. The publish directory is the repository root (`.`). No build command is required.

Matteo Busi