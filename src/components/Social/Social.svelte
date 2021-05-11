<script>
  import LineX from "../Lines/LineX/LineXL.svelte";

  let none = "none",
    social1 = "fab fa-linkedin",
    social2 = "fab fa-github",
    social3 = "fab fa-twitter";
</script>

<div contenteditable="true" class="social">
  <h2>SOCIAL MEDIA</h2>
  <LineX />
  <div class="social-details">
    <i
      class={social1}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>LinkedIn</p>
    <a href="https://www.linkedin.com/in/#" target="_blank">lorem</a>
  </div>
  <input style="display: {none}" type="text" bind:value={social1} />
  <div class="social-details">
    <i
      class={social2}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>GitHub</p>
    <a href="https://github.com/#" target="_blank">lorem</a>
  </div>
  <input style="display: {none}" type="text" bind:value={social2} />
  <div class="social-details">
    <i
      class={social3}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>Twitter</p>
    <a href="https://twitter.com/#" target="_blank">lorem</a>
  </div>
  <input style="display: {none}" type="text" bind:value={social3} />
</div>

<style>
  h2 {
    text-shadow: 0 0 5px #000;
  }

  i {
    grid-row: 1 / 3;
    margin: 0;
  }

  p {
    color: #fff;
    grid-row: 1;
    margin: 0;
  }

  a {
    cursor: pointer;
    grid-row: 2;
    grid-column: 2;
    margin: 0;
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

  .social {
    width: 175px;
  }

  .social-details {
    display: grid;
    grid-template-columns: 40px auto;
    margin-top: 20px;
  }

  ::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }
</style>
