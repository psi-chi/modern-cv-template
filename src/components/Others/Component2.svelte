<script>
  import LineY from "../Lines/LineY/LineY.svelte";

  export let line = true,
    month = true;
</script>

<p>
  Lorem Ipsum
  {#if month == true}
    <br /><em>Jan 20XX - Dec 20XX</em>
  {:else}
    <br /><em>20XX - 20XX</em>
  {/if}
</p>
<LineY />
<div class="details">
  <p>
    Lorem Ipsum
    <br /><em> Lorem Ipsum</em>
  </p>
  <p style="font-size: 12px">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere iste dicta
    mollitia vel ea, laboriosam quia accusantium recusandae!
    {#if line == true}
      <br />&nbsp;
    {/if}
  </p>
</div>

<style>
  p {
    margin: 0;
  }
</style>
