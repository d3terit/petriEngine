<script>
    import { Icon, Tooltip } from "svelte-materialify";
    import { mdiContentSave, mdiFolderOpen, mdiPlay, mdiStop } from "@mdi/js";
    /**
     * @type {any | null}
     */
    export let diagram;
    let interval = 1000;
    /**
     * @type {any | null}
     */
    let intervalId = null;
    function startInterval() {
        diagram.simulate();
        intervalId = setInterval(() => {
            diagram.simulate(stopInterval);
        }, interval);
    }
    function stopInterval() {
        clearInterval(intervalId);
        intervalId = null;
    }
</script>

<header class="w-screen h-10 bg-[#222] text-cyan-50">
    <div class="flex items-center justify-center w-full space-x-32 h-full">
        <div class="flex items-center space-x-4">
            <button on:click={() => diagram.save()}>
                <Tooltip bottom>
                    <Icon size="20" path={mdiContentSave} />
                    <span slot="tip">Guardar</span>
                </Tooltip>
            </button>
            <button on:click={() => diagram.open()}>
                <Tooltip bottom>
                    <Icon size="20" path={mdiFolderOpen} />
                    <span slot="tip">Abrir</span>
                </Tooltip>
            </button>
        </div>
        <div class="flex items-center space-x-4">
            <input type="number" name="interval" id="interval" bind:value={interval} min="100" disabled={intervalId}
                class="bg-transparent text-gray-100 w-20 focus:outline-none border-b border-gray-500">
                {#if !intervalId}
                <button on:click={() => startInterval()} class="text-cyan-400">
                    <Tooltip bottom>
                        <Icon size="20" path={mdiPlay} />
                        <span slot="tip">Simular</span>
                    </Tooltip>
                </button>
                {:else}
                <button 
                on:click={() => stopInterval()} class="text-red-400">
                    <Tooltip bottom>
                        <Icon size="20" path={mdiStop} />
                        <span slot="tip">Detener</span>
                    </Tooltip>
                </button>
                {/if}
        </div>
    </div>
</header>
