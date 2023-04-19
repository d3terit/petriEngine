
import * as go from "gojs";

export class Rules {
    public myDiagram: go.Diagram;

    constructor(myDiagram: go.Diagram) {
        this.myDiagram = myDiagram;
    }

    public init() {
        const $ = go.GraphObject.make;
        
        this.myDiagram.grid =
            $(go.Panel, "Grid",
                $(go.Shape, "LineH", {
                    strokeWidth: 0.5,
                    strokeDashArray: [0, 9.5, 0.5, 0],
                    stroke: "#F5BB6D50"
                })
            );

        var gradScaleHoriz =
            $(go.Part, "Graduated",
              { graduatedTickUnit: 10, pickable: false, layerName: "Grid", isAnimated: false },
              $(go.Shape, { geometryString: "M0 0 H400", stroke: "#6CC4F590" }),
              $(go.Shape, { geometryString: "M0 0 V3", interval: 1, stroke: "#6CC4F590" }),
              $(go.Shape, { geometryString: "M0 0 V15", interval: 10, stroke: "#6CC4F590" }),
              $(go.TextBlock,
                {
                  font: "10px sans-serif",
                  interval: 10,
                  alignmentFocus: go.Spot.TopLeft,
                  segmentOffset: new go.Point(0, 7),
                  stroke: "#6CC4F590"
                }
              )
            );
    
          var gradScaleVert =
            $(go.Part, "Graduated",
              { graduatedTickUnit: 10, pickable: false, layerName: "Grid", isAnimated: false },
              $(go.Shape, { geometryString: "M0 0 V400", stroke: "#6CC4F590" }),
              $(go.Shape, { geometryString: "M0 0 V3", interval: 1, alignmentFocus: go.Spot.Bottom, stroke: "#6CC4F590" }),
              $(go.Shape, { geometryString: "M0 0 V15", interval: 10, alignmentFocus: go.Spot.Bottom, stroke: "#6CC4F590" }),
              $(go.TextBlock,
                {
                  font: "10px sans-serif",
                  segmentOrientation: go.Link.OrientOpposite,
                  interval: 10,
                  alignmentFocus: go.Spot.BottomLeft,
                  segmentOffset: new go.Point(0, -7),
                  stroke: "#6CC4F590"
                }
              )
            );
    
          var gradIndicatorHoriz =
            $(go.Part,
              {
                pickable: false, layerName: "Grid", visible: false,
                isAnimated: false, locationSpot: go.Spot.Top
              },
              $(go.Shape, { geometryString: "M0 0 V15", strokeWidth: 2, stroke: "#FFF" })
            );
    
          var gradIndicatorVert =
            $(go.Part,
              {
                pickable: false, layerName: "Grid", visible: false,
                isAnimated: false, locationSpot: go.Spot.Left
              },
              $(go.Shape, { geometryString: "M0 0 H15", strokeWidth: 2, stroke: "#FFF" })
            );
    
            const setupScalesAndIndicators = () => {
                this.myDiagram.commit(d => {
                  // Add each node to the diagram
                  d.add(gradScaleHoriz);
                  d.add(gradScaleVert);
                  d.add(gradIndicatorHoriz);
                  d.add(gradIndicatorVert);
                  updateScales();
                  updateIndicators();
                }, null);  // null says to skip UndoManager recording of changes
              }
        
          // Add listeners to keep the scales/indicators in sync with the viewport
          this.myDiagram.addDiagramListener("InitialLayoutCompleted", setupScalesAndIndicators);
          this.myDiagram.mouseEnter = () => showIndicators(true);
          this.myDiagram.mouseLeave = () => showIndicators(false);
          this.myDiagram.addDiagramListener("ViewportBoundsChanged", e => { updateScales(); updateIndicators(); });
    
          // Override mousemove Tools such that doMouseMove will keep indicators in sync
          this.myDiagram.toolManager.doMouseMove = function() {  // method override must be function, not =>
            go.ToolManager.prototype.doMouseMove.call(this);
            updateIndicators();
          }
          this.myDiagram.toolManager.linkingTool.doMouseMove = function() {  // method override must be function, not =>
            go.LinkingTool.prototype.doMouseMove.call(this);
            updateIndicators();
          }
          this.myDiagram.toolManager.draggingTool.doMouseMove = function() {  // method override must be function, not =>
            go.DraggingTool.prototype.doMouseMove.call(this);
            updateIndicators();
          }
          this.myDiagram.toolManager.dragSelectingTool.doMouseMove = function() {  // method override must be function, not =>
            go.DragSelectingTool.prototype.doMouseMove.call(this);
            updateIndicators();
          }
          // No need to override PanningTool since the ViewportBoundsChanged listener will fire
    
          const updateScales = (vb:any=null) => {
            if (!vb) vb = this.myDiagram.viewportBounds;
            if (!vb.isReal()) return;
            this.myDiagram.commit(diag => {
              // Update properties of horizontal scale to reflect viewport
              gradScaleHoriz.elt(0).width = vb.width * diag.scale;
              gradScaleHoriz.location = new go.Point(vb.x, vb.y);
              gradScaleHoriz.graduatedMin = vb.x;
              gradScaleHoriz.graduatedMax = vb.right;
              gradScaleHoriz.scale = 1 / diag.scale;
              // Update properties of vertical scale to reflect viewport
              gradScaleVert.elt(0).height = vb.height * diag.scale;
              gradScaleVert.location = new go.Point(vb.x, vb.y);
              gradScaleVert.graduatedMin = vb.y;
              gradScaleVert.graduatedMax = vb.bottom;
              gradScaleVert.scale = 1 / diag.scale;
            }, null);
          }
    
          const updateIndicators = () => {
            var vb = this.myDiagram.viewportBounds;
            if (!vb.isReal()) return;
            this.myDiagram.commit(diag => {
              var mouseCoords = diag.lastInput.documentPoint;
              // Keep the indicators in line with the mouse as viewport changes or mouse moves
              gradIndicatorHoriz.location = new go.Point(Math.max(mouseCoords.x, vb.x), vb.y);
              gradIndicatorHoriz.scale = 1 / diag.scale;
              gradIndicatorVert.location = new go.Point(vb.x, Math.max(mouseCoords.y, vb.y));
              gradIndicatorVert.scale = 1 / diag.scale;
            }, null);
          }
    
          // Show indicators on mouseEnter of the diagram div; hide on mouseLeave
          const showIndicators = (show:any) => {
            this.myDiagram.commit(diag => {
              gradIndicatorHoriz.visible = show;
              gradIndicatorVert.visible = show;
            }, null);
          }

        }
    }