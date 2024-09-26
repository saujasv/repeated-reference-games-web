<script>
  import { goto } from '$app/navigation';
  import { pair, db } from '$lib/store.js';
  import { onMount } from "svelte";
  import { base } from '$app/paths';
  import { SvelteToast, toast } from '@zerodevx/svelte-toast';
  import { dev } from '$app/environment';
import { get } from 'svelte/store';

  function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  let currentRound = null;
  let currentGame = null;
  let games = null;
  let context = null;
  let targetIdx = null;
  let currentMessage = "";
  let waitingForListener = false;
  let lastRoundCorrect = null;

  async function submitMessage() {
      if (currentMessage.length > 0) {
        await fetch(`${db}/pairs/${$pair}/${currentGame}/rounds/${currentRound}.json`, {
            method: "PUT",
            body: JSON.stringify({message: currentMessage, target: games[currentGame].rounds[currentRound].target})
        })
      }
      

      currentMessage = "";

      await loadGames().then(response => {});
  }

  function isRoundComplete(round) {
      return round.hasOwnProperty("message") && round.hasOwnProperty("selection");
  }

  function findFirstIncompleteRound(games) {
      for (let gameIndex = 0; gameIndex < games.length; gameIndex++) {
          let game = games[gameIndex];
          let rounds = game.rounds;
          for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
              let round = rounds[roundIndex];
              if (!isRoundComplete(round)) {
                  // Found the first incomplete round in the first incomplete game
                  return {
                      gameIndex: gameIndex,
                      roundIndex: roundIndex
                  };
              }
          }
      }
      // All games and rounds are complete
      return null;
  }

  async function loadGames() {
    waitingForListener = false;
      if ($pair.length == 0) {
          goto(`${base}/docci/speaker/login`)
      }

      let data = await fetch(`${db}/pairs.json`)
      .then(response => response.json());

      console.log(data);

      if (data.hasOwnProperty($pair)) {
          games = data[$pair];
          let incomplete = findFirstIncompleteRound(games);
          currentGame = incomplete.gameIndex;
          currentRound = incomplete.roundIndex;
          console.log(currentGame, currentRound);
          if (currentRound > 0) {
            if (games[currentGame].rounds[currentRound - 1].selection == games[currentGame].rounds[currentRound - 1].target) {
              lastRoundCorrect = true;
            }
            else {
              lastRoundCorrect = false;
            }
          }
      }
      else {
        goto(`${base}/docci/speaker/login`)
      }

      context = games[currentGame].speaker_view
      targetIdx = context.indexOf(games[currentGame].rounds[currentRound].target)
      if (games[currentGame].rounds[currentRound].hasOwnProperty("message") && !games[currentGame].rounds[currentRound].hasOwnProperty("selection")) {
          waitingForListener = true;
      }
  }

  onMount(loadGames);
</script>

<div class="col-lg-10 mx-auto p-3 py-md-5">


  <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h2>You are now the speaker in the pair {$pair}</h2>
  </div>

  <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
    <h4>Completed {currentRound} of {9} rounds in this game</h4>
</div>

  {#if currentRound > 0 && !waitingForListener}
  {#if lastRoundCorrect === true}
    <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h4>The listener guessed correctly in the previous round!</h4>
    </div>
  {:else if lastRoundCorrect === false}
    <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h4>The listener did not guess correctly in the previous round :(</h4>
    </div>
  {/if}
  {/if}
  

  {#if context}
    <div class="container">
      <div class="row">
        {#each context as item, idx}
          {#if idx == targetIdx}
            <div class="col">
              <img src="https://storage.googleapis.com/docci/thumbnails/{item}.jpg" class="img-fluid" alt="{item}" style="border: 10px solid green;">
            </div>
          {:else}
            <div class="col">
              <img src="https://storage.googleapis.com/docci/thumbnails/{item}.jpg" class="img-fluid" alt="{item}">
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}



  {#if waitingForListener}
    <div class="row gx-1">
      <div class="col">
          <button type="submit" class="btn btn-primary col-auto" on:click={submitMessage}>Click when listener is done</button>
      </div>
    </div>
  {:else}
    <div class="row gx-1">
      <div class="input-group col">
          <span class="input-group-text">Enter description</span>
          <input type="text" class="form-control" bind:value={currentMessage} >
      </div>
      <div class="col">
          <button type="submit" class="btn btn-primary col-auto" on:click={submitMessage}>Submit</button>
      </div>
    </div>
  {/if}
  

  <!-- {#if utterances.length >= min_utterances}
      <div class="col-lg-6 py-md-5">
          <button class="btn btn-success btn-lg float-end" on:click={submitUtterances}>Submit</button>
      </div>
  {/if} -->
  <SvelteToast />
</div>

<style>
</style>