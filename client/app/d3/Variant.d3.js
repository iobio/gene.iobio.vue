export default function variantD3() {
    var dispatch = d3.dispatch("d3brush", "d3rendered", "d3outsideclick", "d3click", "d3mouseover", "d3mouseout", "d3glyphmouseover", "d3glyphmouseout");

    // dimensions
    var margin = {top: 30, right: 0, bottom: 20, left: 110},
        width = 800,
        height = 100;
    // scales
    var x = d3.scale.linear(),
        y = d3.scale.linear();
    // axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top")
        .tickFormat(tickFormatter);
    // variables
    var borderRadius = 1,
        variantHeight = 10,
        regionStart = undefined,
        regionEnd = undefined,
        showXAxis = false,
        xTickFormat = null,
        heightPercent = "100%",
        widthPercent = "100%",
        showBrush = false,
        brushHeight = null,
        verticalLayers = 1,
        verticalPadding = 4,
        showTransition = true,
        lowestWidth = 3,
        dividerLevel = null,
        container = null,
        clazz = null;

    //  options
    var defaults = {};

    var tooltipHTML = function (variant) {
        return (variant.type + ': '
            + variant.start
            + (variant.end > variant.start + 1 ? ' - ' + variant.end : ""));
    }


    function getSymbol(d, i) {
        if (d.type.toUpperCase() === 'DEL') {
            return 'triangle-up';
        } else if (d.type.toUpperCase() === 'INS') {
            return 'circle';
        } else if (d.type.toUpperCase() === 'COMPLEX') {
            return 'diamond';
        }
    }

    /* Returns the value of the variant.
     * As more filters are added, they can be listed here.  */
    function getVarValue(filterName, d) {
        // Note: if filterName does not match variant prop, can add translation here
        return d[filterName];
    }

    /* Returns true if selected variant passes filter and is visible. */
    function checkForSelectedVar(selectedVarId, svgContainer) {
        let stillVisible = false;
        svgContainer.selectAll('.filtered').each(function (d, i) {
            if (d.id === selectedVarId) {
                stillVisible = true;
            }
        });
        return stillVisible;
    }

    var showCircle = function (d, svgContainer, indicateMissingVariant, pinned) {
        // Find the matching variant
        var matchingVariant = null;
        // Only matching if visible
        svgContainer.selectAll(".variant.filtered").each(function (variant, i) {
            if (d.start === variant.start
                && d.end === variant.end
                && d.ref === variant.ref
                && d.alt === variant.alt
                && d.type.toLowerCase() === variant.type.toLowerCase()) {

                if (variant.zygosity != null && variant.zygosity.toLowerCase() === 'homref') {
                    // we want to show an "x" for homozygous reference variants
                    // instead of a circle
                } else {
                    matchingVariant = variant;
                }
            }
        });

        // Get the x for this position
        if (matchingVariant) {
            var mousex = x(matchingVariant.start);
            var mousey = height - ((matchingVariant.level + 1) * (variantHeight + verticalPadding));


            var circleClazz = pinned ? '.pinned.circle' : '.hover.circle';
            var circle = svgContainer.select(circleClazz);
            circle.transition()
                .duration(200)
                .style("opacity", 1);
            circle.attr("cx", mousex + margin.left + 2)
                .attr("cy", mousey + margin.top + 4);


            var matrix = circle.node()
                .getScreenCTM()
                .translate(+circle.node().getAttribute("cx"), +circle.node().getAttribute("cy"));
            var boundRect = circle.node().getBoundingClientRect();

            // Firefox doesn't consider the transform (slideout's shift left) with the getScreenCTM() method,
            // so instead the app will use getBoundingClientRect() method instead which does take into consideration
            // the transform.
            matchingVariant.screenX = d3.round(boundRect.left + (boundRect.width / 2));

            // Since the body is vertically scrollable, we need to calculate the y by offsetting to a height of the
            // scroll position in the container.
            matchingVariant.screenY = d3.round((window.pageYOffset + matrix.f + margin.top) - boundRect.height);

            //showCoordinateFrame(matchingVariant.screenX);

        } else if (indicateMissingVariant) {
            var mousex = d3.round(x(d.start));
            var mousey = height - verticalPadding;


            var arrowClazz = pinned ? 'g.pinned.arrow' : 'g.hover.arrow';
            var garrow = svgContainer.select(arrowClazz);
            garrow.attr("transform", "translate(" + (mousex + margin.left - variantHeight / 2) + "," + (mousey + margin.top - 6) + ")");
            garrow.selectAll('.arrow').transition()
                .duration(200)
                .style("opacity", 1);
        }
        return matchingVariant;
    };


    var hideCircle = function (svgContainers, pinned) {
        var circleClazz = pinned ? '.pinned.circle' : '.hover.circle';
        var pinnedArrowClazz = 'g.pinned.arrow';
        var hoverArrowClazz = 'g.hover.arrow';
        svgContainers.selectAll(circleClazz).transition()
            .duration(500)
            .style("opacity", 0);
        if (pinned) {
            svgContainers.selectAll(pinnedArrowClazz).selectAll(".arrow").transition()
                .duration(500)
                .style("opacity", 0);
        }
        if (!pinned) {
            svgContainers.selectAll(hoverArrowClazz).selectAll(".arrow").transition()
                .duration(500)
                .style("opacity", 0);
        }
    };

    /* Takes in a list of filter classes. If a variant contains any of them, it will be hidden.
    *  Takes in a filter cutoff object that a variant must meet or be lower than - if not, it will be hidden. */
    var filterVariants = function (filterClasses, filterCutoffs, svgContainer) {
        let allVariants = svgContainer.selectAll(".variant");

        // Add filtered class to all variants on DOM and model object
        allVariants.classed({'filtered': true});
        allVariants.each(function(d,i) {
           d.passesFilters = true;
        });

        // If we're out of active filters, display all variants
        if (filterClasses.length === 0 && filterCutoffs.length === 0) {
            allVariants.style("opacity", 1);
            allVariants.style("pointer-events", 'auto');
            return false;
        }

        // Remove filtered class for any variants that contain the given class criteria
        filterClasses.forEach((filterClass) => {
            allVariants.filter(filterClass).classed({'filtered': false});
            allVariants.style("pointer-events", 'none');
        });

        // Include previously filtered variants into the equation
        let filteredVars = svgContainer.selectAll('.filtered');

        // Remove filtered class for any variants that don't meet cutoffs
        let cutoffs = Object.values(filterCutoffs);
        if (cutoffs.length > 0) {
            filteredVars.each(function (d, i) {
                if (d === 0) {
                    return;
                }
                cutoffs.forEach((cutoff) => {
                    let filterName = cutoff[0];
                    let filterLogic = cutoff[1];
                    let filterCutoffVal = parseFloat(cutoff[2]);
                    let varVal = getVarValue(filterName, d);
                    let passesFilter = true;

                    switch (filterLogic) {
                        case '<':
                            if (!(varVal < filterCutoffVal)) {
                                passesFilter = false;
                            }
                            break;
                        case '<=':
                            if (!(varVal <= filterCutoffVal)) {
                                passesFilter = false;
                            }
                            break;
                        case '=':
                            if (!(varVal === filterCutoffVal)) {
                                passesFilter = false;
                            }
                            break;
                        case '>=':
                            if (!(varVal >= filterCutoffVal)) {
                                passesFilter = false;
                            }
                            break;
                        case '>':
                            if (!(varVal > filterCutoffVal)) {
                                passesFilter = false;
                            }
                            break;
                        default:
                        // Do nothing
                    }
                    // Do actual hiding
                    if (!passesFilter) {
                        d.passesFilters = false;

                        let selectionId = '#' + d.id;
                        let domD = svgContainer.selectAll(selectionId);
                        domD.classed({'filtered': false});
                        domD.style('pointer-events', 'none');
                    }
                })
            });
        }

        // Re-check for all filtered variants
        filteredVars = svgContainer.selectAll('.filtered');

        // Hide all variants
        allVariants.style("opacity", 0)
            .style("pointer-events", "none")
            .transition()
            .duration(1000);

        // Reveal variants that pass filter
        filteredVars.style("opacity", 1)
            .style("pointer-events", "auto");


        // Return whether any variants are still visible
        if (filteredVars && filteredVars[0]) {
            return filteredVars[0].length === 0;
        } else {
            return false;
        }
    };

    /* Updates styling classes applied to variants. Utilized in somatic filter application. */
    var updateVariantClasses = function(svgContainer) {
        let allVariants = svgContainer.selectAll(".variant");

        // REPLACE classes here (except filter status - this is guaranteed by classifyByImpact)
        allVariants.attr('class', function (d) {
                return chart.clazz()(d);
            });
    };

    function chart(selection, options) {
        // merge options and defaults
        options = $.extend(defaults, options);

        if (verticalLayers == null) {
            verticalLayers = 1;
        }

        // Recalculate the height based on the number of vertical layers
        // Not sure why, but we have to bump up the layers by one; otherwise,
        // y will be negative for first layer
        height = verticalLayers * (variantHeight + verticalPadding);
        height += (variantHeight + verticalPadding);
        // Account for the margin when we are showing the xAxis
        if (showXAxis) {
            height += margin.bottom;
        }
        if (dividerLevel) {
            height += (variantHeight + verticalPadding);
        }
        var dividerY = dividerLevel ? height - ((dividerLevel + 1) * (variantHeight + verticalPadding)) : null;


        // determine inner height (w/o margins)
        var innerHeight = height - margin.top - margin.bottom;

        selection.each(function (data) {

            // set svg element
            container = d3.select(this).classed('ibo-variant', true);


            container.selectAll("svg").remove();

            if (data && data.length > 0 && data[0] && data[0].features && data[0].features.length > 0) {

                // Update the x-scale.
                if (regionStart && regionEnd) {
                    x.domain([regionStart, regionEnd]);
                } else {
                    x.domain([d3.min(data, function (d) {
                        return d3.min(d.features, function (f) {
                            return parseInt(f.start);
                        })
                    }),
                        d3.max(data, function (d) {
                            return d3.max(d.features, function (f) {
                                return parseInt(f.end);
                            })
                        })
                    ]);

                }
                x.range([0, width - margin.left - margin.right]);

                // Update the y-scale.
                y.domain([0, data.length]);
                y.range([innerHeight, 0]);

                // Find out the smallest interval between variants on the x-axis
                // for each level. For a single nucleotide variant, what is
                // the standard width we would like to show given the minimum
                // distance between all variants.
                // TODO:  Need to use this as a factor for increasing
                // width of multi-base variants.
                var minWidth = 6;
                // For each level
                for (var l = 0; l < verticalLayers; l++) {
                    // For each row in array (per variant set; only one variant set)
                    var minInterval = null;
                    data.forEach(function (d) {
                        // For each variant.  Calculate the distance on the screen
                        // between the 2 variants.
                        for (var i = 0; i < d.features.length - 1; i++) {
                            if (d.features[i].level == l) {
                                // find the next feature at the same level
                                var nextPos = null;
                                for (var next = i + 1; next < d.features.length; next++) {
                                    if (d.features[next].level == l) {
                                        nextPos = next;
                                        break;
                                    }
                                }
                                if (nextPos) {
                                    var interval = Math.round(x(d.features[nextPos].start) - x(d.features[i].end));
                                    interval = Math.max(interval, 1);
                                    if (minInterval == null || interval < minInterval) {
                                        minInterval = interval;
                                    }
                                } else {
                                    // We couldn't find a second position at the same
                                    // level
                                }
                            }
                        }
                        // Once we know the smallest interval for a level, compare it
                        // so that we can keep track of the smallest between all levels.
                        // This will determine the width of a snp.
                        if (minInterval != null && minInterval < minWidth) {
                            minWidth = minInterval;
                        }

                    });
                }

                // TODO:  Come up with a better pileup algorithm to ensure
                // there is at least one pixel between each variant.  This
                // works if the variant can be 1 pixel width, but we really want
                // to signify a square for snps.  For now, try out
                // a rectangle with a min width of 3.
                minWidth = Math.max(minWidth, lowestWidth);

                // TODO:  Need to review this code!!!  Added for exhibit
                minWidth = variantHeight;

                var symbolScaleCircle = d3.scale.ordinal()
                    .domain([3, 4, 5, 6, 7, 8, 10, 12, 14, 16])
                    .range([9, 15, 25, 38, 54, 58, 70, 100, 130, 260]);
                var symbolSizeCircle = symbolScaleCircle(minWidth);

                var symbolScale = d3.scale.ordinal()
                    .domain([3, 4, 5, 6, 7, 8, 10, 12, 14, 16])
                    .range([9, 15, 20, 25, 32, 58, 70, 100, 130, 160]);

                var symbolSize = symbolScale(minWidth);


                // Brush
                var brush = d3.svg.brush()
                    .x(x)
                    .on("brushend", function () {
                        dispatch.d3brush(brush);
                    });


                // Select the svg element, if it exists.
                var svg = container.selectAll("svg").data([0]);


                svg.enter()
                    .append("svg")
                    .attr("width", widthPercent)
                    .attr("height", heightPercent)
                    .attr('viewBox', "0 0 " + parseInt(width + margin.left + margin.right) + " " + parseInt(height + margin.top + margin.bottom))
                    .attr("preserveAspectRatio", "none")
                    .append("g")
                    .attr("class", "group")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.on("click", function (d) {
                    dispatch.d3outsideclick(null);
                })

                var g = svg.select("g.group");


                // The chart dimensions could change after instantiation, so update viewbox dimensions
                // every time we draw the chart.
                d3.select(this).selectAll("svg")
                    .filter(function () {
                        return this.parentNode === container.node();
                    })
                    .attr('viewBox', "0 0 " + parseInt(width + margin.left + margin.right) + " " + parseInt(height + margin.top + margin.bottom));


                // Add grouping for flagged variants
                svg.select("g.flagged-variants").remove();
                svg.append("g")
                    .attr("class", "flagged-variants");


                // Create the X-axis.
                g.selectAll(".x.axis").remove();
                if (showXAxis) {
                    g.append("g").attr("class", "x axis").attr("transform", "translate(0," + (y.range()[0] + margin.bottom) + ")");
                }

                // Create dividing line
                g.selectAll(".divider").remove();
                if (dividerLevel) {
                    var divider = g.append("g")
                        .attr("class", "divider")
                        .attr("transform", "translate(0," + dividerY + ")");
                    divider.append("line").attr("class", "dashed")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("y", 0);
                    divider.append("text").attr("x", width / 2)
                        .attr("y", 20)
                        .text("Heterozygous");
                    divider.append("text").attr("x", width / 2)
                        .attr("y", -10)
                        .text("Homozygous");

                }


                // add tooltip div
                var tooltip = container.selectAll(".tooltip").data([0])
                    .enter().append('div')
                    .attr("class", "tooltip")
                    .style("opacity", 0);


                // Start variant model
                // add elements
                var track = g.selectAll('.track.snp').data(data);
                track.enter().append('g')
                    .attr('class', 'track snp')
                    .attr('transform', function (d, i) {
                        return "translate(0," + y(i + 1) + ")"
                    });

                var trackindel = g.selectAll('.track.indel').data(data);
                trackindel.enter().append('g')
                    .attr('class', 'track indel')
                    .attr('transform', function (d, i) {
                        return "translate(0," + y(i + 1) + ")"
                    });


                if (showBrush) {
                    if (brushHeight == null) {
                        brushHeight = variantHeight;
                        brushY = 0;
                    } else {
                        brushY = 0;
                    }
                    track.selectAll("g.x.brush").data([0]).enter().append("g")
                        .attr("class", "x brush")
                        .call(brush)
                        .selectAll("rect")
                        .attr("y", brushY)
                        .attr("height", brushHeight);
                }


                track.selectAll('.variant').remove();
                trackindel.selectAll('.variant').remove();


                // snps
                track.selectAll('.variant').data(function (d) {
                    return d['features'].filter(function (d) {
                        return d.type.toUpperCase() == 'SNP' || d.type.toUpperCase() == 'MNP';
                    });
                }).enter().append('rect')
                    .attr('class', function (d) {
                        return chart.clazz()(d);
                    })
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr('rx', borderRadius)
                    .attr('ry', borderRadius)
                    .attr('x', function (d) {
                        return Math.round(x(d.start) - (minWidth / 2) + (minWidth / 4));
                    })
                    .attr('width', function (d) {
                        //            return showTransition ? 0 : Math.max(Math.round(x(d.end) - x(d.start)), minWidth);
                        return showTransition ? 0 : variantHeight;
                    })
                    .attr('y', function (d) {
                        return showTransition ? 0 : height - ((d.level + 1) * (variantHeight + verticalPadding));
                    })
                    .attr('height', variantHeight);


                // insertions and deletions
                trackindel.selectAll('.variant').data(function (d) {
                    var indels = d['features'].filter(function (d) {
                        return d.type.toUpperCase() == 'DEL'
                            || d.type.toUpperCase() == 'INS'
                            || d.type.toUpperCase() == 'COMPLEX';
                    });
                    return indels;
                }).enter().append('path')
                    .attr("d", function (d, i) {
                        return d3.svg
                            .symbol()
                            .type(getSymbol(d, i))
                            .size(symbolSize)();
                    })
                    .attr('class', function (d) {
                        return chart.clazz()(d);
                    })
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr("transform", function (d) {
                        var xCoord = x(d.start) + 2;
                        var yCoord = showTransition ? 0 : height - ((d.level + 1) * (variantHeight + verticalPadding)) + 3;
                        var tx = "translate(" + xCoord + "," + yCoord + ")";
                        return tx;
                    });


                g.selectAll('.variant')
                    .on("click", function (d) {
                        dispatch.d3click(d);
                        d3.event.stopPropagation();
                    })
                    .on("mouseover", function (d) {
                        dispatch.d3mouseover(d);
                    })
                    .on("mouseout", function (d) {
                        dispatch.d3mouseout();
                    });


                // exit
                track.exit().remove();
                trackindel.exit().remove();

                // update
                if (showTransition) {
                    var interval = 1000 / data[0].features.length;

                    track.transition()
                        .duration(1000)
                        .attr('transform', function (d, i) {
                            return "translate(0," + y(i + 1) + ")"
                        });


                    track.selectAll('.variant.snp, .variant.mnp').sort(function (a, b) {
                        return parseInt(a.start) - parseInt(b.start)
                    })
                        .transition()
                        .duration(1000)
                        .delay(function (d, i) {
                            return i * interval;
                        })
                        .ease("bounce")
                        .attr('x', function (d) {
                            return d3.round(x(d.start) - (minWidth / 2) + (minWidth / 4));
                        })
                        .attr('width', function (d) {
                            // TODO:  Need to review!!
                            //                return Math.max(Math.round(x(d.end) - x(d.start)), minWidth);
                            return variantHeight;
                        })
                        .attr('y', function (d) {
                            return height - ((d.level + 1) * (variantHeight + verticalPadding));
                        })
                        .attr('height', function (d) {
                            return variantHeight;
                        });

                    trackindel.selectAll('.variant.del')
                        .transition()
                        .duration(1000)
                        .delay(function (d, i) {
                            return i * interval;
                        })
                        .ease("bounce")
                        .attr("d", function (d, i) {
                            return d3.svg
                                .symbol()
                                .type(getSymbol(d, i))
                                .size(symbolSize)();
                        })
                        .attr("transform", function (d) {
                            var xCoord = x(d.start) + 2;
                            var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding)) + 3;
                            var tx = "translate(" + xCoord + "," + yCoord + ")";
                            return tx;
                        });

                    trackindel.selectAll('.variant.ins')
                        .transition()
                        .duration(1000)
                        .delay(function (d, i) {
                            return i * interval;
                        })
                        .ease("bounce")
                        .attr("d", function (d, i) {
                            return d3.svg
                                .symbol()
                                .type(getSymbol(d, i))
                                .size(symbolSizeCircle)();
                        })
                        .attr("transform", function (d) {
                            var xCoord = x(d.start) + 2;
                            var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding)) + 3;
                            var tx = "translate(" + xCoord + "," + yCoord + ")";
                            return tx;
                        });

                    trackindel.selectAll('.variant.complex')
                        .transition()
                        .duration(1000)
                        .delay(function (d, i) {
                            return i * interval;
                        })
                        .attr("d", function (d, i) {
                            return d3.svg
                                .symbol()
                                .type(getSymbol(d, i))
                                .size(symbolSize)();
                        })
                        .attr("transform", function (d) {
                            var xCoord = x(d.start) + 2;
                            var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding)) + 3;
                            var tx = "translate(" + xCoord + "," + yCoord + ")";
                            return tx;
                        });


                }


                // Generate the x axis
                if (showXAxis) {
                    if (xTickFormat) {
                        xAxis.tickFormat(xTickFormat);
                    }
                    svg.select(".x.axis").transition()
                        .duration(200)
                        .call(xAxis);
                }


                // add a circle and arrows for 'hover' event and 'pinned' event
                ['hover', 'pinned'].forEach(function (clazz) {
                    var circleClazz = '.' + clazz + '.circle';
                    if (svg.selectAll(circleClazz).empty()) {
                        svg.selectAll(circleClazz).data([0])
                            .enter().append('circle')
                            .attr("class", clazz + " circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", variantHeight + 2)
                            .style("opacity", 0);
                    }

                    var arrowClazz = 'g.' + clazz + '.arrow';
                    if (svg.selectAll(arrowClazz).empty()) {
                        //svg.selectAll("g.arrow").remove();
                        var garrow = svg.selectAll(arrowClazz).data([0])
                            .enter().append("g")
                            .attr("class", clazz + " arrow")
                            .attr("transform", "translate(1,0)");

                        garrow.append('line')
                            .attr("class", "arrow arrow-line")
                            .attr("x1", variantHeight + 2)
                            .attr("x2", -2)
                            .attr("y1", variantHeight + 2)
                            .attr("y2", 0)
                            .style("opacity", 0);
                        garrow.append('line')
                            .attr("class", "arrow arrow-line")
                            .attr("x1", variantHeight + 2)
                            .attr("x2", -2)
                            .attr("y1", 0)
                            .attr("y2", variantHeight + 2)
                            .style("opacity", 0);
                    }
                });
                dispatch.d3rendered();
            }
        });

    }

    chart.showFlaggedVariant = function (svg, variant, key) {

        // Find the matching variant
        var matchingVariant = null;
        svg.selectAll(".variant").each(function (d, i) {
            if (d.start == variant.start
                && d.end == variant.end
                && d.ref == variant.ref
                && d.alt == variant.alt
                && d.type.toLowerCase() == variant.type.toLowerCase()) {
                matchingVariant = d;
            }
        });
        if (!matchingVariant) {
            return;
        }


        // Get the x, y for the variant's position
        var mousex = d3.round(x(matchingVariant.start));
        var mousey = height - ((matchingVariant.level + 1) * (variantHeight + verticalPadding));

        var xpos = 0;
        var ypos = mousey - 2;
        if (variant.type.toUpperCase() == "DEL" || variant.type.toUpperCase() == "COMPLEX") {
            xpos = mousex;
        } else if (variant.type.toUpperCase() == "INS") {
            xpos = mousex - .5;
        } else {
            xpos = mousex + .5;
        }

        var group = svg.select("g.flagged-variants")
            .append("g")
            .attr("class", "flagged-variant")
            .attr("id", key ? key : "")
            .attr("transform", "translate(" + xpos + "," + ypos + ")");


        var flagGroup = group.append("g")
            .attr("transform", "translate(-5,-5)");
        flagGroup.append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20);

        return chart;

    }


    chart.removeFlaggedVariant = function (svg, variant) {
        // Find the matching variant
        var matchingVariant = null;
        svg.selectAll(".variant").each(function (d, i) {
            if (d.start === variant.start
                && d.end === variant.end
                && d.ref === variant.ref
                && d.alt === variant.alt
                && d.type.toLowerCase() === variant.type.toLowerCase()) {
                matchingVariant = d;
            }
        });
        if (!matchingVariant) {
            return;
        }
    };

    function tickFormatter(d) {
        if ((d / 1000000) >= 1)
            d = d / 1000000 + "M";
        else if ((d / 1000) >= 1)
            d = d / 1000 + "K";
        return d;
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
    chart.variantHeight = function (_) {
        if (!arguments.length) return variantHeight;
        variantHeight = _;
        return chart;
    };
    chart.regionStart = function (_) {
        if (!arguments.length) return regionStart;
        regionStart = _;
        return chart;
    };
    chart.regionEnd = function (_) {
        if (!arguments.length) return regionEnd;
        regionEnd = _;
        return chart;
    };
    chart.showXAxis = function (_) {
        if (!arguments.length) return showXAxis;
        showXAxis = _;
        return chart;
    };
    chart.xTickFormat = function (_) {
        if (!arguments.length) return xTickFormat;
        xTickFormat = _;
        return chart;
    };
    chart.showBrush = function (_) {
        if (!arguments.length) return showBrush;
        showBrush = _;
        return chart;
    };
    chart.brushHeight = function (_) {
        if (!arguments.length) return brushHeight;
        brushHeight = _;
        return chart;
    };
    chart.verticalLayers = function (_) {
        if (!arguments.length) return verticalLayers;
        verticalLayers = _;
        return chart;
    };
    chart.verticalPadding = function (_) {
        if (!arguments.length) return verticalPadding;
        verticalPadding = _;
        return chart;
    };
    chart.showTransition = function (_) {
        if (!arguments.length) return showTransition;
        showTransition = _;
        return chart;
    };
    chart.clazz = function (_) {
        if (!arguments.length) return clazz;
        clazz = _;
        return chart;
    };
    chart.lowestWidth = function (_) {
        if (!arguments.length) return lowestWidth;
        lowestWidth = _;
        return chart;
    };
    chart.dividerLevel = function (_) {
        if (!arguments.length) return dividerLevel;
        dividerLevel = _;
        return chart;
    };
    chart.tooltipHTML = function (_) {
        if (!arguments.length) return tooltipHTML;
        tooltipHTML = _;
        return chart;
    };
    chart.showCircle = function (_) {
        if (!arguments.length) return showCircle;
        showCircle = _;
        return chart;
    };
    chart.hideCircle = function (_) {
        if (!arguments.length) return hideCircle;
        hideCircle = _;
        return chart;
    };
    chart.filterVariants = function (_) {
        if (!arguments.length) return filterVariants;
        filterVariants = _;
        return chart;
    };
    chart.updateVariantClasses = function (_) {
        if (!arguments.length) return updateVariantClasses;
        updateVariantClasses = _;
        return chart;
    };

    // This adds the "on" methods to our custom exports
    d3.rebind(chart, dispatch, "on");

    return chart;
}