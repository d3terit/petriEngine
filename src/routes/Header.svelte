<script>
    import { Icon, Tooltip } from "svelte-materialify";
    import { mdiContentSave, mdiFolderOpen } from "@mdi/js";
    /**
     * @type {any | null}
     */
    export let diagram;
</script>

<header class="w-screen h-10 bg-[#222] text-cyan-50">
    <div class="flex items-center justify-center w-full space-x-4 h-full">
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
</header>
