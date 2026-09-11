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

  // xi = lambda * Ls / p
  // Input units: lambda [Angstrom], Ls [mm], p [micrometers]
  // Output unit: xi [micrometers]
  function correlationLengthFromLs(wavelengthAngstrom, sampleDetectorDistanceMm, gratingPeriodMicrometers) {
    if (wavelengthAngstrom <= 0 || gratingPeriodMicrometers <= 0) return NaN;
    return (wavelengthAngstrom * sampleDetectorDistanceMm) / (10 * gratingPeriodMicrometers);
  }

  // Inverse of xi = lambda * Ls / p.
  // Input units: xi [micrometers], lambda [Angstrom], p [micrometers]
  // Output unit: Ls [mm]
  function lsFromCorrelationLength(xiMicrometers, wavelengthAngstrom, gratingPeriodMicrometers) {
    if (wavelengthAngstrom <= 0 || gratingPeriodMicrometers <= 0) return NaN;
    return (10 * xiMicrometers * gratingPeriodMicrometers) / wavelengthAngstrom;
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
    correlationLengthFromLs: correlationLengthFromLs,
    lsFromCorrelationLength: lsFromCorrelationLength,
    linspace: linspace
  };
})();
