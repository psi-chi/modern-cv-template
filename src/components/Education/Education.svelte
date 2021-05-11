<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
  import LineY from "../Lines/LineY/LineY.svelte";
</script>

<div contenteditable="true" class="education">
  <h2>EDUCATION</h2>
  <LineX />
  <div class="container">
    <div class="education-details">
      <p>
        Lorem Ipsum
        <br /><em>20XX - 20XX</em>
      </p>
      <LineY />
      <div class="details">
        <p>
          Lorem Ipsum
          <br /><em> Lorem Ipsum</em>
        </p>
        <p style="font-size: 12px">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere iste
          dicta mollitia vel ea, laboriosam quia accusantium recusandae!
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  h2 {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  p {
    margin: 0;
  }

  .container {
    display: grid;
    margin-top: 14px;
  }

  .education-details {
    display: grid;
    grid-template-columns: 150px 50px auto;
  }

  ::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }
</style>
