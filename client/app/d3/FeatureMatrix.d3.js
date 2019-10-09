export default function featureMatrixD3() {
    var dispatch = d3.dispatch("d3click", "d3mouseover", "d3mouseout", "d3rowup", "d3rowdown");

    // dimensions
    var margin = {top: 20, right: 10, bottom: 10, left: 20};
    // scales
    var x = d3.scale.ordinal(),
        y = d3.scale.ordinal();


    var container = null;

    var tooltipHTML = function (colObject, rowIndex) {
        return "tootip at row " + rowIndex;
    }

    var _adjustTooltipCoordinates = function (variant) {
        return;
    }

    var columnLabel = function (d, i) {
        return d;
    }
    var columnLabelClass = function (d, i) {
        return "";
    }
    var columnLabelSymbol = null;

    // variables
    var heightPercent = "100%",
        widthPercent = "100%",
        height = null,
        width = null,
        showTransition = true,
        matrixColumns = null,
        matrixColumnNames = null,
        cellSize = 20,
        cellWidth = null,
        cellHeight = null,
        cellWidths = null,
        cellHeights = null,
        rowLabelWidth = 300,
        columnLabelHeight = 100,
        columnLabelShift = 80;
    //  options
    var defaults = {};
    var global = null;
    var translator = null;

    var selectVariant = function (variant, clazz) {
        if (variant != null) {
            if (clazz == null) {
                clazz = "current";
            }
            container.selectAll("g.group>g.group>.row .rowbox").classed(clazz, false);
            container.selectAll("g.group>g.group>.row").each(function (d, i) {
                if (d.start === variant.start &&
                    d.ref === variant.ref &&
                    d.alt === variant.alt) {
                    d3.select(this).select(".rowbox").classed(clazz, true);
                }
            });

        } else {
            if (container) {
                if (clazz) {
                    container.selectAll("g.group>g.group>.row .rowbox").classed(clazz, false);
                } else {
                    container.selectAll("g.group>g.group>.row .rowbox").attr('class', function (d, i) {
                        return "rowbox";
                    });

                }
            }
        }
    };

    var getVarRowLabel = function(feature) {
        let info = global.utility.formatDisplay(feature, translator, false);

        let varLabel = '';
        // varLabel += global.utility.translateVariantType(feature.type, true); this is already in the matrix...
        varLabel += global.utility.translateExonInfo(info.exon, true);
        varLabel += '.' + info.refalt;

        if (varLabel.length > 12) {
            varLabel = varLabel.substring(0, 11) + '...';
        }
        return varLabel;

    };


    function chart(selection, options) {
        var me = this;
        // merge options and defaults
        options = $.extend(defaults, options);

        matrixColumnNames = matrixColumns.map(function(col) {
            return col.name;
        });

        selection.each(function (data) {
            // Calculate height of matrix

            var firstCellHeight = null;
            var firstCellWidth = null;
            var matrixHeight = null;
            var matrixWidth = null; // TODO: not using for the moment but probably need to...
            if (cellHeights && cellHeights.length > 0) {
                matrixHeight = cellHeights.reduce(function (pv, cv) {
                    return pv + cv;
                }, 0);
                firstCellHeight = cellHeights[0];

            } else {
                matrixHeight = data.length * (cellHeight != null ? cellHeight: cellSize);
                firstCellHeight = (cellHeight != null ? cellHeight : cellSize);
            }
            if (cellWidths && cellWidths.length > 0) {
                matrixHeight = cellWidths.reduce(function (pv, cv) {
                    return pv + cv;
                }, 0);
                firstCellWidth = cellWidths[0];
            } else {
                matrixWidth = data.length * (cellWidth != null ? cellHeight: cellSize);
                firstCellWidth = (cellWidth != null ? cellWidth : cellSize);
            }
            height = matrixHeight;
            const legendHeight = firstCellHeight * 3;
            height += legendHeight;  // Include legend in height
            height += margin.top + margin.bottom;
            if (options.showColumnLabels) {
                height += columnLabelHeight;
            }
            var innerHeight = height - margin.top - margin.bottom - legendHeight;

            if (options.showColumnLabels) {
                innerHeight -= columnLabelHeight;
            }

            width = matrixColumnNames.length * (cellWidth != null ? cellWidth : cellSize);
            width += margin.left + margin.right + rowLabelWidth + (cellWidth != null ? cellWidth : cellSize);
            var innerWidth = width - margin.left - margin.right - rowLabelWidth;

            y.domain(data.map(function (d, i) {
                return (i+1) + '. ' + getVarRowLabel(d);
            }));
            y.rangeRoundBands([0, innerHeight], 0);

            x.domain(matrixColumnNames);
            x.rangeRoundBands([0, innerWidth], 0, 0);

            // axis
            var xAxis = d3.svg.axis()
                             .scale(x)
                             .orient("start")
                             .ticks(matrixColumnNames.length);


            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .outerTickSize(0)
                .ticks(data.length);

            // Select the svg element, if it exists.
            container = d3.select(this);
            container.selectAll('svg').remove();
            var svg = container.selectAll("svg").data([0]);

            svg.enter()
                .append("svg")
                .attr("width", parseInt(width))
                .attr("height", heightPercent)
                .attr('viewBox', "0 0 " + parseInt(width) + " " + parseInt(height))
                .attr("preserveAspectRatio", "none")
                .style("display", "block")
                .style("margin", "auto");

            // The chart dimensions could change after instantiation, so update viewbox dimensions
            // every time we draw the chart.
            d3.select(this).selectAll("svg")
                .filter(function () {
                    return this.parentNode === container.node();
                })
                .attr("width", parseInt(width))
                .attr('viewBox', "0 0 " + parseInt(width) + " " + parseInt(height))
                .append("g")
                .attr("class", "group")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var topLevelGroup = svg.select("g.group");

            // Generate the column headers
            topLevelGroup.selectAll("g.colhdr").remove();
            if (options.showColumnLabels) {
                var translateColHdrGroup = "";
                if (options.simpleColumnLabels) {
                    if (cellWidth) {
                        translateColHdrGroup = "translate(" + (+(parseInt(rowLabelWidth) + 6) + (cellWidth / 2) - 4) + "," + columnLabelHeight + ")";
                    } else {
                        translateColHdrGroup = "translate(" + (+(parseInt(rowLabelWidth) + 6)) + "," + (columnLabelHeight - 4) + ")";
                    }
                } else {
                    translateColHdrGroup = "translate(" + (+(parseInt(rowLabelWidth) + 6) + ((cellWidth != null ? cellWidth : cellSize) / 2)) + "," + columnLabelShift + ")";
                }
                var colhdrGroup = topLevelGroup.selectAll("g.colhdr").data([matrixColumnNames])
                    .enter()
                    .append("g")
                    .attr("class", "colhdr")
                    .attr("transform", translateColHdrGroup);

                var colhdrs = colhdrGroup.selectAll('.colhdr')
                    .data(matrixColumnNames)
                    .enter()
                    .append('g')
                    .attr('class', 'colhdr')
                    .attr('transform', function (d, i) {
                        return "translate(" + ((cellWidth != null ? cellWidth : cellSize) * (i)) + ",0)";

                    });

                if (columnLabelSymbol) {
                    columnLabelSymbol(colhdrs, {cellSize: cellSize});
                }


                colhdrs.append("text")
                    .style("text-anchor", options.simpleColumnLabels ? "middle" : "start")
                    .attr("dx", ".8em")
                    .attr("dy", ".15em")
                    .attr("transform", function (d) {
                        if (options.simpleColumnLabels) {
                            return "";
                        } else {
                            return "rotate(-65)";
                        }
                    })
                    .text(function(d) { return d; })
                    .attr('class', columnLabelClass);
            }

            topLevelGroup.selectAll("g.group").remove();
            var g = topLevelGroup.selectAll("g.group").data([matrixColumnNames])
                .enter()
                .append("g")
                .attr("class", "group")
                .attr("transform", "translate(" + (parseInt(rowLabelWidth) + 10) + "," + columnLabelHeight + ")");


            // Create the y-axis - shows labels for rows
            topLevelGroup.selectAll(".y.axis").remove();
            topLevelGroup.selectAll("g.y").data([data]).enter()
                .append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (rowLabelWidth - 20) + "," + (options.showColumnLabels ? columnLabelShift : "0") + ")")
                .call(yAxis)
                .selectAll("text")
                .style("text-anchor", "start")
                .style("text-overflow", "ellipsis")
                .attr("x", "-75");

            // Add the up and down arrows to the x-axis
            topLevelGroup.selectAll("g.y.axis .tick .up").remove();
            topLevelGroup.selectAll("g.y.axis .tick")
                .append("g")
                .attr("class", "up faded")
                .attr("transform", "translate(" + (+rowLabelWidth - 60) + ", -24)")
                .append("use")
                .attr("id", "arrow-up")
                .attr("xlink:href", "#arrow-up-symbol")
                .attr("width", 44)
                .attr("height", 44)
                .on("click", function (d, i) {
                    // We want to mark the row label that is going to be shifted up
                    // or down so that after the matrix is resorted and rewdrawn,
                    // the row that the user was moving is highlighted to show the
                    // user what row we just shifted up or down..
                    matrixColumns.forEach(function(matrixCol) {
                        matrixCol.current = 'N';
                    });
                    matrixColumns[i].current = 'Y';
                    container.select(".y.axis").selectAll("text").each(function (d1, i1) {
                        if (i1 === i) {
                            d3.select(this).classed('current', true);
                        } else {
                            d3.select(this).classed('current', false);
                        }
                    });
                    // When the user clicks on the 'up' button for a row label,
                    // disppatch the event so that the app can shift
                    // the rows and re-sort the matrix data.
                    dispatch.d3rowup(i);
                })
                .on("mouseover", function (d, i) {
                    container.selectAll('.y.axis .up').classed("faded", true);
                    container.selectAll('.y.axis .down').classed("faded", true);
                    d3.select(this.parentNode).classed("faded", false);
                    container.selectAll('.y.axis text').classed("active", false);
                    d3.select(this.parentNode.parentNode).select("text").classed("active", true);
                });


            topLevelGroup.selectAll("g.y.axis .tick .down").remove();
            topLevelGroup.selectAll("g.y.axis .tick")
                .append("g")
                .attr("class", "down faded")
                .attr("transform", "translate(" + (+rowLabelWidth - 40) + ", -24)")
                .append("use")
                .attr("id", "arrow-down")
                .attr("xlink:href", "#arrow-down-symbol")
                .attr("width", 44)
                .attr("height", 44)
                .on("click", function (d, i) {
                    // We want to mark the row label that is going to be shifted up
                    // or down so that after the matrix is resorted and rewdrawn,
                    // the row that the user was moving is highlighted to show the
                    // user what row we just shifted up or down..
                    matrixColumns.forEach(function (matrixCol) {
                        matrixCol.current = 'N';
                    });
                    matrixColumns[i].current = 'Y';
                    container.select(".y.axis").selectAll("text").each(function (d1, i1) {
                        if (i1 === i) {
                            d3.select(this).classed('current', true);
                        } else {
                            d3.select(this).classed('current', false);
                        }
                    });
                    // When the user clicks on the 'up' button for a row label,
                    // disppatch the event so that the app can shift
                    // the rows and re-sort the matrix data.
                    dispatch.d3rowdown(i);
                })
                .on("mouseover", function (d, i) {
                    container.selectAll('.y.axis .up').classed("faded", true);
                    container.selectAll('.y.axis .down').classed("faded", true);
                    d3.select(this.parentNode).classed("faded", false);
                    container.selectAll('.y.axis text').classed("active", false);
                    d3.select(this.parentNode.parentNode).select("text").classed("active", true);

                });

            // Highlight of the last row label that we moved up or down.  Highlight this
            // row label so that user can keep track of the row he just moved.
            topLevelGroup.selectAll(".y.axis .tick text").each(function (d, i) {
                d3.select(this).classed('current', data[i].current === 'Y');
            });
            // On the highlight matrix row, don't fade the arrow buttons.
            topLevelGroup.selectAll(".y.axis .tick .up").each(function (d, i) {
                d3.select(this).classed('faded', data[i].current !== 'Y');
            });
            topLevelGroup.selectAll(".y.axis .tick .down").each(function (d, i) {
                d3.select(this).classed('faded', data[i].current !== 'Y');
            });

            // Hide the ticks and the path of the x-axis, we are just interested
            // in the text
            topLevelGroup.selectAll("g.y.axis .tick line").classed("hide", true);
            topLevelGroup.selectAll("g.y.axis path").classed("hide", true);

            // Adjust the y-axis transform attribute so that translate(x,y) changes y
            // to cell heights
            // if (cellHeights != null && cellHeights.length > 0) {
            //     topLevelGroup.selectAll("g.y.axis g.tick").each(function (d, i) {
            //         var y = 0;
            //         for (var idx = 0; idx < i; idx++) {
            //             y += cellHeights[idx];
            //         }
            //         y += 8;
            //         d3.select(this).attr('transform', 'translate(0,' + y + ')');
            //     })
            // }

            // Generate the rows
            var rows = g.selectAll('.row').data(data);
            rows.enter().append('g')
                .attr('class', function (d) {
                    return "row row_" + d.id;
                })
                .attr('transform', function (d, i) {
                    return "translate(" + "0," + ((cellHeight != null ? cellHeight : cellSize) * (i)) + ")";
                });

            // Generate cells
            var cells = rows.selectAll('.cell').data(function (d) {
                return d['features'];
            }).enter().append('g')
                .attr('class', "cell")
                .attr('transform', function (d, i) {
                    let xPos = 0;
                    if (cellWidths && cellWidths.length > 0) {
                        let pos = (i + 1) % data.length;
                        if (pos === 0) {
                            pos = data.length;
                        }
                        for (let idx = 0; idx < pos - 1; idx++) {
                            xPos += cellWidths[idx];
                        }
                        xPos = xPos + firstCellWidth;
                    } else {
                        xPos = x(matrixColumnNames[i]) - (2 * i);
                    }
                    return 'translate(' + xPos + ',0)';
                });

            cells.append('rect')
                .attr('class', "cellbox")
                .attr('x', 0)
                .attr('height', function (d, i) {
                    if (cellHeights && cellHeights.length > 0) {
                        var pos = (i + 1) % matrixColumns.length;
                        if (pos === 0) {
                            pos = matrixColumns.length - 1;
                        } else {
                            pos = pos - 1;
                        }
                        return cellHeights[pos] - 1;
                    } else {
                        return (cellHeight != null ? cellHeight : cellSize) - 1;
                    }
                })
                .attr('y', 0)
                .attr('width', (cellWidth != null ? cellWidth : cellSize) - 1);



            cells.append("text")
                .text(function (d, i) {
                    return d.symbolFunction !== 'sampleRow' ? d.value : "";
                })
                .attr("class", function (d, i) {
                    if (!d.isText) {
                        return "hide";
                    } else {
                        return "";
                    }
                })
                .attr("x", 4)
                .attr("y", function (d, i) {
                    return (y.rangeBand() / 2) + 2;
                });


            var symbolCells = cells.filter(function (d, i) {
                return matrixColumns[i].symbol != null;
            });

            // Build color scale
            let colors = ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe", "#045a8d"];
            var colorScale = d3.scale.quantile()
                .domain([0, 100])
                .range(colors);

            cells.each(function (d, i) {
                if (d.symbolFunction === 'sampleRow') {
                    let afColor = colorScale(d.value);
                    // TODO: small values are coming in as null and pulling first val
                    d3.select(this).select('.cellbox')
                        .style("fill", afColor);
                } else {
                    var symbolFunction = d.symbolFunction;
                    if (symbolFunction) {
                        d3.select(this).call(symbolFunction, {
                            'self': d.bindTo,
                            'cellSize': (cellWidth != null ? cellWidth : cellSize),
                            'color': d.color
                        });
                    }
                }
            });

            // Add row bound so that we can highlight on hovers & clicks
            rows.append('rect')
                .attr('class', 'rowbox')
                .attr('x', function () {
                    return 1;
                })
                .attr('height', function () {
                    return (cellHeight != null ? cellHeight : cellSize) - 1;
                })
                .attr('width', function() {
                    return ((matrixColumnNames.length * (cellWidth != null ? cellWidth : cellSize)) - 1);
                });

            // Draw color scale legend (sourced from http://bl.ocks.org/tjdecke/5558084)
            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            const legendBuffer = firstCellHeight * 2;

            legend.enter().append("g")
                .attr("class", "legend");

            let legendCellScale = 3;
            legend.append("rect")
                .attr("x", function(d, i) { return (rowLabelWidth - 90) + (cellSize * legendCellScale * i); })
                .attr("y", matrixHeight + legendBuffer + columnLabelHeight)
                .attr("width", cellSize * legendCellScale)
                .attr("height", firstCellHeight)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .text(function(d, i) { return '≥ ' + Math.round(100/colors.length * i) + '%'; })
                .attr("x", function(d, i) { return (rowLabelWidth - 80) + (cellSize * legendCellScale * i); })
                .attr("y", matrixHeight + columnLabelHeight + (legendBuffer + (firstCellHeight * 1.55)))
                .attr('class', columnLabelClass);

            legend.exit().remove();

            // Just draw label for first legend element
            d3.select(".legend")
                .append("text")
                .text("AF Scale")
                .attr("x", rowLabelWidth)
                .attr("y", matrixHeight + legendBuffer + columnLabelHeight - 2)
                .attr("class", columnLabelClass);

            g.selectAll('rect.cellbox')
                .on("mouseover", function (d) {
                    var rowObject = d3.select(this.parentNode.parentNode).datum();

                    var row = d3.select(this.parentNode.parentNode);
                    row.classed("active", true);

                    // Get screen coordinates of column.  We will use this to position the
                    // tooltip above the column.
                    var matrix = row.node()
                        .getScreenCTM()
                        .translate(+row.node().getAttribute("cx"), +row.node().getAttribute("cy"));

                    // Firefox doesn't consider the transform (slideout's shift left) with the getScreenCTM() method,
                    // so instead the app will use getBoundingClientRect() method instead which does take into consideration
                    // the transform.
                    var boundRect = row.node().getBoundingClientRect();
                    rowObject.screenXMatrix = d3.round(boundRect.left + boundRect.width);

                    // Since the body is vertically scrollable, we need to calculate the y by offsetting to a height of the
                    // scroll position in the container.
                    rowObject.screenYMatrix = window.pageYOffset + matrix.f; //+ margin.top;

                    // If tooltip sits outside of the of the feature matrix, so make necessary adjustments
                    chart.adjustTooltipCoordinates()(rowObject);

                    dispatch.d3mouseover(rowObject);
                })
                .on("mouseout", function (d) {
                    var column = d3.select(this.parentNode.parentNode);
                    column.classed("active", false);

                    dispatch.d3mouseout();
                })
                .on("click", function (d, i) {
                    var colObject = d3.select(this.parentNode.parentNode).datum();

                    if (d.clickFunction) {
                        d.clickFunction(colObject, d);
                    }

                    var colIndex = Math.floor(i / matrixColumnNames.length);
                    var on = !(d3.select(this.parentNode.parentNode).select(".rowbox").attr("class").indexOf("current") > -1);
                    d3.select(this.parentNode.parentNode.parentNode).select(".rowbox.current").classed("current", false);
                    if (on) {
                        d3.select(this.parentNode.parentNode).select(".rowbox").classed("current", on);
                        dispatch.d3click(colObject);
                    } else {
                        dispatch.d3click();
                    }
                });

            // update
            /*
            if (showTransition) {
              cols.transition()
                  .duration(1000)
                  .attr('transform', function(d,i) {
                      return "translate(" + (x.rangeBand() * (i+1)) + ",0)";
                  });


              cols.selectAll('rect.cell')
                    .transition()
                    .duration(1000)
                    .attr('x', function(d,i) {
                      return 0;
                    })
                    .attr('width', function(d) {
                      return  cellSize - 1;
                    })
                    .attr('y', function(d, i) {
                      return y(matrixRowNames[i]) + y.rangeBand();
                    })
                    .attr('height', function(d) {
                      return cellSize - 1;
                    });

            }
            */
        });

    }

    chart.columnLabel = function (_) {
        if (!arguments.length) {
            return columnLabel;
        } else {
            columnLabel = _;
            return chart;
        }
    }

    chart.columnLabelClass = function (_) {
        if (!arguments.length) {
            return columnLabelClass;
        } else {
            columnLabelClass = _;
            return chart;
        }
    }


    chart.columnLabelSymbol = function (_) {
        if (!arguments.length) {
            return columnLabelSymbol;
        } else {
            columnLabelSymbol = _;
            return chart;
        }
    }

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.widthPercent = function (_) {
        if (!arguments.length) return widthPercent;
        widthPercent = _;
        return chart;
    };

    chart.heightPercent = function (_) {
        if (!arguments.length) return heightPercent;
        heightPercent = _;
        return chart;
    };

    chart.adjustTooltipCoordinates = function (_) {
        if (!arguments.length) return _adjustTooltipCoordinates;
        _adjustTooltipCoordinates = _;
        return chart;
    }

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.xAxis = function (_) {
        if (!arguments.length) return xAxis;
        xAxis = _;
        return chart;
    };

    chart.yAxis = function (_) {
        if (!arguments.length) return yAxis;
        yAxis = _;
        return chart;
    };


    chart.showTransition = function (_) {
        if (!arguments.length) return showTransition;
        showTransition = _;
        return chart;
    }

    chart.matrixColumns = function (_) {
        if (!arguments.length) return matrixColumns;
        matrixColumns = _;
        return chart;
    }

    chart.cellSize = function (_) {
        if (!arguments.length) return cellSize;
        cellSize = _;
        return chart;
    }


    chart.cellWidth = function (_) {
        if (!arguments.length) {
            return cellWidth;
        } else {
            cellWidth = _;
            return chart;
        }
    }

    chart.cellHeight = function (_) {
        if (!arguments.length) {
            return cellHeight;
        } else {
            cellHeight = _;
            return chart;
        }
    }

    chart.cellHeights = function (_) {
        if (!arguments.length) {
            return cellHeights;
        } else {
            cellHeights = _;
            return chart;
        }
    }

    chart.cellWidths = function (_) {
        if (!arguments.length) {
            return cellWidths;
        } else {
            cellWidths = _;
            return chart;
        }
    }

    chart.rowLabelWidth = function (_) {
        if (!arguments.length) return rowLabelWidth;
        rowLabelWidth = _;
        return chart;
    }
    chart.columnLabelHeight = function (_) {
        if (!arguments.length) return columnLabelHeight;
        columnLabelHeight = _;
        return chart;
    }
    chart.tooltipHTML = function (_) {
        if (!arguments.length) return tooltipHTML;
        tooltipHTML = _;
        return chart;
    }

    chart.selectVariant = function (_) {
        if (!arguments.length) {
            return selectVariant;
        } else {
            selectVariant = _;
            return chart;
        }
    }

    chart.highlightVariant = function (_) {
        if (!arguments.length) {
            return highlightVariant;
        } else {
            highlightVariant = _;
            return chart;
        }
    }

    chart.global = function (_) {
        if (!arguments.length) {
            return global;
        } else {
            global = _;
            return chart;
        }
    }

    chart.translator = function (_) {
        if (!arguments.length) {
            return translator;
        } else {
            translator = _;
            return chart;
        }
    }


    // This adds the "on" methods to our custom exports
    d3.rebind(chart, dispatch, "on");

    return chart;
}