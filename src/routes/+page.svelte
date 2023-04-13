<script>
	import { onMount } from "svelte";
	import { PetriDiagram } from "./Diagram";

	onMount(() => {
		const diagram = new PetriDiagram("contextDiagram");
		diagram.init();
	});
</script>

<svelte:head>
	<title>Engine</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div id="contextDiagram" class="w-screen h-screen" />