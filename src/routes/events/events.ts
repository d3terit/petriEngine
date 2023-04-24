import * as go from "gojs";

export class Events{
    public myDiagram: go.Diagram;

    constructor(myDiagram: go.Diagram) {
        this.myDiagram = myDiagram;
    }

    public init() {
        this.myDiagram.addDiagramListener("ChangedSelection", _ => {
            let content = this.myDiagram.model.toJson();
            fetch("http://127.0.0.1:8000/check_transitions", {
                method: "post",
                body: content,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                }
                );
        });
    }
}