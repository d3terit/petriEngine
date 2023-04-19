export class Styles {
    public myDiagram: go.Diagram;

    constructor(myDiagram: go.Diagram) {
        this.myDiagram = myDiagram;
    }

    public init() {
        const cambiarEstiloEditorTexto = () => {
            // Obtiene el cuadro de edición de texto predeterminado del Diagrama
            const textEditor = this.myDiagram.toolManager.textEditingTool.defaultTextEditor;

            // Aplica un estilo personalizado al cuadro de edición de texto ocultando el borde y el fondo
            //La propiedad 'css' no existe en el tipo 'HTMLElement'.
            textEditor.mainElement?.setAttribute("style", "border: none; background-color: #111; color: #F5BB6D");
        }

        cambiarEstiloEditorTexto();
        
    }
}