<script>
  import LineX from "../Lines/LineX/LineXL.svelte";
</script>

<div contenteditable="true" class="custom">
  <h2>CUSTOM</h2>
  <LineX />
  <p class="heading">Lorem</p>
  <p style="margin-top: 0">
    Lorem ipsum dolor sit amet consectetur adipisicing elit.
  </p>
</div>

<style>
  h2 {
    text-shadow: 0 0 5px #000;
  }

  .custom {
    width: 175px;
    text-shadow: 0 0 3px #000;
  }

  .heading {
    color: #fff;
  }

  ::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }
</style>
