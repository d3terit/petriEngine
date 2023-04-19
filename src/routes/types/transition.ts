import * as go from "gojs";

const $ = go.GraphObject.make;

const transitionAdornmentTemplate =
    $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
            $(go.Shape, "Rectangle", {
                fill: "#317CA840",
                stroke: "#317CA8",
                strokeWidth: 2,
                width: 15,
                height: 70
            }),
            $(go.Placeholder)
        ),
        $(go.Panel, "Horizontal",
            { alignment: go.Spot.Top, alignmentFocus: go.Spot.Bottom },
            $("Button",
                { click: editText },
                $(go.TextBlock, "\u270D",
                    {
                        font: "bold 10pt sans-serif",
                        desiredSize: new go.Size(15, 15),
                        textAlign: "center",
                        stroke: "#F5895F"
                    })
            ),
            $("Button",
                {
                    click: drawLink,
                    actionMove: drawLink
                },
                $(go.Shape,
                    { geometryString: "M0 0 L8 0 8 12 14 12 M12 10 L14 12 12 14" })
            ),
            $("Button",
                {
                    actionMove: dragNewNode,
                    click: clickNewNode
                },
                $(go.Shape,
                    { geometryString: "M0 0 L3 0 3 10 6 10 x F1 M6 6 A5 5 0 1 1 5 10 A5 5 0 1 1 15 10", fill: "transparent" })
            )
        )
    );

function editText(e: any, button: any) {
    var node = button.part.adornedPart;
    e.diagram.commandHandler.editTextBlock(node.findObject("TEXTBLOCK"));
}

function drawLink(e: any, button: any) {
    var node = button.part.adornedPart;
    var tool = e.diagram.toolManager.linkingTool;
    tool.startObject = node.port;
    e.diagram.currentTool = tool;
    tool.doActivate();
}

function dragNewNode(e: any, button: any) {
    var tool = e.diagram.toolManager.draggingTool;
    if (tool.isBeyondDragSize()) {
        e.diagram.startTransaction("button drag");
        var newnode = createNodeAndLink(button.part.adornedPart);
        newnode.location = e.diagram.lastInput.documentPoint;
        tool.currentPart = newnode;
        e.diagram.currentTool = tool;
        tool.doActivate();
    }
}

function createNodeAndLink(fromnode: any) {
    var diagram = fromnode.diagram;
    var model = diagram.model;
    var nodedata = model.copyNodeData(
        {
            text: "p",
            category: "lugar",
            tokens: 0,
        }
    );
    model.addNodeData(nodedata);
    var newnode = diagram.findNodeForData(nodedata);
    var linkdata = model.copyLinkData({});
    model.setFromKeyForLinkData(linkdata, model.getKeyForNodeData(fromnode.data));
    model.setToKeyForLinkData(linkdata, model.getKeyForNodeData(newnode.data));
    model.addLinkData(linkdata);
    diagram.select(newnode);
    return newnode;
}

function clickNewNode(e: any, button: any) {
    e.diagram.startTransaction("CreateNL");
    var fromnode = button.part.adornedPart;
    var newnode = createNodeAndLink(fromnode);
    newnode.location = new go.Point(fromnode.location.x + 200, fromnode.location.y);
    e.diagram.commitTransaction("CreateNL");
}

export const transitionTemplate = go.GraphObject.make(go.Node, "Spot",
    { locationSpot: go.Spot.Top },
    $(go.Shape, "Rectangle", {
        portId: "",
        fill: "#F5895F",
        stroke: null,
        width: 15,
        height: 70,
        fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
        toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
    }),
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
    ),
    $(go.Panel, "Vertical",
        {
            width: 70,
            height: 80,
        },
        $(go.TextBlock,
            {
                font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
                stroke: "#F5895F",
                textAlign: "center",
                margin: 4,
                maxSize: new go.Size(80, NaN),
                wrap: go.TextBlock.WrapFit,
                alignment: go.Spot.Left,
                editable: true
            },
            new go.Binding("text").makeTwoWay()),
    ),
    { selectionAdornmentTemplate: transitionAdornmentTemplate }
)