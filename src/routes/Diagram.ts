
import * as go from "gojs";
import { Rules } from "./decorators/rules";
import { Styles } from "./decorators/styles";
import { placeTemplate } from "./types/place";
import { transitionTemplate } from "./types/transition";
export class PetriDiagram {
    myDiagram: go.Diagram;
    context = ""
    themes: any = null

    constructor(context: string) {
        this.context = context;
        this.myDiagram = new go.Diagram();
        this.themes = {
            darkTheme: {
                'text-color': 'white',
                'background-color': '#212121',
                'primary-color': '#2196F3',
                'highlight-color': '#FFC107',
            }
        }
    }

    init() {
        const $ = go.GraphObject.make;
        const CATEGORY_LUGAR = "lugar";
        const CATEGORY_TRANSICION = "transicion";
        const getNexNum = () => {
            var maxNumero = 0;
            this.myDiagram.nodes.each(function (node) {
                var nombre = node.data.text.slice(1);
                if (parseInt(nombre) > maxNumero) {
                    maxNumero = parseInt(nombre);
                }
            });
            return maxNumero + 1;
        }

        this.myDiagram = new go.Diagram(
            this.context,
            {
                allowRelink: true,
                "animationManager.initialAnimationStyle":
                    go.AnimationManager.None,
                InitialAnimationStarting: (e: { subject: { defaultAnimation: any; }; diagram: any; }) => {
                    var animation = e.subject.defaultAnimation;
                    animation.easing = go.Animation.EaseOutExpo;
                    animation.duration = 900;
                    animation.add(e.diagram, "scale", 0.1, 1);
                    animation.add(e.diagram, "opacity", 0, 1);
                },

                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                // support double-click in background creating a new node
                "clickCreatingTool.archetypeNodeData": { text: "p" + getNexNum(), category: CATEGORY_LUGAR },
                // enable undo & redo
                "undoManager.isEnabled": true,
                positionComputation: (
                    diagram: any,
                    pt: { x: number; y: number; }
                ) => {
                    return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
                },
            }
        )

        const linkValidation = (fromNode: any, fromPort: any, toNode: any, toPort: any) => 
            fromNode.data.category !== toNode.data.category;
        
        this.myDiagram.toolManager.linkingTool.linkValidation = linkValidation;

        new Rules(this.myDiagram).init();
        new Styles(this.myDiagram).init();
        
        this.myDiagram.nodeTemplateMap.add(CATEGORY_LUGAR, placeTemplate);
        this.myDiagram.nodeTemplateMap.add(CATEGORY_TRANSICION, transitionTemplate);

        if (this.myDiagram.div) this.myDiagram.div.setAttribute("style", "background-color: #111;")
    
        // when the document is modified, add a "*" to the title and enable the "Save" button
        this.myDiagram.addDiagramListener("Modified", (e) => {
            var button = document.getElementById("SaveButton");
            // @ts-ignore
            if (button) button.disabled = !this.myDiagram.isModified;
            var idx = document.title.indexOf("*");
            if (this.myDiagram.isModified) {
                if (idx < 0) document.title += "*";
            } else {
                if (idx >= 0) document.title = document.title.slice(0, idx);
            }
        });

        this.myDiagram.toolManager.draggingTool.doDeactivate = function() {  // method override must be function, not =>
            // commit "button drag" transaction, if it is ongoing; see dragNewNode, above
            if (this.diagram.undoManager.nestedTransactionNames.elt(0) === "button drag") {
              this.diagram.commitTransaction();
            }
            go.DraggingTool.prototype.doDeactivate.call(this);  // call the base method
          };

        this.myDiagram.linkTemplate = new go.Link(
            {
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                reshapable: true,
                relinkableFrom: true,
                relinkableTo: true,
                toShortLength: 3
            }
        )
            .add(
                new go.Shape({ strokeWidth: 2, stroke: "#78F5DE" }),
                new go.Shape({ toArrow: "standard", stroke: null, fill: "#78F5DE" })
            )
        this.load();
    }

    load() {
        // @ts-ignore
        this.myDiagram.model = go.Model.fromJson({
            class: "go.GraphLinksModel",
            nodeKeyProperty: "id",
            nodeDataArray: [
                { id: 0, loc: "90 15", text: "p1", category: 'lugar'},
                { id: 1, loc: "453 32", text: "p2" , category: 'transicion'},
            ],
            linkDataArray: [
                { from: 0, to: 1, text: "" },
            ],
        });
    }
}