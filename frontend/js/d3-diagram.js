// D3 다이어그램 플러그인
class D3DiagramPlugin {
  constructor() {
    this.containerWidth = 800;
    this.containerHeight = 500;
  }

  // 플러그인 등록
  static pluginInfo = {
    name: "d3-diagram",
    display: "D3 Diagram",
    version: "1.0.0",
    description: "D3.js based diagram plugin",
  };

  // 다이어그램 초기화
  initDiagram(container) {
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", this.containerWidth)
      .attr("height", this.containerHeight)
      .style("border", "1px solid #ccc");

    // 메인 그룹 추가
    const g = svg.append("g");

    // 줌 기능 추가
    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

    svg.call(zoom);

    return { svg, g };
  }

  // 도형 추가 기능
  addShape(g, type, data) {
    switch (type) {
      case "rect":
        return g
          .append("rect")
          .attr("x", data.x || 0)
          .attr("y", data.y || 0)
          .attr("width", data.width || 100)
          .attr("height", data.height || 50)
          .attr("fill", data.fill || "#fff")
          .attr("stroke", data.stroke || "#000")
          .call(this.dragBehavior());

      case "circle":
        return g
          .append("circle")
          .attr("cx", data.x || 0)
          .attr("cy", data.y || 0)
          .attr("r", data.r || 25)
          .attr("fill", data.fill || "#fff")
          .attr("stroke", data.stroke || "#000")
          .call(this.dragBehavior());

      case "line":
        return g
          .append("line")
          .attr("x1", data.x1 || 0)
          .attr("y1", data.y1 || 0)
          .attr("x2", data.x2 || 100)
          .attr("y2", data.y2 || 100)
          .attr("stroke", data.stroke || "#000")
          .call(this.dragBehavior());
    }
  }

  // 드래그 기능
  dragBehavior() {
    return d3
      .drag()
      .on("start", this.dragStarted)
      .on("drag", this.dragged)
      .on("end", this.dragEnded);
  }

  dragStarted(event) {
    d3.select(this).raise().classed("active", true);
  }

  dragged(event) {
    const el = d3.select(this);
    if (this.tagName === "rect" || this.tagName === "text") {
      el.attr("x", event.x).attr("y", event.y);
    } else if (this.tagName === "circle") {
      el.attr("cx", event.x).attr("cy", event.y);
    }
  }

  dragEnded() {
    d3.select(this).classed("active", false);
  }

  // 다이어그램 데이터 추출
  getDiagramData(svg) {
    const data = {
      shapes: [],
      connections: [],
    };

    svg.selectAll("rect, circle, line").each(function () {
      const el = d3.select(this);
      const shape = {
        type: this.tagName,
        attributes: {},
      };

      // 속성 추출
      Array.from(this.attributes).forEach((attr) => {
        shape.attributes[attr.name] = attr.value;
      });

      data.shapes.push(shape);
    });

    return data;
  }
}
