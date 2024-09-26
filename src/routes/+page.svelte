<script>
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';

    function goToLogin() {
        goto(`${base}/docci/speaker`);
    }

    onMount(goToLogin);
</script>

<svelte:head>
	<title>Regex from Examples</title>
	<meta name="description" content="Regular expressions from examples" />
</svelte:head>

<style>
</style>