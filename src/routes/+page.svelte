<script>
	import { onMount } from "svelte";
	import { PetriDiagram } from "./Diagram";
	// @ts-ignore
	/**
     * @type {PetriDiagram | null}
     */
	let diagram = null;
	onMount(() => {
		diagram = new PetriDiagram("contextDiagram");
		diagram.init();
	});
	const exportDiagram = () => {
		if (diagram) diagram.save();
	};
</script>

<svelte:head>
	<title>Engine</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<button
	class="absolute w-6 h-6 top-0 left-0 m-4 z-10"
	on:click={() => exportDiagram()}
>
	sasas
</button>
<div id="contextDiagram" class="w-screen h-screen" />
