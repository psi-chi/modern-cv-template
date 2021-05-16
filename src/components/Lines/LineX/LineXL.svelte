<script>
</script>

<div class="line-x">
  <div class="line" />
  <div class="progress" />
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

  .progress {
    grid-row: 1;
    grid-column: 1;
    height: 1px;
    border-top: 1px solid var(--left-progress-border);
    background-color: var(--progress-background);
    border-bottom: 1px solid var(--left-progress-border);
    max-width: 25px;
  }
</style>
