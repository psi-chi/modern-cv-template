<script>
  export let credential;

  let image,
    fileinput,
    url = "url including http/https",
    state = "none";

  const onFileSelected = (e) => {
    let img = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onload = (e) => {
      image = e.target.result;
    };
  };

  const setState = () => {
    state == "none" ? (state = "inherit") : (state = "none");
  };
</script>

<div class="container">
  {#if image}
    <img
      src={image}
      alt=""
      on:click={() => {
        fileinput.click();
      }}
    />
  {:else}
    <img
      alt=""
      src="/images/university.jpg"
      on:click={() => {
        fileinput.click();
      }}
    />
  {/if}
  <p>
    Lorem Ipsum
    <br /><em>Lorem Ipsum | Jan 20XX - Present</em>
    {#if credential}
      <br /><a href={url} target="_blank" on:click={setState}>loremipsumdolor</a
      >
      <input bind:value={url} class="url" style="display: {state}" />
    {/if}
  </p>
</div>

<input
  style="display:none"
  type="file"
  accept=".jpg, .jpeg, .png"
  on:change={(e) => onFileSelected(e)}
  bind:this={fileinput}
/>

<style>
  p {
    margin: 0;
  }

  img {
    height: 34px;
    width: 34px;
    padding: 3px;
    border: 5px double #808080;
    place-self: center;
  }

  input {
    caret-color: #fff;
  }

  .url {
    font-size: 12px;
    font-style: italic;
    font-weight: 500;
    color: #fff;
    background: #000;
    padding: 5px;
    margin: 5px 5px 5px 0;
    border-radius: 5px;
  }

  .container {
    display: grid;
    grid-template-columns: 80px auto;
  }
</style>
