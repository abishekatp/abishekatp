<script lang="ts">
    import { onMount } from 'svelte';
    import { renderCard } from '../render';
    import type { CardLayout, CardTemplate } from '../types';
    import { editorial } from '../templates';

    export let card: CardLayout;
    export let index = 0;
    export let total = 1;
    export let template: CardTemplate = editorial;
    let canvas: HTMLCanvasElement;
    let mounted = false;
    onMount(() => { mounted = true; });
    $: if (mounted && canvas && card) renderCard(canvas, card, index, total, template);
</script>

<div role="img" aria-label="Card {index + 1} of {total}">
    <canvas bind:this={canvas}>Card {index + 1} of {total}</canvas>
</div>

<style>
    canvas { display: block; width: 100%; height: auto; aspect-ratio: 4 / 5; background: #272a2e; }
</style>