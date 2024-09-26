<script>
	import { pair, db, rounds } from '$lib/store.js';
	import { goto } from '$app/navigation';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { base } from '$app/paths';

	let speakername = "";
    let listenername = "";
	async function submitUsername() {
		if ((speakername.length > 0)&&(listenername.length > 0)) {
			pair.set(`${speakername}-${listenername}`);
            let pairstr = `${speakername}-${listenername}`;
            let data = await fetch(`${db}/pairs/${pairstr}.json`).then(response => response.json());
            console.log(data);
            if (data === null) {
                fetch(`${db}/pairs/${pairstr}.json`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rounds)
                });
            }

			goto(`${base}/docci/speaker/experiment`);
		}
		else {
			toast.push("Please enter a valid speaker and listener names", { 
				theme: {
					'--toastBarHeight': 0,
					'--toastBackground': 'red'
				}
			});
			return;
		}
	}
</script>

<svelte:head>
	<title>Repeated Reference Game</title>
	<meta name="description" content="Regular expressions from examples" />
</svelte:head>


<div class="col-lg-6 mx-auto p-3 pt-md-5 pb-md-3 text-center">
	<div class="row gx-1">
        <div class="input-group col">
            <span class="input-group-text">Enter speaker</span>
            <input type="text" class="form-control" bind:value={speakername}>
        </div>
        <div class="input-group col">
            <span class="input-group-text">Enter listener</span>
            <input type="text" class="form-control" bind:value={listenername}>
        </div>
        <div class="col">
            <button type="submit" class="btn btn-primary col-auto" on:click={submitUsername}>Proceed to task</button>
        </div>
    </div>

	<SvelteToast />
</div>

<style>
</style>