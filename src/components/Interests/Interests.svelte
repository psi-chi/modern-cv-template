<script>
  import LineX from "../Lines/LineX/LineXL.svelte";

  let none = "none",
    interest1 = "fas fa-question",
    interest2 = "fas fa-question",
    interest3 = "fas fa-question";
</script>

<div contenteditable="true" class="interests">
  <h2>INTERESTS</h2>
  <LineX />
  <div class="interest">
    <i
      class={interest1}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>LOREM</p>
  </div>
  <input style="display: {none}" type="text" bind:value={interest1} />
  <div class="interest">
    <i
      class={interest2}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>IPSUM</p>
  </div>
  <input style="display: {none}" type="text" bind:value={interest2} />
  <div class="interest">
    <i
      class={interest3}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>LOREM</p>
  </div>
  <input style="display: {none}" type="text" bind:value={interest3} />
</div>

<style>
  i {
    grid-row: 1;
  }

  p {
    margin: 0;
    grid-row: 1;
  }

  h2 {
    text-shadow: 0 0 5px #000;
  }

  input {
    margin: 5px 5px 5px 5px;
    padding: 3px 3px 3px 3px;
    color: #000;
    background: #fff;
    border: 1px solid #000;
    text-shadow: 0 0 3px #000;
    box-shadow: 0 0 3px #000;
    border-radius: 5px;
    caret-color: #000;
  }

  input::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }

  .interests {
    width: 175px;
    caret-color: #fff;
    text-transform: uppercase;
  }

  .interest {
    display: grid;
    grid-template-columns: 40px auto;
    color: #fff;
    margin-top: 20px;
  }

  ::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }
</style>
