/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3var/sankey-diagram
 * Written in d3 v5*/
export default function sankeyd3(d3var, outerElementId) {
    /* Props */
    let width = 975;
    let linkList = [];
    let nodeList = [];
    let sortFunc = null;
    let nodeIdFunc = null;
    const nodeClass = 'sankey_node';
    const linkClass = 'sankey_link';
    const hideClass = 'sankey_HIDE';
    const fadeClass = 'sankey_FADE';
    let dispatch = d3var.dispatch("d3nodeclick", "d3linkclick", "d3outsideclick", "d3mouseover", "d3mouseout");
    const gradientStyle = 'heatmap';
    let nodeOutline = "#5c5c5c";
    let nodeColor = "#a2ada4";
    let linkColor = "#bababa";
    let lockHighlight = false;

    /* Formats provided ids to be displayed in a tooltip */
    let formatIds = function (idList) {
        if (idList.length === 0) {
            return '';
        }
        let formattedIds = [];
        idList.forEach((id) => {
            let idPieces = id.split('.');
            let currId = idPieces[0] + ' ' + idPieces[3] + '->' + idPieces[4];
            formattedIds.push(currId);
        });

        return idList.length + (idList.length === 1 ? ' variant: ' : ' variants: ') + formattedIds.join(', ');
    };

    let cssFormat = function (term) {
        if (term === null || '') {
            return '';
        } else {
            let terms = term.split('.');
            let formattedTerms = '';
            terms.forEach((currTerm) => {
                formattedTerms += currTerm;
                formattedTerms += '_';
            });
            // Clip off last '_'
            formattedTerms = formattedTerms.slice(0, formattedTerms.length - 1);
            return formattedTerms;
        }
    };

    /* Provides color based on name. Used only for sample coloring scheme. */
    let getLinkColor = function (nodeId, nodes) {
        let matchingNode = nodes.filter((currNode) => {
            return currNode.sampleId === nodeId;
        });
        if (matchingNode.length > 0) {
            return matchingNode[0].color;
        } else {
            return linkColor;
        }
    };

    /* Removes fade classes from all links and nodes.
     * If removeHides is true also removes hide classes from links.
     */
    let removeSankeyVizClasses = function(removeHides) {
        // Remove fade and hide from all links
        let allLinks = d3var.select('#' + outerElementId + ' > svg').selectAll('.' + linkClass);
        allLinks.classed(fadeClass, false);
        if (removeHides === true) {
            allLinks.classed(hideClass, false);
        }

        // Remove fade from all nodes
        let allNodes = d3var.select('#' + outerElementId + ' > svg').selectAll('.' + nodeClass);
        allNodes.classed(fadeClass, false);
    };

    /* Highlights the links within the provided linkId list. If linkIds is null,
     * removes any previously applied highlighting.
     * If expandHighlighting is true, highlights other links containing the
     * same variants as in the link with the given linkId.
     *
     * NOTE: all ids in linkIds MUST come from the same source!
     */
    let highlightLinks = function (linkIds, expandHighlighting, isClick) {
        let linkIdsToHighlight = {};
        let nodeIdsToHighlight = {};
        let varsInLink = {};
        let linkObjs = null;
        let otherIntervalLinks = null;
        let sideLink = null;
        let filteredLinks = null;
        let filteredNodes = null;
        let vizLink = null;
        let i = 0;
        let outerSvg = d3var.select('#' + outerElementId + ' > svg');

        if (linkIds != null && linkIds.length === 0) {
            lockHighlight = false;
            return;
        }

        /* Hover out */
        if (linkIds == null && !isClick) {
            // Regardless of lock status, want to just remove fading
            removeSankeyVizClasses(false);
        /* Hover on not locked */
        } else if (!isClick) {
            linkIds.forEach((id) => {
                linkIdsToHighlight[id] = true;
            });
            linkObjs = linkList.filter(currLink => linkIdsToHighlight[currLink.id] != null);

            if (!lockHighlight) {
                // Always want to at least highlight source and target nodes of provided link ids
                nodeIdsToHighlight[linkObjs[0].source] = true;
                nodeIdsToHighlight[linkObjs[0].target] = true;

                if (expandHighlighting === true) {
                    // Get variant ids associated with provided link ids
                    linkObjs.forEach((linkObj) => [
                        linkObj.variantIds.forEach((varId) => {
                            varsInLink[varId] = true;
                        })
                    ]);

                    // Get links outside of this interval to search variant id lists
                    otherIntervalLinks = linkList.filter((currLink) => {
                        return currLink.isSpacer === false && !(linkObjs[0].sourceModelId === currLink.sourceModelId && linkObjs[0].targetModelId === currLink.targetModelId);
                    });

                    // If the links contain one or more variants in our selected link, also highlight them
                    for (i = 0; i < otherIntervalLinks.length; i++) {
                        sideLink = otherIntervalLinks[i];
                        for (var currVar in varsInLink) {
                            if (sideLink.variantIds.includes(currVar)) {
                                linkIdsToHighlight[sideLink.id] = true;
                                nodeIdsToHighlight[sideLink.source] = true;
                                nodeIdsToHighlight[sideLink.target] = true;
                            }
                        }
                    }
                }
                // Apply highlighting to links
                filteredLinks = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + linkClass)
                    .filter(function (d) {
                    return linkIdsToHighlight[d.id] == null;
                });
                filteredLinks.classed(fadeClass, true);

                // Apply highlighting to nodes
                filteredNodes = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + nodeClass)
                    .filter(function (d) {
                    return nodeIdsToHighlight[d.sampleId + '_' + d.bottomRange] == null;
                });
                filteredNodes.classed(fadeClass, true);

            /* Hover on while locked */
            } else {
                // Check if we're hovering over hidden link
                if (linkIds.length === 1) {
                    vizLink = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + linkClass)
                        .filter((link) => {
                            return link.id === linkIds[0];
                        });
                    if (vizLink._groups[0].length === 0) {
                        return;
                    }
                } else {
                    // If we're hovering over a node and we're locked, don't want to do anything
                    return;
                }

                // Always want to at least highlight source and target nodes of provided link ids
                nodeIdsToHighlight[linkObjs[0].source] = true;
                nodeIdsToHighlight[linkObjs[0].target] = true;

                if (expandHighlighting === true) {
                    // Get variant ids associated with provided link ids
                    linkObjs.forEach((linkObj) => [
                        linkObj.variantIds.forEach((varId) => {
                            varsInLink[varId] = true;
                        })
                    ]);

                    // Get links outside of this interval to search variant id lists
                    otherIntervalLinks = linkList.filter((currLink) => {
                        return currLink.isSpacer === false && !(linkObjs[0].sourceModelId === currLink.sourceModelId && linkObjs[0].targetModelId === currLink.targetModelId);
                    });

                    // If the links contain one or more variants in our selected link, also highlight them
                    for (i = 0; i < otherIntervalLinks.length; i++) {
                        sideLink = otherIntervalLinks[i];
                        for (var currVar in varsInLink) {
                            if (sideLink.variantIds.includes(currVar)) {
                                linkIdsToHighlight[sideLink.id] = true;
                                nodeIdsToHighlight[sideLink.source] = true;
                                nodeIdsToHighlight[sideLink.target] = true;
                            }
                        }
                    }
                }

                // Apply highlighting to visible links
                filteredLinks = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + linkClass)
                    .filter(function (d) {
                    return linkIdsToHighlight[d.id] == null;
                });
                filteredLinks.classed(fadeClass, true);

                // Apply highlighting to visible nodes
                filteredNodes = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + nodeClass)
                    .filter(function (d) {
                    return nodeIdsToHighlight[d.sampleId + '_' + d.bottomRange] == null;
                });
                filteredNodes.classed(fadeClass, true);
            }
        /* Click link or node */
        } else {
            let linkIdsToStayViz = {};
            linkIds.forEach((linkId) => {
                linkIdsToStayViz[linkId] = true;
            });

            // Check if we've clicked on a hidden link
            if (linkIds.length === 1) {
                vizLink = outerSvg.selectAll('*:not(.' + hideClass + ')' + '.' + linkClass)
                    .filter((link) => {
                        return link.id === linkIds[0];
                    });
                if (vizLink._groups[0].length === 0) {
                    removeSankeyVizClasses(true);
                    lockHighlight = false;
                    return;
                }
            } else {
                // Otherwise we've clicked on a node
                removeSankeyVizClasses(true);
            }

            // Get full paths
            if (expandHighlighting === true) {
                // Get variant ids associated with provided link ids
                linkObjs = linkList.filter((currLink) => {
                    return linkIdsToStayViz[currLink.id] === true;
                });
                linkObjs.forEach((linkObj) => [
                    linkObj.variantIds.forEach((varId) => {
                        varsInLink[varId] = true;
                    })
                ]);

                // Get links outside of this interval to search variant id lists
                otherIntervalLinks = linkList.filter((currLink) => {
                    return currLink.isSpacer === false && !(linkObjs[0].sourceModelId === currLink.sourceModelId && linkObjs[0].targetModelId === currLink.targetModelId);
                });

                // If the links contain one or more variants in our selected link, also keep those visible
                for (i = 0; i < otherIntervalLinks.length; i++) {
                    sideLink = otherIntervalLinks[i];
                    for (var currVar in varsInLink) {
                        if (sideLink.variantIds.includes(currVar)) {
                            linkIdsToStayViz[sideLink.id] = true;
                            break;
                        }
                    }
                }
            }
            // Apply hiding to links
            filteredLinks = outerSvg.selectAll('.' + linkClass).filter(function (d) {
                return linkIdsToStayViz[d.id] == null;
            });
            filteredLinks.classed(hideClass, true);

            // Toggle lock ON
            lockHighlight = true;
        }
    };

    /* Highlights any links which use the node corresponding to the provided nodeId as their source,
     * along with the node itself. If expandHighlighting is true, highlights other links
     * containing the same variants as in the links with the given nodeId as their source or target,
     * along with any nodes they travel through. */
    let highlightLinksFromNode = function (nodeId, expandHighlighting, isClick) {
        if (nodeId == null) {
            removeSankeyVizClasses(isClick);
        } else {
            // Get all links with this node as source
            const sourcedLinks = linkList.filter((currLink) => {
                return currLink.source === nodeId && currLink.isSpacer === false;
            });

            // Highlight links
            let sourcedLinkIds = [];
            sourcedLinks.forEach((currLink) => {
                sourcedLinkIds.push(currLink.id);
            });
            highlightLinks(sourcedLinkIds, expandHighlighting, isClick);
        }
    };

    /* Draws actual chart */
    function chart(height) {
        // Get rid of any previous graph
        d3var.select('#' + outerElementId).selectAll('svg').remove();

        const svg = d3var.select('#' + outerElementId)
            .append('svg')
            .attr("viewBox", [0, 0, width, height])
            .on("click", () => {
                removeSankeyVizClasses(true);
            });

        var currSankey = globalSankey
            .nodeWidth(30)
            .nodePadding(10)
            .nodeId(function (d) {
                return d.sampleId + '_' + d.bottomRange;
            })
            .nodeSort(sortFunc)
            .extent([[0, 5], [width, height - 5]]);

        let {nodes, links} = currSankey({
            nodes: nodeList.map(d => Object.assign({}, d)),
            links: linkList.map(d => Object.assign({}, d))
        });

        // Draw nodes
        svg.append("g")
            .attr("id", "nodeG")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("id", d => `${d.sampleId + '_' + cssFormat(d.bottomRange)}`)
            .attr("class", nodeClass)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .style('fill', d => gradientStyle === 'sample' ? d.color : nodeColor)
            .style('stroke', gradientStyle === 'sample' ? '#888888' : nodeOutline)
            .append("title")
            .text(d => `${(d.sampleId.toUpperCase() + ': ' + d.bottomRange + '-' + d.topRange)}`)
            .style('stroke', '#888888');

        // Add listeners to nodes
        d3var.selectAll('.' + nodeClass)
            .on('mouseover', (d) => {
                let nodeId = null;
                if (d) {
                    nodeId = d.sampleId + '_' + d.bottomRange;
                }
                highlightLinksFromNode(nodeId, true, false);
            })
            .on('mouseout', () => {
                highlightLinksFromNode(null, false, false);
            })
            .on('click', (d) => {
                event.stopPropagation();
                let nodeId = null;
                if (d) {
                    nodeId = d.sampleId + '_' + d.bottomRange;
                }
                highlightLinksFromNode(nodeId, true, true);
                dispatch.call('d3nodeclick', this, {id: nodeId, pageX: event.pageX, pageY: event.pageY});
            });

        // Draw links
        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.8)
            .selectAll("g")
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        // Draw gradient
        let gradient = null;

        // Horizontal sample colored gradient
        if (gradientStyle === 'sample') {
            gradient = link.append("linearGradient")
                .attr("id", d => (d.source.sampleId + '_' + d.target.sampleId + '_gradient'))
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", d => d.source.x1)
                .attr("x2", d => d.target.x0);

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d => getLinkColor(d.source.sampleId, nodes));

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d => getLinkColor(d.target.sampleId, nodes));

            // Draw links and map to gradient
            link.append("path")
                .attr("d", d3var.sankeyLinkHorizontal())
                .style("stroke", d => d.isSpacer === true ? 'transparent' : ('url(#' + d.source.sampleId + '_' + d.target.sampleId + '_gradient)'))
                .attr("stroke-width", d => d.width)
                .attr("class", d => `${(d.isSpacer === true ? '' : linkClass)}`)
                .attr("id", d => `${(d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange))}`);

        } else if (gradientStyle === 'heatmap') {
            // Vertical gradient with heat map colors
            let outerG = d3var.select("#nodeG");
            gradient = outerG.append("defs")
                .append("linearGradient")
                .attr("id", "heatMapGradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("gradientTransform", "rotate(90)");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", '#fcfc0a');

            gradient.append("stop")
                .attr("offset", () => {
                    // Note: have to account for 90 degree flip
                    if (width > height) {
                        return height / width * 100 + '%';
                    } else {
                        return '100%';
                    }
                })  // Note: have to account for 90 degree flip
                .attr("stop-color", '#000efc');

            // Draw links and map to gradient
            link.append("path")
                .attr("d", d3var.sankeyLinkHorizontal())
                .style("stroke", d => d.isSpacer === true ? 'transparent' : 'url(#heatMapGradient)')
                .attr("stroke-width", d => d.width)
                .attr("class", d => `${(d.isSpacer === true ? '' : linkClass)}`)
                .attr("id", d => `${(d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange))}`);
        }

        link.append("title")
            .text(d => `${formatIds(d.variantIds)}`)
            .style('stroke', 'black');

        // Add listeners to links
        d3var.selectAll('.' + linkClass)
            .on('mouseover', (d) => {
                let linkId = null;
                // Only perform hover action if we're on a non-spacer link
                if (d && d.isSpacer === false) {
                    linkId = d.id;
                }
                highlightLinks([linkId], true, false);
            })
            .on('mouseout', () => {
                highlightLinks(null, false, false);
            })
            .on('click', (d) => {
                event.stopPropagation();
                let linkId = null;
                if (d && d.isSpacer === false) {
                    linkId = d.id;
                }
                highlightLinks([linkId], true, true);
                dispatch.call('d3linkclick', this, {id: linkId, pageX: event.pageX, pageY: event.pageY});
            });

        // Draw labels on nodes
        svg.append("g")
            .style("font", "10px sans-serif")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", nodeClass)
            .style("pointer-events", 'none')
            .attr("x", d => ((d.x0 + d.x1) / 2) - (d.bottomRange === '0.9' ? 12 : 9))
            .attr("y", d => ((d.y1 + d.y0) / 2) + 3)
            .text(d => d.id)
            .append("tspan")
            .text(d => `${(d.isEmpty === false ? (d.topRange * 100).toLocaleString() + '%' : '')}`)
            .style("pointer-events", 'none')
            .style('stroke', gradientStyle === 'sample' ? '#888888' : nodeOutline);

        return svg.node();
    }

    /* SETTERS */
    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.linkList = function (_) {
        if (!arguments.length) return linkList;
        linkList = _;
        return chart;
    };

    chart.nodeList = function (_) {
        if (!arguments.length) return nodeList;
        nodeList = _;
        return chart;
    };

    chart.sortFunc = function () {
        if (!arguments.length) return sortFunc;
        sortFunc = _;
        return chart;
    };

    chart.nodeIdFunc = function () {
        if (!arguments.length) return nodeIdFunc;
        nodeIdFunc = _;
        return chart;
    };

    // This adds the "on" methods to our custom exports
    d3var.rebind(chart, dispatch, "on");

    return chart;
}