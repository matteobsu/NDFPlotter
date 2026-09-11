# NDF Plotter

Static web application for plotting expected neutron dark-field curves.

## Equations

Dark-field model:

`ln(DFI) / lambda_DFI^2 = (Delta rho)^2 phi [G(xi) - 1] chi`

Correlation length / instrument geometry:

`xi = lambda_xi * Ls / p`

The two wavelengths are deliberately independent:

- `lambda_DFI` belongs to each individual curve and is used in the DFI equation.
- `lambda_xi` is a shared instrument-geometry parameter used only to convert between correlation length `xi` and sample-detector distance `Ls`.

The interface uses these units for the geometry conversion:

- `lambda_xi`: Angstrom
- `Ls`: mm
- `p`: micrometers
- `xi`: micrometers

With those displayed units, the code performs the required unit conversion internally.

## X-axis

The plot can be switched between:

- correlation length `xi` in micrometers
- sample-detector distance `Ls` in mm

When `Ls` is selected, each plotted `Ls` value is converted to `xi` before evaluating `G(xi)`. Switching the X-axis converts the currently displayed range so the same physical interval is preserved.

## Multi-curve interface

Each curve can have its own:

- DFI wavelength
- SLD contrast
- volume fraction
- structure model
- model-specific parameters

The X-axis geometry and plotted Y quantity are shared by all curves.

## Important

The current `G(xi)` and `chi` functions in `js/models.js` are placeholders only. Replace them with validated expressions for spheres, cylinders, fractals, or other structures.

## Files

- `index.html` - page structure and controls
- `style.css` - layout and styling
- `js/app.js` - multi-curve UI logic, X-axis switching and curve generation
- `js/physics.js` - common DFI equation and xi/Ls conversion
- `js/models.js` - structure-dependent `G(xi)` and `chi` models
- `js/plot.js` - Plotly multi-curve rendering
- `render.yaml` - Render static-site configuration

## Local use

Open `index.html` in a browser. An internet connection is required to load Plotly from its CDN.

## Render deployment

Create a Render Static Site from the repository. The publish directory is the repository root (`.`).
