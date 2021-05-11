<script>
</script>

<div class="line-y">
  <div class="circle" />
  <div class="line" />
</div>

<style>
  .line-y {
    display: grid;
    grid-template-rows: 12px auto;
    border-top: 0px;
    border-bottom: 0px;
    cursor: pointer;
    place-items: center;
  }

  .circle {
    border: 2px solid #c0c0c0;
    height: 10px;
    width: 10px;
    background-color: #000;
    border-radius: 50%;
  }

  .line {
    height: 100%;
    width: 1px;
    border-left: 1px solid #c0c0c0;
    background-color: #808080;
    border-right: 1px solid #c0c0c0;
  }
</style>
