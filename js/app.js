(function () {
  "use strict";

  var defaults = {
    xiMin: 0.01,
    xiMax: 20,
    pointCount: 300,
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
        label: "Wavelength λ",
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

  function buildCurve(curve, index, shared) {
    var model = window.NDFModels[curve.model];
    var x = window.NDFPhysics.linspace(shared.xiMin, shared.xiMax, shared.pointCount);

    var y = x.map(function (xi) {
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
      x: x,
      y: y,
      name: getCurveName(curve, index),
      quantity: shared.quantity,
      color: curveColor(index)
    };
  }

  function updatePlot() {
    var xiMin = numberValue("xiMin", defaults.xiMin);
    var xiMax = numberValue("xiMax", defaults.xiMax);
    var pointCount = Math.round(numberValue("pointCount", defaults.pointCount));
    var quantity = document.getElementById("yQuantity").value;

    pointCount = Math.max(20, Math.min(2000, pointCount));
    if (xiMax <= xiMin) xiMax = xiMin + 1;

    var shared = {
      xiMin: xiMin,
      xiMax: xiMax,
      pointCount: pointCount,
      quantity: quantity
    };

    var plotCurves = curves.map(function (curve, index) {
      return buildCurve(curve, index, shared);
    });

    window.NDFPlot.renderPlot(plotCurves, { quantity: quantity });
  }

  function resetDefaults() {
    document.getElementById("xiMin").value = defaults.xiMin;
    document.getElementById("xiMax").value = defaults.xiMax;
    document.getElementById("pointCount").value = defaults.pointCount;
    document.getElementById("yQuantity").value = defaults.yQuantity;

    nextCurveId = 1;
    curves = [createDefaultCurve()];
    renderCurveCards();
    updatePlot();
  }

  function bindEvents() {
    ["xiMin", "xiMax", "pointCount", "yQuantity"].forEach(function (id) {
      var element = document.getElementById(id);
      element.addEventListener("input", updatePlot);
      element.addEventListener("change", updatePlot);
    });

    document.getElementById("addCurveButton").addEventListener("click", addCurve);
    document.getElementById("resetButton").addEventListener("click", resetDefaults);
  }

  function init() {
    curves = [createDefaultCurve()];
    renderCurveCards();
    bindEvents();
    updatePlot();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
