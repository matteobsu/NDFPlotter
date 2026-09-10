(function () {
  "use strict";

  function getYAxisConfig(quantity) {
    if (quantity === "lnDfi") {
      return {
        title: "ln(DFI)",
        description: "ln(DFI) as a function of correlation length ξ"
      };
    }

    if (quantity === "normalizedLn") {
      return {
        title: "ln(DFI) / λ²",
        description: "Normalized log dark-field signal as a function of correlation length ξ"
      };
    }

    return {
      title: "DFI",
      description: "DFI as a function of correlation length ξ"
    };
  }

  function renderPlot(curves, options) {
    var yConfig = getYAxisConfig(options.quantity);

    var traces = curves.map(function (curve) {
      return {
        x: curve.x,
        y: curve.y,
        type: "scatter",
        mode: "lines",
        name: curve.name,
        line: {
          width: 3,
          color: curve.color
        },
        hovertemplate:
          "<b>" + curve.name + "</b><br>" +
          "ξ = %{x:.4g} µm<br>" +
          yConfig.title + " = %{y:.6g}<extra></extra>"
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
        title: "Correlation length ξ (µm)",
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
    if (description) description.textContent = yConfig.description;
  }

  window.NDFPlot = {
    renderPlot: renderPlot,
    getYAxisConfig: getYAxisConfig
  };
})();
