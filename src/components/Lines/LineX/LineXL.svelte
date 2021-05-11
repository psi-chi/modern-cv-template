<script>
</script>

<div class="line-x">
  <div class="line" />
  <div class="progress-line" />
</div>

<style>
  .line-x {
    display: grid;
    border-left: 0px;
    border-right: 0px;
    cursor: pointer;
  }

  .line {
    grid-row: 1;
    grid-column: 1;
    height: 1px;
    background-color: #808080;
    border-top: 1px solid #404040;
    border-bottom: 1px solid #404040;
    cursor: pointer;
  }

  .progress-line {
    grid-row: 1;
    grid-column: 1;
    height: 1px;
    border-top: 1px solid #c0c0c0;
    background-color: #fff;
    border-bottom: 1px solid #c0c0c0;
    max-width: 25px;
  }
</style>
