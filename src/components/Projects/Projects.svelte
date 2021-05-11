<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
</script>

<div contenteditable="true" class="projects">
  <h2>PROJECTS</h2>
  <LineX />
  <div class="project">
    <p>
      Lorem Ipsum
      <br /><em>Jan 20XX - Dec 20XX</em>
    </p>
    <p class="description">
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut qui facere
      minima! Quas quam, nisi incidunt modi porro ad? Illo ipsum qui voluptate
      eaque aliquam sed. Reprehenderit et repellendus ducimus.
    </p>
  </div>
  <div class="project">
    <p>
      Lorem Ipsum
      <br /><em>Jan 20XX - Dec 20XX</em>
    </p>
    <p class="description">
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut qui facere
      minima! Quas quam, nisi incidunt modi porro ad? Illo ipsum qui voluptate
      eaque aliquam sed. Reprehenderit et repellendus ducimus.
    </p>
  </div>
</div>

<style>
  h2 {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  .description {
    margin: 0;
    font-size: 12px;
  }

  ::selection {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
  }
</style>
