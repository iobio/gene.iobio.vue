/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3var/sankey-diagram */

export default function sankeyd3() {
    /* Props */
    let width = 975;
    let height = 200;
    let d3var = null;
    let linkList = [];
    let nodeList = [];
    let sortFunc = null;
    let nodeIdFunc = null;

    // TODO: add hooks for enter, transition, exit - make available for outer facing component
    /* Draws actual chart */
    function chart() {
        var color = d3var.scaleOrdinal(["Perished"], ["#da4f81"]).unknown("#ccc");

        const svg = d3var.select("#var-freq-viz")
            .append('svg')
            .attr("viewBox", [0, 0, width, height]);

        var currSankey = globalSankey
            .nodeWidth(10)
            // .nodeAlign(d3var.sankeyJustify)
            // .nodePadding(20)
            .nodeId(function (d) { return d.sampleId + '_' + d.bottomRange; })
            .nodeSort(sortFunc)
            .extent([[0, 5], [width, height - 5]]);

        let {nodes, links} = currSankey({
            nodes: nodeList.map(d => Object.assign({}, d)),
            links: linkList.map(d => Object.assign({}, d))
        });

        svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .append("title")
            .text(d => ` ${(d.sampleId + '_' + d.bottomRange.toLocaleString())}`)
            .style('stroke', 'black');

        svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(links)
            .join("path")
            .attr("d", d3var.sankeyLinkHorizontal())
            .attr("stroke", d => d.color)
            .attr("stroke-width", d => d.width)
            .style("mix-blend-mode", "multiply")
            .append("title")
            .text(d => `${d.value.toLocaleString()}`)
            .style('stroke', 'black');

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
            .text(d => ` ${(d.sampleId + '_' + d.bottomRange.toLocaleString())}`)
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

    chart.d3var = function (_) {
        if (!arguments.length) return d3var;
        d3var = _;
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
    //d3var.rebind(exports, dispatch, "on");
    return chart;
}