
import * as go from "gojs";

export class PetriDiagram{
    myDiagram: go.Diagram;
    context = ""
    themes: any = null

    constructor(context:string){
        this.context = context;
        this.myDiagram = new go.Diagram();
        this.themes = {
            darkTheme:{
                'text-color': 'white',
                'background-color': '#212121',
                'primary-color': '#2196F3',
                'highlight-color': '#FFC107',
            }
        }
    }

    init() {
        const $ = go.GraphObject.make;
        const getNexNum =()=> {
            var maxNumero = 0; 
            this.myDiagram.nodes.each(function(node) {
              var nombre = node.data.text.slice(1);
              if (parseInt(nombre) > maxNumero) {
                maxNumero = parseInt(nombre);
              }
            });
            return maxNumero+1;
          }
          
        this.myDiagram = new go.Diagram(
            this.context,
            {
                "animationManager.initialAnimationStyle":
                    go.AnimationManager.None,
                InitialAnimationStarting: ( e: { subject: { defaultAnimation: any; }; diagram: any; }) => {
                    var animation = e.subject.defaultAnimation;
                    animation.easing = go.Animation.EaseOutExpo;
                    animation.duration = 900;
                    animation.add(e.diagram, "scale", 0.1, 1);
                    animation.add(e.diagram, "opacity", 0, 1);
                },
    
                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                // support double-click in background creating a new node
                "clickCreatingTool.archetypeNodeData": { text: "p" + getNexNum() },
                // enable undo & redo
                "undoManager.isEnabled": true,
                positionComputation: (
                        diagram: any,
                        pt: { x: number; y: number;}
                ) => {
                    return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
                },
            }
        )

        if(this.myDiagram.div) 
            this.myDiagram.div.setAttribute("style", "background-color: #111;")
    
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
    
        // Plantilla para nodos tipo "lugar" (círculos)
        this.myDiagram.nodeTemplateMap.add("lugar",
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                $(go.Shape, "Circle",
                    {
                        fill: "black",
                        stroke: "white",
                        strokeWidth: 2,
                        width: 40,
                        height: 40
                    }),
                $(go.TextBlock,
                    {
                        font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
                        stroke: "white",
                        textAlign: "center",
                        margin: 4,
                        maxSize: new go.Size(80, NaN),
                        wrap: go.TextBlock.WrapFit
                    },
                    new go.Binding("text").makeTwoWay())
            )
        );
    
