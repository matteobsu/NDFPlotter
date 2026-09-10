(function () {
  "use strict";

  function calculateNormalizedLnDFI(deltaRho, volumeFraction, G, chi) {
    return Math.pow(deltaRho, 2) * volumeFraction * (G - 1) * chi;
  }

  function calculateLnDFI(wavelength, deltaRho, volumeFraction, G, chi) {
    return Math.pow(wavelength, 2) * calculateNormalizedLnDFI(
      deltaRho,
      volumeFraction,
      G,
      chi
    );
  }

  function calculateDFI(wavelength, deltaRho, volumeFraction, G, chi) {
    return Math.exp(
      calculateLnDFI(wavelength, deltaRho, volumeFraction, G, chi)
    );
  }

  function linspace(start, stop, count) {
    if (count <= 1) return [start];

    var result = [];
    var step = (stop - start) / (count - 1);

    for (var i = 0; i < count; i += 1) {
      result.push(start + step * i);
    }

    return result;
  }

  window.NDFPhysics = {
    calculateDFI: calculateDFI,
    calculateLnDFI: calculateLnDFI,
    calculateNormalizedLnDFI: calculateNormalizedLnDFI,
    linspace: linspace
  };
})();
