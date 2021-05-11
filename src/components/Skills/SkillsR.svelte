<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
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
    color: #000;
    text-shadow: 0 0 3px #aaa;
  }

  p {
    color: #fff;
    background: #000;
    font-weight: bold;
    margin: 0 0 5px 5px;
    padding: 5px;
    border-radius: 5px;
    width: fit-content;
    float: left;
    text-shadow: 0 0 3px #fff;
  }

  p:hover {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
    border: 3px solid #fff;
    padding: 2px;
    cursor: pointer;
  }

  .skill {
    float: left;
    margin-top: 20px;
    text-transform: uppercase;
  }

  p::selection {
    color: #000;
    background: #fff;
    text-shadow: 0 0 3px #000;
  }

  p:hover::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }

  h2::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }
</style>
