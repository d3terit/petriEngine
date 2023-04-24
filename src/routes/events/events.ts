import * as go from "gojs";

export class Events{
    public myDiagram: go.Diagram;

    constructor(myDiagram: go.Diagram) {
        this.myDiagram = myDiagram;
    }

    public init() {
        this.myDiagram.addDiagramListener("ChangedSelection", _ => {
            this.checkTransitions();
        })
        this.myDiagram.addDiagramListener("Modified", _ => {
            this.checkTransitions();
        })
    }

    checkTransitions() {
        let content:any = getDiagram(this.myDiagram);
        fetch("http://127.0.0.1:8000/check_transitions", {
            method: "post",
            body: content,
        })
            .then((response) => response.json())
            .then((data) => {
                this.updateHabilitatedTransitions(data);
            }
        );
    }

    updateHabilitatedTransitions(data: any) {
        let transitions = this.myDiagram.findNodesByExample({ category: "transicion" });
        transitions.each(function (transition) { 
            transition.findObject("block")!.fill = "#555";
            transition.adornments.each(function (adornment) {
                adornment.findObject("fireButton")!.visible = false;
            });
        });
        for (let i = 0; i < data.length; i++) {
            let transition = this.myDiagram.findNodeForKey(data[i]);
            transition!.findObject("block")!.fill = "#F5895F";
            transition!.adornments.each(function (adornment) {
                adornment.findObject("fireButton")!.visible = true;
            });
        }
    }
}

export function getDiagram(content: any) {
    let diagram = content.model.toJson();
    let diagramJson = JSON.parse(diagram);
    for (let i = 0; i < diagramJson.nodeDataArray.length; i++) {
        if (!diagramJson.nodeDataArray[i].loc)  diagramJson.nodeDataArray[i].loc = "0 0";
        diagramJson.nodeDataArray[i].tokens = Number(diagramJson.nodeDataArray[i].tokens);
        if(diagramJson.nodeDataArray[i].tokens < 0) diagramJson.nodeDataArray[i].tokens = 0;
    }
    diagram = JSON.stringify(diagramJson);
    return diagram
}