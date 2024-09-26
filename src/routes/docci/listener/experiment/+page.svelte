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
  let message = null;
  let currentSelection = null;
  let waitingForSpeaker = false;
  let lastRoundCorrect = null;

  async function submitMessage() {
      if (waitingForSpeaker) {
          await loadGames().then(response => {});
          waitingForSpeaker = false;
          return;
      }

      if (currentSelection.length > 0) {
        await fetch(`${db}/pairs/${$pair}/${currentGame}/rounds/${currentRound}.json`, {
            method: "PUT",
            body: JSON.stringify({message: games[currentGame].rounds[currentRound].message, target: games[currentGame].rounds[currentRound].target, selection: currentSelection})
        })
      }
      

      currentSelection = null;

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
      if ($pair.length == 0) {
          goto(`${base}/docci/listener/login`)
      }

      let data = await fetch(`${db}/pairs.json`)
      .then(response => response.json());

      console.log(data);

      if (data.hasOwnProperty($pair)) {
          games = data[$pair];
          let incomplete = findFirstIncompleteRound(games);
          currentGame = incomplete.gameIndex;
          currentRound = incomplete.roundIndex;
          if (currentRound > 0) {
              lastRoundCorrect = games[currentGame].rounds[currentRound - 1].target === games[currentGame].rounds[currentRound - 1].selection;
          }
      }
      else {
        goto(`${base}/docci/listener/login`)
      }

      context = games[currentGame].listener_view
      
      if (!games[currentGame].rounds[currentRound].hasOwnProperty("message")) {
          waitingForSpeaker = true;
      }
      else {
        message = games[currentGame].rounds[currentRound].message
      }
  }

  onMount(loadGames);
</script>

<div class="col-lg-10 mx-auto p-3 py-md-5">


  <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h2>You are the listener</h2>
  </div>

  <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
    <h4>Completed {currentRound} of {9} rounds in this game</h4>
  </div>

  {#if !waitingForSpeaker}
  <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
    <h5><em>Description:</em> {message}</h5>
  </div>
  {:else if currentRound > 0}
    {#if lastRoundCorrect === true}
    <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h5>Your guess was correct!</h5>
    </div>
    {:else if lastRoundCorrect === false}
    <div class="col-lg-10 pt-md-1 pb-md-1 text-center">
      <h5>Your guess was incorrect :(</h5>
    </div>
    {/if}
  {/if}

  {#if context}
  <div style="display: flex;">
    {#each context as option}
      <div style="flex: 1; text-align: center;">
        <input
          type="radio"
          id={option}
          name="imageOptions"
          value={option}
          bind:group={currentSelection}
          style="display: none;"
        />
        <label
          for={option}
          style="display: block; cursor: pointer; padding: 5px;"
        >
          <img
            src={`https://storage.googleapis.com/docci/thumbnails/${option}.jpg`}
            alt={option}
            style="
              width: 100%;
              height: auto;
              {currentSelection === option ? 'border: 10px solid green; border-radius: 5px;' : ''}
            "
          />
        </label>
      </div>
    {/each}
  </div>
  {/if}



  {#if waitingForSpeaker}
    <div class="row gx-1">
      <div class="col">
          <button type="submit" class="btn btn-primary col-auto" on:click={submitMessage}>Click when speaker is done</button>
      </div>
    </div>
  {:else}
    <div class="row gx-1">
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