(function () {
  "use strict";

  // IMPORTANT:
  // The functions below are placeholders used only to make the application
  // interactive while the final neutron dark-field physics is being defined.
  // Replace G(xi, params) and chi(params) for each model with the validated equations.

  window.NDFModels = {
    sphere: {
      name: "Spheres",
      parameters: [
        { key: "radius", label: "Radius", unit: "µm", default: 5.0, min: 0.001, step: 0.1 }
      ],
      G: function (xi, params) {
        var radius = Math.max(params.radius, 1e-12);
        return Math.exp(-Math.pow(xi / radius, 2));
      },
      chi: function () {
        return 1.0;
      }
    },

    cylinder: {
      name: "Cylinders",
      parameters: [
        { key: "radius", label: "Radius", unit: "µm", default: 3.0, min: 0.001, step: 0.1 },
        { key: "length", label: "Length", unit: "µm", default: 30.0, min: 0.001, step: 0.5 }
      ],
      G: function (xi, params) {
        var radius = Math.max(params.radius, 1e-12);
        return Math.exp(-xi / radius);
      },
      chi: function (params) {
        var radius = Math.max(params.radius, 1e-12);
        var length = Math.max(params.length, 1e-12);
        return Math.min(length / (2 * radius), 10);
      }
    },

    fractal: {
      name: "Fractal",
      parameters: [
        { key: "scale", label: "Characteristic size", unit: "µm", default: 5.0, min: 0.001, step: 0.1 },
        { key: "dimension", label: "Fractal dimension", unit: "", default: 2.5, min: 1.0, max: 3.0, step: 0.1 }
      ],
      G: function (xi, params) {
        var scale = Math.max(params.scale, 1e-12);
        var dimension = Math.max(params.dimension, 0.1);
        return 1 / (1 + Math.pow(xi / scale, dimension));
      },
      chi: function () {
        return 1.0;
      }
    }
  };
})();