        this.myDiagram.nodeTemplateMap.add("transicion",
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center, rotateObjectName: "SHAPE" },
                $(go.Shape, "Rectangle",
                    {
                        fill: "white",
                        stroke: "black",
                        strokeWidth: 2,
                        width: 60,
                        height: 40,
                        name: "SHAPE"
                    }),
                $(go.TextBlock,
                    {
                        font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
                        stroke: "black",
                        textAlign: "center",
                        margin: 4,
                        maxSize: new go.Size(100, NaN),
                        wrap: go.TextBlock.WrapFit
                    },
                    new go.Binding("text").makeTwoWay())
            )
        );
    
    
        // define the Node template
        this.myDiagram.nodeTemplate = $(
            go.Node,
            "Auto",
            { locationSpot: go.Spot.Top },
            $(go.Shape, "Circle",
                {
                    fill: "#111",
                    stroke: "#F5BB6D",
                    strokeWidth: 2,
                    width: 40,
                    height: 40
                }),
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
                go.Point.stringify
            ),
            $(go.TextBlock,
                {
                    font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
                    stroke: "#F5BB6D",
                    textAlign: "center",
                    margin: 4,
                    maxSize: new go.Size(80, NaN),
                    wrap: go.TextBlock.WrapFit
                },
                new go.Binding("text").makeTwoWay())
        )
    
    
        // unlike the normal selection Adornment, this one includes a Button
        this.myDiagram.nodeTemplate.selectionAdornmentTemplate = $(
            go.Adornment,
            "Spot",
            $(
                go.Panel,
                "Auto",
                $(go.Shape, "Circle",{
                    fill: "#6CC4F515",
                    stroke: "#6CC4F5",
                    strokeWidth: 2,
                    width: 40,
                    height: 40
                }),
                $(go.Placeholder) // a Placeholder sizes itself to the selected Node
            ),
            $(
                "Button",
                {
                    alignment: go.Spot.TopRight,
                    click: addNodeAndLink, // this function is defined below
                },
                $(go.Shape, "PlusLine", {
                    width: 10,
                    height: 10
                })
            ) // end button
        ); // end Adornment
        // agrega un nodo de tipo "lugar" al diagrama
        this.myDiagram.startTransaction("agregarLugar");
        this.myDiagram.model.addNodeData({ category: "lugar", text: "Lugar 1", loc: "0 0" });
        this.myDiagram.commitTransaction("agregarLugar");
    
        // Agregar un nodo tipo "transición" al diagrama
        this.myDiagram.startTransaction("agregarTransicion");
        this.myDiagram.model.addNodeData({ category: "transicion", text: "Transición 1", loc: "0 0" });
        this.myDiagram.commitTransaction("agregarTransicion");
    
        function addLink(e: { diagram: any; }, obj: { part: any; }) {
            var adornment = obj.part;
            var diagram = e.diagram;
            var model = diagram.model;
            var fromNode = adornment.adornedPart;
            var fromData = fromNode.data;
            var link = {
                from: model.getKeyForNodeData(fromData),
                to: model.getKeyForNodeData(fromData),
                text: "",
            };

            model.addLinkData(link);

            var mousePoint = diagram.lastInput.documentPoint;

            // Crear el enlace visual
            var newLink = diagram.toolManager.linkingTool.insertLink(
                fromNode.findPort(""),
                null
            );

            // Configurar la posición inicial del enlace visual
            newLink.setPoint(0, mousePoint);

            // Actualizar la posición del enlace visual en tiempo real mientras se mueve el cursor
            diagram.addDiagramListener("MouseMove", function (e: any) {
                var mousePoint = diagram.lastInput.documentPoint;
                newLink.setPoint(1, mousePoint);
            });

            // Finalizar la creación del enlace cuando se suelta el botón del mouse
            diagram.addDiagramListener("MouseUp", function (e: any) {
                var mousePoint = diagram.lastInput.documentPoint;
                newLink.setPoint(1, mousePoint);
                diagram.commitTransaction("addLink");
                diagram.removeDiagramListener("MouseMove");
                diagram.removeDiagramListener("MouseUp");
            });

            diagram.commitTransaction("addLink");
        }
        // clicking the button inserts a new node to the right of the selected node,
        // and adds a link to that new node
        function addNodeAndLink(e: { diagram: any; }, obj: { part: any; }) {
            var adornment = obj.part;
            var diagram = e.diagram;
            diagram.startTransaction("Add State");
    
            // get the node data for which the user clicked the button
            var fromNode = adornment.adornedPart;
            var fromData = fromNode.data;
            // create a new "State" data object, positioned off to the right of the adorned Node
            var toData = { text: "p" + getNexNum() };
            var p = fromNode.location.copy();
            p.x += 200;
            // @ts-ignore
            toData.loc = go.Point.stringify(p); // the "loc" property is a string, not a Point object
            // add the new node data to the model
            var model = diagram.model;
            model.addNodeData(toData);
    
            // create a link data from the old node data to the new node data
            var linkdata = {
                from: model.getKeyForNodeData(fromData), // or just: fromData.id
                to: model.getKeyForNodeData(toData),
                text: "",
            };
            // and add the link data to the model
            model.addLinkData(linkdata);
    
            // select the new Node
            var newnode = diagram.findNodeForData(toData);
            diagram.select(newnode);
    
            diagram.commitTransaction("Add State");
    
            // if the new node is off-screen, scroll the diagram to show the new node
            diagram.scrollToRect(newnode.actualBounds);
        }

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
            new go.Shape({ strokeWidth: 2, stroke: "#F5BB6D" }),
            new go.Shape({ toArrow: "standard", stroke: null, fill:"#F5BB6D" })
        )
        this.load();
    }

    load() {
        // @ts-ignore
        this.myDiagram.model = go.Model.fromJson({
            class: "go.GraphLinksModel",
            nodeKeyProperty: "id",
            nodeDataArray: [
                { id: 0, loc: "90 15", text: "p1" },
                { id: 1, loc: "453 32", text: "p2" }
            ],
            linkDataArray: [
                { from: 0, to: 1, text: "" },
            ],
        });
    }
}