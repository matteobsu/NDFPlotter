(function () {
  "use strict";

  function getYAxisConfig(quantity) {
    if (quantity === "lnDfi") {
      return { title: "ln(DFI)" };
    }

    if (quantity === "normalizedLn") {
      return { title: "ln(DFI) / λ²" };
    }

    return { title: "DFI" };
  }

  function getXAxisConfig(xQuantity) {
    if (xQuantity === "ls") {
      return {
        title: "Sample-detector distance Ls (mm)",
        symbol: "Ls",
        unit: "mm"
      };
    }

    return {
      title: "Correlation length ξ (µm)",
      symbol: "ξ",
      unit: "µm"
    };
  }

  function getDescription(quantity, xQuantity) {
    var yConfig = getYAxisConfig(quantity);
    var xText = xQuantity === "ls" ? "sample-detector distance Ls" : "correlation length ξ";
    return yConfig.title + " as a function of " + xText;
  }

  function renderPlot(curves, options) {
    var yConfig = getYAxisConfig(options.quantity);
    var xConfig = getXAxisConfig(options.xQuantity);

    var traces = curves.map(function (curve) {
      var hoverTemplate;

      if (options.xQuantity === "ls") {
        hoverTemplate =
          "<b>" + curve.name + "</b><br>" +
          "Ls = %{x:.4g} mm<br>" +
          "ξ = %{customdata:.4g} µm<br>" +
          yConfig.title + " = %{y:.6g}<extra></extra>";
      } else {
        hoverTemplate =
          "<b>" + curve.name + "</b><br>" +
          "ξ = %{x:.4g} µm<br>" +
          yConfig.title + " = %{y:.6g}<extra></extra>";
      }

      return {
        x: curve.x,
        y: curve.y,
        customdata: curve.xi,
        type: "scatter",
        mode: "lines",
        name: curve.name,
        line: {
          width: 3,
          color: curve.color
        },
        hovertemplate: hoverTemplate
      };
    });

    var layout = {
      margin: { l: 72, r: 24, t: 18, b: 64 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "#ffffff",
      showlegend: curves.length > 1,
      legend: {
        orientation: "h",
        x: 0,
        y: 1.02,
        xanchor: "left",
        yanchor: "bottom",
        font: { size: 11 }
      },
      xaxis: {
        title: xConfig.title,
        showgrid: true,
        zeroline: false,
        gridcolor: "#e8edf2"
      },
      yaxis: {
        title: yConfig.title,
        showgrid: true,
        zeroline: false,
        gridcolor: "#e8edf2"
      },
      font: {
        family: "Inter, ui-sans-serif, system-ui, sans-serif",
        color: "#17202a"
      },
      hovermode: "x unified"
    };

    if (options.quantity === "dfi") {
      layout.yaxis.range = [0, 1.05];
    }

    var config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"]
    };

    Plotly.react("plot", traces, layout, config);

    var description = document.getElementById("curveDescription");
    if (description) description.textContent = getDescription(options.quantity, options.xQuantity);
  }

  window.NDFPlot = {
    renderPlot: renderPlot,
    getYAxisConfig: getYAxisConfig,
    getXAxisConfig: getXAxisConfig
  };
})();
