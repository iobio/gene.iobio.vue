/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3var/sankey-diagram */
export default function sankeyd3(d3var) {
    /* Props */
    let width = 975;
    let height = 200;
    let linkList = [];
    let nodeList = [];
    let sortFunc = null;
    let nodeIdFunc = null;
    const nodeClass = 'sankey_node';
    const linkClass = 'sankey_link';
    const emptyColor = '#e3e1e1'; // NOTE: must be synonymous w/ cohort model TODO: PASS THIS IN
    var dispatch = d3var.dispatch("d3click", "d3outsideclick", "d3mouseover", "d3mouseout");
    const color = d3var.scaleOrdinal(d3var.schemeCategory10);
    // background: linear-gradient(0.5turn, #0000ff, #ababab, #ffff00);

    /* Formats provided ids to be displayed in a tooltip */
    let formatIds = function(idList) {
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

    let cssFormat = function(term) {
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

    /* Provides color based on name */
    let getLinkColor = function (nodeId, nodes) {
        let matchingNode = nodes.filter((currNode) => {
            return currNode.sampleId === nodeId;
        });
        if (matchingNode.length > 0) {
            return matchingNode[0].color;
        } else {
            return '#bababa';
        }
    };

    /* Highlights the link corresponding to the given id.
     * If id is null, removes any previous highlighting. */
    let highlightLink = function(linkId) {
        if (linkId === null) {
            // Remove fade from all links
            let allLinks = d3var.select('#var-freq-viz > svg').selectAll('.' + linkClass);
            allLinks.classed('link_FADE', false);
        } else {
            let outerSvg = d3var.select('#var-freq-viz > svg');
            // Fade all other links
            let filteredLinks = outerSvg.selectAll('.' + linkClass).filter(function (d) {
                return (d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange)) !== linkId;
            });
            filteredLinks.classed('link_FADE', true);
        }
    };

    /* Draws actual chart */
    function chart() {
        // Get rid of any previous graph
        d3var.select("#var-freq-viz").selectAll('svg').remove();

        const svg = d3var.select("#var-freq-viz")
            .append('svg')
            .attr("viewBox", [0, 0, width, height])
            .on("click", () => {
                dispatch.call('d3outsideclick', this, null);
            });

        var currSankey = globalSankey
            .nodeWidth(10)
            .nodePadding(10)
            .nodeId(function (d) { return d.sampleId + '_' + d.bottomRange; })
            .nodeSort(sortFunc)
            .extent([[0, 5], [width, height - 5]]);

        let {nodes, links} = currSankey({
            nodes: nodeList.map(d => Object.assign({}, d)),
            links: linkList.map(d => Object.assign({}, d))
        });

        // Draw nodes
        svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("class", nodeClass)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .style('fill', d => d.color)
            .append("title")
            .text(d => `${(d.sampleId.toUpperCase() + ': ' + d.bottomRange + '-' + d.topRange)}`)
            .style('stroke', 'black');

        // Draw links
        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.8)
            .selectAll("g")
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        const gradient = link.append("linearGradient")
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

         link.append("path")
             .attr("d", d3var.sankeyLinkHorizontal())
             .style("stroke", d => ('url(#' + d.source.sampleId + '_' + d.target.sampleId + '_gradient)'))
             // .style("fill", d => ('url(#' + d.source.sampleId + '_' + d.target.sampleId + '_gradient)'))
             .attr("stroke-width", d => d.width)
             .attr("class", d => `${(d.leftColor === emptyColor ? '' : linkClass )}`)
             .attr("id", d => `${(d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange))}`);

         link.append("title")
             .text(d => `${formatIds(d.variantIds)}`)
             .style('stroke', 'black');

        // Add listeners to links
        d3var.selectAll('.' + linkClass)
            .on('mouseover', (d) => {
                let linkId = null;
                // Only perform hover action if we're on a non-transparent link
                if (d && d.source && d.target && d.leftColor !== emptyColor) {
                    linkId = d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange);
                }
                highlightLink(linkId);
            })
            .on('mouseout', () => {
                highlightLink(null);
            })
            .on('click', (d) => {
                let linkId = null;
                if (d && d.source && d.target && d.leftColor !== emptyColor) {
                    linkId = d.source.sampleId + '_' + cssFormat(d.source.bottomRange) + '_' + d.target.sampleId + '_' + cssFormat(d.target.bottomRange);
                }
                highlightLink(linkId);
                dispatch.call('d3click', this, {id: linkId, pageX: event.pageX, pageY: event.pageY});
            });

        // TODO: add y-axis from 0-1 instead of labeling nodes
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