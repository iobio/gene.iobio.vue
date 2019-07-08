/* Adapted by SJG on Jun2019 from https://observablehq.com/@d3var/sankey-diagram */

export default function sankeyd3() {
    /* Props */
    let width = 975;
    let height = 720;
    let d3var = null;
    let container = null;
    // let data = {};

    // TODO: add hooks for enter, transition, exit - make available for outer facing component

    /* Draws actual chart */
    function chart() {
        d3var.csv("https://gist.githubusercontent.com/mbostock/2e7f869d3d198e8012125b6e85e6df94/raw/0a0cd5da868a8ecd91673aef90f577fee36b438c/titanic.csv", d3var.autoType)
            .then((data) => {
                var exKeys = data.columns.slice(0, -1);

                var color = d3var.scaleOrdinal(["Perished"], ["#da4f81"]).unknown("#ccc");

                var graph = function(keys) {
                    let i = -1;
                    const nodes = [];
                    const nodeByKey = new Map;
                    const indexByKey = new Map;
                    const links = [];

                    for (const k of keys) {
                        for (const d of data) {
                            const key = JSON.stringify([k, d[k]]);
                            if (nodeByKey.has(key)) continue;
                            const node = {name: d[k]};
                            nodes.push(node);
                            nodeByKey.set(key, node);
                            indexByKey.set(key, ++i);
                        }
                    }

                    for (let i = 1; i < keys.length; ++i) {
                        const a = keys[i - 1];
                        const b = keys[i];
                        const prefix = keys.slice(0, i + 1);
                        const linkByKey = new Map;
                        for (const d of data) {
                            const names = prefix.map(k => d[k]);
                            const key = JSON.stringify(names);
                            const value = d.value || 1;
                            let link = linkByKey.get(key);
                            if (link) { link.value += value; continue; }
                            link = {
                                source: indexByKey.get(JSON.stringify([a, d[a]])),
                                target: indexByKey.get(JSON.stringify([b, d[b]])),
                                names,
                                value
                            };
                            links.push(link);
                            linkByKey.set(key, link);
                        }
                    }

                    return {nodes, links};
                };

                const svg = d3var.select("#var-freq-viz")
                    .append('svg')
                    .attr("viewBox", [0, 0, width, height]);

                var currGraph = graph(exKeys);

                var currSankey = globalSankey;

                const {nodes, links} = currSankey({
                    nodes: currGraph.nodes.map(d => Object.assign({}, d)),
                    links: currGraph.links.map(d => Object.assign({}, d))
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
                    .text(d => `${d.name}\n${d.value.toLocaleString()}`);

                svg.append("g")
                    .attr("fill", "none")
                    .selectAll("g")
                    .data(links)
                    .join("path")
                    .attr("d", d3var.sankeyLinkHorizontal())
                    .attr("stroke", d => color(d.names[0]))
                    .attr("stroke-width", d => d.width)
                    .style("mix-blend-mode", "multiply")
                    .append("title")
                    .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

                svg.append("g")
                    .style("font", "10px sans-serif")
                    .selectAll("text")
                    .data(nodes)
                    .join("text")
                    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                    .attr("y", d => (d.y1 + d.y0) / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
                    .text(d => d.name)
                    .append("tspan")
                    .attr("fill-opacity", 0.7)
                    .text(d => ` ${d.value.toLocaleString()}`);

                return svg.node();
            });
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
    //d3var.rebind(exports, dispatch, "on");
    return chart;
}