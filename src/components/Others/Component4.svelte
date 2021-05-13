<script>
  export let display, type, title;

  let state = "none",
    icon = "fas fa-question",
    url = "url including http/https";

  $: icon = display.toLowerCase().replaceAll(" ", "-");

  const setState = () => {
    state == "none" ? (state = "inherit") : (state = "none");
  };
</script>

{#if type == "social"}
  <div class="details">
    <i class="fab fa-{icon}" on:click={setState} />
    <div class="container">
      <input bind:value={display} />
      <a href={url} target="_blank" on:click={setState}>lorem</a>
      <input bind:value={url} class="url" style="display: {state}" />
    </div>
  </div>
{:else if type == "contact"}
  <div class="details">
    <i class={display} on:click={setState} />
    <div class="container">
      <p style="color: #fff">{title}</p>
      {#if title == "Location"}
        <p>Lorem, Ipsum</p>
      {:else if title == "Phone"}
        <p>+XX XXX-XXXX-XXX</p>
      {:else if title == "Email"}
        <p>lorem@ipsum.com</p>
      {:else}
        <p>Ipsum</p>
        <input bind:value={display} class="url" style="display: {state}" />
      {/if}
    </div>
  </div>
{:else}
  <div class="details">
    <i class={display} on:click={setState} />
    <div class="container">
      <p style="color: #fff">LOREM</p>
      <input bind:value={display} class="url" style="display: {state}" />
    </div>
  </div>
{/if}

<style>
  a {
    grid-row: 2;
    grid-column: 2;
    margin: 0;
  }

  p {
    margin: 0;
  }

  input {
    caret-color: #000;
  }

  .url {
    font-size: 12px;
    font-style: italic;
    font-weight: 500;
    color: #000;
    background: #fff;
    padding: 5px;
    margin: 5px 5px 5px 0;
    border-radius: 5px;
  }

  .details {
    display: grid;
    grid-template-columns: 40px auto;
    margin-top: 20px;
  }
</style>
