<script>
	import Header from "./Header.svelte";
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
</script>

<svelte:head>
	<title>Engine</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<Header {diagram} />

<div id="contextDiagram" class="w-screen h-[calc(100vh-40px)] absolute top-10" />
