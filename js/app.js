(function () {
  "use strict";

  var defaults = {
    xQuantity: "xi",
    xMin: 0.01,
    xMax: 20,
    pointCount: 300,
    geometryWavelength: 4.0,
    gratingPeriod: 10.0,
    yQuantity: "dfi",
    curve: {
      wavelength: 4.0,
      deltaRho: 1.0,
      volumeFraction: 0.10,
      model: "sphere"
    }
  };

  var curves = [];
  var nextCurveId = 1;
  var lastXQuantity = defaults.xQuantity;

  var plotColors = [
    "#1f77b4",
    "#d62728",
    "#2ca02c",
    "#9467bd",
    "#ff7f0e",
    "#17becf",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22"
  ];

  function cloneDefaultParameters(modelKey) {
    var model = window.NDFModels[modelKey];
    var params = {};

    model.parameters.forEach(function (parameter) {
      params[parameter.key] = parameter.default;
    });

    return params;
  }

  function createDefaultCurve() {
    var modelKey = defaults.curve.model;

    return {
      id: nextCurveId++,
      wavelength: defaults.curve.wavelength,
      deltaRho: defaults.curve.deltaRho,
      volumeFraction: defaults.curve.volumeFraction,
      model: modelKey,
      parameters: cloneDefaultParameters(modelKey)
    };
  }

  function numberValue(id, fallback) {
    var element = document.getElementById(id);
    var value = element ? Number(element.value) : NaN;
    return Number.isFinite(value) ? value : fallback;
  }

  function compactNumber(value) {
    if (!Number.isFinite(value)) return "";
    return Number(value.toPrecision(8)).toString();
  }

  function findCurve(curveId) {
    return curves.find(function (curve) {
      return curve.id === curveId;
    });
  }

  function curveColor(index) {
    return plotColors[index % plotColors.length];
  }

  function createNumberField(config) {
    var label = document.createElement("label");
    label.className = "field";

    var title = document.createElement("span");
    title.textContent = config.label;
    label.appendChild(title);

    var wrapper = document.createElement("div");
    wrapper.className = "input-with-unit";

    var input = document.createElement("input");
    input.type = "number";
    input.value = config.value;
    input.step = config.step !== undefined ? config.step : "any";
    if (config.min !== undefined) input.min = config.min;
    if (config.max !== undefined) input.max = config.max;

    input.addEventListener("input", function () {
      var numeric = Number(input.value);
      if (Number.isFinite(numeric)) config.onChange(numeric);
      updatePlot();
    });

    wrapper.appendChild(input);

    if (config.unit) {
      var unit = document.createElement("span");
      unit.textContent = config.unit;
      wrapper.appendChild(unit);
    }

    label.appendChild(wrapper);
    return label;
  }

  function buildModelSelect(curve) {
    var label = document.createElement("label");
    label.className = "field";

    var title = document.createElement("span");
    title.textContent = "Model";
    label.appendChild(title);

    var select = document.createElement("select");

    Object.keys(window.NDFModels).forEach(function (modelKey) {
      var option = document.createElement("option");
      option.value = modelKey;
      option.textContent = window.NDFModels[modelKey].name;
      select.appendChild(option);
    });

    select.value = curve.model;
    select.addEventListener("change", function () {
      curve.model = select.value;
      curve.parameters = cloneDefaultParameters(curve.model);
      renderCurveCards();
      updatePlot();
    });

    label.appendChild(select);
    return label;
  }

  function buildModelParameters(curve) {
    var fragment = document.createDocumentFragment();
    var model = window.NDFModels[curve.model];

    model.parameters.forEach(function (parameter) {
      if (curve.parameters[parameter.key] === undefined) {
        curve.parameters[parameter.key] = parameter.default;
      }

      fragment.appendChild(createNumberField({
        label: parameter.label,
        value: curve.parameters[parameter.key],
        unit: parameter.unit,
        min: parameter.min,
        max: parameter.max,
        step: parameter.step,
        onChange: function (value) {
          curve.parameters[parameter.key] = value;
        }
      }));
    });

    return fragment;
  }

  function renderCurveCards() {
    var container = document.getElementById("curveList");
    container.innerHTML = "";

    curves.forEach(function (curve, index) {
      var card = document.createElement("div");
      card.className = "curve-card";

      var header = document.createElement("div");
      header.className = "curve-card-header";

      var titleWrap = document.createElement("div");
      titleWrap.className = "curve-title-wrap";

      var swatch = document.createElement("span");
      swatch.className = "curve-swatch";
      swatch.style.backgroundColor = curveColor(index);

      var title = document.createElement("h3");
      title.textContent = "Curve " + (index + 1);

      titleWrap.appendChild(swatch);
      titleWrap.appendChild(title);
      header.appendChild(titleWrap);

      var actions = document.createElement("div");
      actions.className = "curve-actions";

      var duplicateButton = document.createElement("button");
      duplicateButton.type = "button";
      duplicateButton.className = "curve-action-button";
      duplicateButton.textContent = "Duplicate";
      duplicateButton.addEventListener("click", function () {
        duplicateCurve(curve.id);
      });
      actions.appendChild(duplicateButton);

      var removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "curve-action-button remove-button";
      removeButton.textContent = "Remove";
      removeButton.disabled = curves.length === 1;
      removeButton.addEventListener("click", function () {
        removeCurve(curve.id);
      });
      actions.appendChild(removeButton);

      header.appendChild(actions);
      card.appendChild(header);

      card.appendChild(createNumberField({
        label: "DFI wavelength λ",
        value: curve.wavelength,
        unit: "Å",
        min: 0,
        step: 0.01,
        onChange: function (value) {
          curve.wavelength = value;
        }
      }));

      card.appendChild(createNumberField({
        label: "SLD contrast Δρ",
        value: curve.deltaRho,
        unit: "arb.",
        step: 0.01,
        onChange: function (value) {
          curve.deltaRho = value;
        }
      }));

      card.appendChild(createNumberField({
        label: "Volume fraction φ",
        value: curve.volumeFraction,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: function (value) {
          curve.volumeFraction = value;
        }
      }));

      card.appendChild(buildModelSelect(curve));

      var modelFields = document.createElement("div");
      modelFields.className = "model-fields";
      modelFields.appendChild(buildModelParameters(curve));
      card.appendChild(modelFields);

      container.appendChild(card);
    });
  }

  function addCurve() {
    curves.push(createDefaultCurve());
    renderCurveCards();
    updatePlot();
  }

  function duplicateCurve(curveId) {
    var source = findCurve(curveId);
    if (!source) return;

    curves.push({
      id: nextCurveId++,
      wavelength: source.wavelength,
      deltaRho: source.deltaRho,
      volumeFraction: source.volumeFraction,
      model: source.model,
      parameters: Object.assign({}, source.parameters)
    });

    renderCurveCards();
    updatePlot();
  }

  function removeCurve(curveId) {
    if (curves.length <= 1) return;

    curves = curves.filter(function (curve) {
      return curve.id !== curveId;
    });

    renderCurveCards();
    updatePlot();
  }

  function getCurveName(curve, index) {
    var model = window.NDFModels[curve.model];
    var parameterText = model.parameters.map(function (parameter) {
      var value = curve.parameters[parameter.key];
      return parameter.label + " = " + value + (parameter.unit ? " " + parameter.unit : "");
    }).join(", ");

    return "Curve " + (index + 1) + " · " + model.name + (parameterText ? " · " + parameterText : "");
  }

  function getGeometry() {
    return {
      wavelength: Math.max(numberValue("geometryWavelength", defaults.geometryWavelength), 1e-12),
      gratingPeriod: Math.max(numberValue("gratingPeriod", defaults.gratingPeriod), 1e-12)
    };
  }

  function updateXAxisControls() {
    var mode = document.getElementById("xQuantity").value;
    var minLabel = document.getElementById("xMinLabel");
    var maxLabel = document.getElementById("xMaxLabel");
    var minUnit = document.getElementById("xMinUnit");
    var maxUnit = document.getElementById("xMaxUnit");
    var xMinInput = document.getElementById("xMin");
    var xMaxInput = document.getElementById("xMax");

    if (mode === "ls") {
      minLabel.textContent = "Ls min";
      maxLabel.textContent = "Ls max";
      minUnit.textContent = "mm";
      maxUnit.textContent = "mm";
      xMinInput.step = "1";
      xMaxInput.step = "10";
    } else {
      minLabel.textContent = "ξ min";
      maxLabel.textContent = "ξ max";
      minUnit.textContent = "µm";
      maxUnit.textContent = "µm";
      xMinInput.step = "0.01";
      xMaxInput.step = "0.1";
    }
  }

  function handleXQuantityChange() {
    var newMode = document.getElementById("xQuantity").value;
    var xMinInput = document.getElementById("xMin");
    var xMaxInput = document.getElementById("xMax");
    var xMin = numberValue("xMin", defaults.xMin);
    var xMax = numberValue("xMax", defaults.xMax);
    var geometry = getGeometry();

    if (newMode !== lastXQuantity) {
      if (lastXQuantity === "xi" && newMode === "ls") {
        xMin = window.NDFPhysics.lsFromCorrelationLength(xMin, geometry.wavelength, geometry.gratingPeriod);
        xMax = window.NDFPhysics.lsFromCorrelationLength(xMax, geometry.wavelength, geometry.gratingPeriod);
      } else if (lastXQuantity === "ls" && newMode === "xi") {
        xMin = window.NDFPhysics.correlationLengthFromLs(geometry.wavelength, xMin, geometry.gratingPeriod);
        xMax = window.NDFPhysics.correlationLengthFromLs(geometry.wavelength, xMax, geometry.gratingPeriod);
      }

      if (Number.isFinite(xMin)) xMinInput.value = compactNumber(xMin);
      if (Number.isFinite(xMax)) xMaxInput.value = compactNumber(xMax);
      lastXQuantity = newMode;
    }

    updateXAxisControls();
    updatePlot();
  }

  function buildCurve(curve, index, shared) {
    var model = window.NDFModels[curve.model];
    var xValues = window.NDFPhysics.linspace(shared.xMin, shared.xMax, shared.pointCount);
    var xiValues;

    if (shared.xQuantity === "ls") {
      xiValues = xValues.map(function (ls) {
        return window.NDFPhysics.correlationLengthFromLs(
          shared.geometryWavelength,
          ls,
          shared.gratingPeriod
        );
      });
    } else {
      xiValues = xValues.slice();
    }

    var y = xiValues.map(function (xi) {
      var G = model.G(xi, curve.parameters);
      var chi = model.chi(curve.parameters);

      if (shared.quantity === "lnDfi") {
        return window.NDFPhysics.calculateLnDFI(
          curve.wavelength,
          curve.deltaRho,
          curve.volumeFraction,
          G,
          chi
        );
      }

      if (shared.quantity === "normalizedLn") {
        return window.NDFPhysics.calculateNormalizedLnDFI(
          curve.deltaRho,
          curve.volumeFraction,
          G,
          chi
        );
      }

      return window.NDFPhysics.calculateDFI(
        curve.wavelength,
        curve.deltaRho,
        curve.volumeFraction,
        G,
        chi
      );
    });

    return {
      x: xValues,
      xi: xiValues,
      y: y,
      name: getCurveName(curve, index),
      quantity: shared.quantity,
      color: curveColor(index)
    };
  }

  function updatePlot() {
    var xMin = numberValue("xMin", defaults.xMin);
    var xMax = numberValue("xMax", defaults.xMax);
    var pointCount = Math.round(numberValue("pointCount", defaults.pointCount));
    var xQuantity = document.getElementById("xQuantity").value;
    var quantity = document.getElementById("yQuantity").value;
    var geometry = getGeometry();

    pointCount = Math.max(20, Math.min(2000, pointCount));
    if (xMax <= xMin) xMax = xMin + (xQuantity === "ls" ? 1 : 0.1);

    var shared = {
      xMin: xMin,
      xMax: xMax,
      xQuantity: xQuantity,
      pointCount: pointCount,
      quantity: quantity,
      geometryWavelength: geometry.wavelength,
      gratingPeriod: geometry.gratingPeriod
    };

    var plotCurves = curves.map(function (curve, index) {
      return buildCurve(curve, index, shared);
    });

    window.NDFPlot.renderPlot(plotCurves, {
      quantity: quantity,
      xQuantity: xQuantity,
      geometryWavelength: geometry.wavelength,
      gratingPeriod: geometry.gratingPeriod
    });
  }

  function resetDefaults() {
    document.getElementById("xQuantity").value = defaults.xQuantity;
    document.getElementById("xMin").value = defaults.xMin;
    document.getElementById("xMax").value = defaults.xMax;
    document.getElementById("pointCount").value = defaults.pointCount;
    document.getElementById("geometryWavelength").value = defaults.geometryWavelength;
    document.getElementById("gratingPeriod").value = defaults.gratingPeriod;
    document.getElementById("yQuantity").value = defaults.yQuantity;

    lastXQuantity = defaults.xQuantity;
    nextCurveId = 1;
    curves = [createDefaultCurve()];
    updateXAxisControls();
    renderCurveCards();
    updatePlot();
  }

  function bindEvents() {
    ["xMin", "xMax", "pointCount", "geometryWavelength", "gratingPeriod", "yQuantity"].forEach(function (id) {
      var element = document.getElementById(id);
      element.addEventListener("input", updatePlot);
      element.addEventListener("change", updatePlot);
    });

    document.getElementById("xQuantity").addEventListener("change", handleXQuantityChange);
    document.getElementById("addCurveButton").addEventListener("click", addCurve);
    document.getElementById("resetButton").addEventListener("click", resetDefaults);
  }

  function init() {
    curves = [createDefaultCurve()];
    lastXQuantity = document.getElementById("xQuantity").value;
    updateXAxisControls();
    renderCurveCards();
    bindEvents();
    updatePlot();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
