import * as go from "gojs";

const $ = go.GraphObject.make;

export const markTemplate = $(go.Panel, "Auto",
    new go.Binding("visible", "tokens", (value:any) => {
        var num = parseInt(value);
        return !isNaN(num) && num !== 0;
    }),
    $(go.Shape, "Circle",
        {
            fill: "#FFCC8A",
            stroke: null,
            width: 30,
            height: 30,
        }),
    $(go.TextBlock,
        {
            name: "MARKTEXT",
            font: "bold 11pt sans-serif",
            stroke: "#111",
            textAlign: "center",
            margin: 3,
            editable: true,
            textEdited: function(tb:any) {
                var value = parseInt(tb.text);
                tb.panel.visible = !isNaN(value) && value !== 0;
            }
        },
        new go.Binding("text", "tokens").makeTwoWay())
);