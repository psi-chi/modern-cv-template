<script>
  import LineX from "../Lines/LineX/LineXR.svelte";

  let university1, university2, fileinput1, fileinput2;

  const onFileSelected = (e) => {
    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (e) => {
      university1 = e.target.result;
    };
  };

  const onFileSelected2 = (e) => {
    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (e) => {
      university2 = e.target.result;
    };
  };
</script>

<div contenteditable="true" class="positions">
  <h2>POSITIONS OF RESPONSIBILITY</h2>
  <LineX />
  <div class="container">
    <div class="position">
      {#if university1}
        <img src={university1} alt="" />
      {:else}
        <img
          alt=""
          src="../images/university.jpg"
          on:click={() => {
            fileinput1.click();
          }}
        />
      {/if}
      <p>
        Lorem Ipsum
        <br /><em>Lorem Ipsum | Jan 20XX - Present</em>
      </p>
    </div>
    <div class="position">
      {#if university2}
        <img src={university2} alt="" />
      {:else}
        <img
          alt=""
          src="../images/university.jpg"
          on:click={() => {
            fileinput2.click();
          }}
        />
      {/if}
      <p>
        Lorem Ipsum
        <br /><em>Lorem Ipsum | Jan 20XX - Present</em>
      </p>
    </div>
  </div>
  <input
    style="display:none"
    type="file"
    accept=".jpg, .jpeg, .png"
    on:change={(e) => onFileSelected(e)}
    bind:this={fileinput1}
  />
  <input
    style="display:none"
    type="file"
    accept=".jpg, .jpeg, .png"
    on:change={(e) => onFileSelected2(e)}
    bind:this={fileinput2}
  />
</div>

<style>
  h2 {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  p {
    margin: 0;
  }

  img {
    height: 30px;
    width: 30px;
    padding: 5px;
    border: 5px double #808080;
    place-self: center;
  }

  .container {
    display: grid;
    grid-row-gap: 5px;
    margin-top: 20px;
  }

  .position {
    display: grid;
    grid-template-columns: 80px auto;
  }

  img::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }

  ::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }
</style>
