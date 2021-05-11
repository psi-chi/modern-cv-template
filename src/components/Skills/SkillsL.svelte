<script>
  import LineX from "../Lines/LineX/LineXL.svelte";
</script>

<div contenteditable="true" class="skills">
  <h2>SKILLS</h2>
  <LineX />
  <div class="skill">
    <p>Lorem</p>
    <p>Ipsum</p>
    <p>Lorem</p>
    <p>Ipsum</p>
    <p>Lorem</p>
    <p>Ipsum</p>
    <p>Lorem</p>
    <p>Ipsum</p>
    <p>Lorem</p>
    <p>Ipsum</p>
    <p>Lorem</p>
    <p>Ipsum</p>
  </div>
</div>

<style>
  h2 {
    text-shadow: 0 0 5px #000;
  }

  p {
    color: #000;
    background: #fff;
    font-weight: bold;
    margin: 0 0 5px 5px;
    padding: 5px;
    border-radius: 5px;
    width: fit-content;
    float: left;
    text-shadow: 0 0 3px #000;
  }

  p:hover {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
    border: 3px solid #000;
    padding: 2px;
    cursor: pointer;
  }

  .skill {
    float: left;
    margin-top: 20px;
    text-transform: uppercase;
  }

  p::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }

  p:hover::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }

  h2::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }
</style>
