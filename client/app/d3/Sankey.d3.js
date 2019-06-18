/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3/sankey-diagram */

export default function sankeyD3() {
    /* Props */
    let width = 975;
    let height = 600;
    let d3var = null;
    let container = null;
    // let data = {};

    // TODO: add hooks for enter, transition, exit - make available for outer facing component

    /* HELPERS */
    function color() {
        const color = d3var.scaleOrdinal(d3var.schemeCategory10);
        return name => color(name.replace(/ .*/, ""));
    }

    function format() {
        const f = d3var.format(",.0f");
        return d => `${f(d)} TWh`;
    }

    /* Draws actual chart */
    function chart(selection, data) {
        // Change global version of d3 to variable passed in
        // let d3v3 = d3;
        // d3 = d3v5;

        // Get formatted data
        const sankey = d3.sankey()
            .nodeAlign(d3.sankeyLeft)
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 5], [width - 1, height - 5]]);

        let graph = sankey(data);
        let nodes = graph.nodes;
        let links = graph.links;

        // Start drawing
        container = selection;
        container.selectAll("svg").remove();

        container.append("svg")
            .attr("viewBox", [0, 0, width, height])
            .append("g")
            .attr("stroke", "#000")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", function (d, i) {return d.x0})
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => color(d.name));
            // .append("title")
            // .text(d => `${d.name}\n${format(d.value)}`);

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .selectAll("g")
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        // Stupid observable variable TODO: get rid of this
        let edgeColor = 'path';
        if (edgeColor === "path") {
            const gradient = link.append("linearGradient")
            //.attr("id", d => (d.uid = DOM.uid("link")).id)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", d => d.source.x1)
                .attr("x2", d => d.target.x0);

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d => color(d.source.name));

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d => color(d.target.name));
        }

        link.append("path")
            .attr("d", d3var.sankeyLinkHorizontal())
            .attr("stroke", d => edgeColor === "none" ? "#aaa"
                : edgeColor === "path" ? d.uid
                    : edgeColor === "input" ? color(d.source.name)
                        : color(d.target.name))
            .attr("stroke-width", d => Math.max(1, d.width));

        link.append("title")
            .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

        svg.append("g")
            .style("font", "10px sans-serif")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name);

        // Switch back to v3
        d3 = d3v3;

        //return svg.node();
        //});
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

    // This adds the "on" methods to our custom exports
    //d3.rebind(exports, dispatch, "on");
    return chart;
}