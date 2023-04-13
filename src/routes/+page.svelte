<script>
	import * as go from "gojs";
	// let context = document.getElementById('myDiagramDiv');  Document is not defined
	//solve this by using onMount:
	import { onMount } from "svelte";

	onMount(() => {
		/**
		 * @type {go.Diagram}
		 */
		let myDiagram;
		function init() {
			const $ = go.GraphObject.make; // for conciseness in defining templates

			let count = 0;
			// some constants that will be reused within templates
			var roundedRectangleParams = {
				parameter1: 2, // set the rounded corner
				spot1: go.Spot.TopLeft,
				spot2: go.Spot.BottomRight, // make content go all the way to inside edges of rounded corners
				figure: "RoundedRectangle",
			};

			myDiagram = $(
				go.Diagram,
				"myDiagramDiv", // must name or refer to the DIV HTML element
				{
				"animationManager.initialAnimationStyle":
					go.AnimationManager.None,
				InitialAnimationStarting: (
					/** @type {{ subject: { defaultAnimation: any; }; diagram: any; }} */ e
				) => {
					var animation = e.subject.defaultAnimation;
					animation.easing = go.Animation.EaseOutExpo;
					animation.duration = 900;
					animation.add(e.diagram, "scale", 0.1, 1);
					animation.add(e.diagram, "opacity", 0, 1);
				},

				// have mouse wheel events zoom in and out instead of scroll up and down
				"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
				// support double-click in background creating a new node
				"clickCreatingTool.archetypeNodeData": { text: "p"+count++ },
				// enable undo & redo
				"undoManager.isEnabled": true,
				positionComputation: (
					/** @type {any} */ diagram,
					/** @type {{ x: number; y: number; }} */ pt
				) => {
					return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
				},
				}
			);

			// when the document is modified, add a "*" to the title and enable the "Save" button
			myDiagram.addDiagramListener("Modified", (e) => {
				var button = document.getElementById("SaveButton");
				// @ts-ignore
				if (button) button.disabled = !myDiagram.isModified;
				var idx = document.title.indexOf("*");
				if (myDiagram.isModified) {
				if (idx < 0) document.title += "*";
				} else {
				if (idx >= 0) document.title = document.title.slice(0, idx);
				}
			});

			// Plantilla para nodos tipo "lugar" (círculos)
			myDiagram.nodeTemplateMap.add("lugar",
				$(go.Node, "Spot",
				{ locationSpot: go.Spot.Center },
				$(go.Shape, "Circle",
					{
					fill: "white",
					stroke: "black",
					strokeWidth: 2,
					width: 40,
					height: 40
					}),
				$(go.TextBlock,
					{
					font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
					stroke: "black",
					textAlign: "center",
					margin: 4,
					maxSize: new go.Size(80, NaN),
					wrap: go.TextBlock.WrapFit
					},
					new go.Binding("text").makeTwoWay())
				)
			);

			myDiagram.nodeTemplateMap.add("transicion",
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
			myDiagram.nodeTemplate = $(
				go.Node,
				"Auto",
					{ locationSpot: go.Spot.Top },
					$(go.Shape, "Circle",
					{
						fill: "white",
						stroke: "black",
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
						stroke: "black",
						textAlign: "center",
						margin: 4,
						maxSize: new go.Size(80, NaN),
						wrap: go.TextBlock.WrapFit
					},
					new go.Binding("text").makeTwoWay())
				)
				

			// unlike the normal selection Adornment, this one includes a Button
			myDiagram.nodeTemplate.selectionAdornmentTemplate = $(
				go.Adornment,
				"Spot",
				$(
					go.Panel,
					"Auto",
					$(go.Shape, "RoundedRectangle", roundedRectangleParams, {
						fill: null,
						stroke: "#7986cb",
						strokeWidth: 3,
					}),
					$(go.Placeholder) // a Placeholder sizes itself to the selected Node
				),
				// the button to create a "next" node, at the top-right corner
				$(
					"Button",
					{
						alignment: go.Spot.TopRight,
						click: addNodeAndLink, // this function is defined below
					},
					$(go.Shape, "PlusLine", { width: 6, height: 6 })
				) // end button
			); // end Adornment
			// agrega un nodo de tipo "lugar" al diagrama
			myDiagram.startTransaction("agregarLugar");
			myDiagram.model.addNodeData({ category: "lugar", text: "Lugar 1", loc: "0 0" });
			myDiagram.commitTransaction("agregarLugar");

			// Agregar un nodo tipo "transición" al diagrama
			myDiagram.startTransaction("agregarTransicion");
			myDiagram.model.addNodeData({ category: "transicion", text: "Transición 1", loc: "0 0" });
			myDiagram.commitTransaction("agregarTransicion");

			// clicking the button inserts a new node to the right of the selected node,
			// and adds a link to that new node
			/**
			 * @param {{ diagram: any; }} e
			 * @param {{ part: any; }} obj
			 */
			function addNodeAndLink(e, obj) {
				var adornment = obj.part;
				var diagram = e.diagram;
				diagram.startTransaction("Add State");

				// get the node data for which the user clicked the button
				var fromNode = adornment.adornedPart;
				var fromData = fromNode.data;
				// create a new "State" data object, positioned off to the right of the adorned Node
				var toData = { text: "p"+count++ };
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

			// replace the default Link template in the linkTemplateMap
			myDiagram.linkTemplate = $(
				go.Link, // the whole link panel
				{
					curve: go.Link.Bezier,
					adjusting: go.Link.Stretch,
					reshapable: true,
					relinkableFrom: true,
					relinkableTo: true,
					toShortLength: 3,
				},
				new go.Binding("points").makeTwoWay(),
				new go.Binding("curviness"),
				$(
					go.Shape, // the link shape
					{ strokeWidth: 1.5 },
					new go.Binding("stroke", "progress", (progress) =>
						progress ? "#52ce60" /* green */ : "black"
					),
					new go.Binding("strokeWidth", "progress", (progress) =>
						progress ? 2.5 : 1.5
					)
				),
				$(
					go.Shape, // the arrowhead
					{ toArrow: "standard", stroke: null },
					new go.Binding("fill", "progress", (progress) =>
						progress ? "#52ce60" /* green */ : "black"
					)
				)
			);

			// read in the JSON data from the "mySavedModel" element
			load();
		}
		function load() {
			// @ts-ignore
			myDiagram.model = go.Model.fromJson({
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

		init();
	});

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div id="myDiagramDiv" class="border-2 border-black w-screen h-screen" />
</section>