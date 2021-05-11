<script>
  import LineX from "../Lines/LineX/LineXL.svelte";

  let none = "none",
    contact1 = "fas fa-map-marker-alt",
    contact2 = "fas fa-phone",
    contact3 = "fas fa-envelope";
</script>

<div contenteditable="true" class="contact">
  <h2>CONTACT</h2>
  <LineX />
  <div class="contact-details">
    <i
      class={contact1}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>Location</p>
    <span>Lorem, Ipsum</span>
  </div>
  <input style="display: {none}" type="text" bind:value={contact1} />
  <div class="contact-details">
    <i
      class={contact2}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>Phone</p>
    <span>+XX XXX-XXXX-XXX</span>
  </div>
  <input style="display: {none}" type="text" bind:value={contact2} />
  <div class="contact-details">
    <i
      class={contact3}
      on:click={() => (none == "none" ? (none = "inherit") : (none = "none"))}
    />
    <p>Email</p>
    <span>lorem@ipsum.com</span>
  </div>
  <input style="display: {none}" type="text" bind:value={contact3} />
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

  span {
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

  .contact {
    width: 175px;
  }

  .contact-details {
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
