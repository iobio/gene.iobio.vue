/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3var/sankey-diagram
 * Written in d3 v5*/
export default function sankeyd3(d3var, outerElementId) {
    /* Props */
    let width = 975;
    let height = 200;
    let linkList = [];
    let nodeList = [];
    let sortFunc = null;
    let nodeIdFunc = null;
    const nodeClass = 'sankey_node';
    const linkClass = 'sankey_link';
    let dispatch = d3var.dispatch("d3nodeclick", "d3linkclick", "d3outsideclick", "d3mouseover", "d3mouseout");
    const gradientStyle = 'heatmap';
    let nodeColor = "#888888";
    let linkColor = "#bababa";

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

    /* Coordinates applying sankey fade class to links */
    let highlightLink = function (linkId, expandHighlighting) {
        if (linkId === null) {
            // Remove fade from all links
            let allLinks = d3var.select('#' + outerElementId + ' > svg').selectAll('.' + linkClass);
            allLinks.classed('sankey_FADE', false);
        } else {
            // Always want to at least highlight provided link
            let linkIdsToHightlight = {};
            linkIdsToHightlight[linkId] = true;

            // If we want to highlight the paths through all node intervals
            if (expandHighlighting === true) {
                // Get variant ids within this link
                let linkObj = linkList.filter((currLink) => {
                    return currLink.id === linkId;
                });
                const varsInLink = linkObj[0].variantIds;

                // Get links outside of this interval to search variant id lists
                let otherIntervalLinks = linkList.filter((currLink) => {
                    return currLink.isSpacer === false && !(linkObj[0].sourceModelId === currLink.sourceModelId && linkObj[0].targetModelId === currLink.targetModelId);
                });

                // If the links contain one or more variants in our selected link, also highlight them
                for (let i = 0; i < otherIntervalLinks.length; i++) {
                    let currLink = otherIntervalLinks[i];
                    for (let j = 0; j < varsInLink.length; j++) {
                        let currVar = varsInLink[j];
                        if (currLink.variantIds.includes(currVar)) {
                            linkIdsToHightlight[currLink.id] = true;
                            break;
                        }
                    }
                }
            }

            let outerSvg = d3var.select('#' + outerElementId + ' > svg');
            // Fade all other links
            let filteredLinks = outerSvg.selectAll('.' + linkClass).filter(function (d) {
                return linkIdsToHightlight[d.id] == null;
            });
            filteredLinks.classed('sankey_FADE', true);
        }
    };

    /* Highlights any links which use the node corresponding to the provided nodeId as their source. */
    let highlightLinksFromNode = function (nodeId) {
        if (nodeId == null) {
            // Remove fade form all links
            let allLinks = d3var.select('#' + outerElementId + ' > svg').selectAll('.' + linkClass);
            allLinks.classed('sankey_FADE', false);

            // Remove fade from all nodes
            let allNodes = d3var.select('#' + outerElementId + ' > svg').selectAll('.' + nodeClass);
            allNodes.classed('sankey_FADE', false);
        } else {
            let outerSvg = d3var.select('#' + outerElementId + ' > svg');
            // Fade all other nodes
            let filteredNodes = outerSvg.selectAll('.' + nodeClass).filter(function (d) {
                return (d.sampleId + '_' + cssFormat(d.bottomRange)) !== nodeId;
            });
            filteredNodes.classed('sankey_FADE', true);

            // TODO: iterate through links with this node as source
            // for each link, get id and call highlight link
            // for each link, get target id and call highlight links from node - put these in lookup to avoid duplicates?
        }
    };

    /* Draws actual chart */
    function chart() {
        // Get rid of any previous graph
        d3var.select('#' + outerElementId).selectAll('svg').remove();

        const svg = d3var.select('#' + outerElementId)
            .append('svg')
            .attr("viewBox", [0, 0, width, height])
            .on("click", () => {
                //highlightLink(null);
                // TODO: add highlightnode w/ null
                //dispatch.call('d3outsideclick', this, null);
            });

        var currSankey = globalSankey
            .nodeWidth(10)
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
            .style('fill', "#888888")
            .append("title")
            .text(d => `${(d.sampleId.toUpperCase() + ': ' + d.bottomRange + '-' + d.topRange)}`)
            .style('stroke', 'black');

        // Add listeners to nodes
        d3var.selectAll('.' + nodeClass)
            .on('mouseover', (d) => {
                let nodeId = null;
                if (d) {
                    nodeId = d.sampleId + '_' + cssFormat(d.source.bottomRange);
                    highlightLinksFromNode(nodeId);
                }
            })
            .on('mouseout', () => {
                highlightLinksFromNode(null);
            })
            .on('click', (d) => {
                let nodeId = null;
                if (d) {
                    nodeId = d.sampleId + '_' + cssFormat(d.source.bottomRange);
                    highlightLinksFromNode(nodeId);
                    dispatch.call('d3nodeclick', this, {id: nodeId, pageX: event.pageX, pageY: event.pageY});
                }
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
                // Only perform hover action if we're on a non-transparent link
                if (d && d.isSpacer === false) {
                    linkId = d.id;
                }
                highlightLink(linkId, true);
            })
            .on('mouseout', () => {
                highlightLink(null);
            })
            .on('click', (d) => {
                let linkId = null;
                if (d && d.isSpacer === false) {
                    linkId = d.id;
                }
                highlightLink(linkId, true);
                dispatch.call('d3linkclick', this, {id: linkId, pageX: event.pageX, pageY: event.pageY});
            });

        // Draw labels on nodes
        svg.append("g")
            .style("font", "10px sans-serif")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.id)
            .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => `${((d.topRange * 100).toLocaleString())}`)
            .style('stroke', 'black');

        return svg.node();
    }

    /* SETTERS */
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