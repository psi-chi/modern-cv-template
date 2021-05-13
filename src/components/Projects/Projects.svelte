<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
  import Component from "../Others/Component1.svelte";

  let bool = true,
    statei1 = "-square",
    statei2 = "-square",
    array = [Component, Component];

  const setState = (num, state) => {
    if (state == "enter") {
      bool = !bool;
      if (num == 1) {
        statei1 = "";
      } else {
        statei2 = "";
      }
    } else {
      bool = !bool;
      if (num == 1) {
        statei1 = "-square";
      } else {
        statei2 = "-square";
      }
    }
  };

  const addElement = () => {
    array = [...array, Component];
  };

  const removeElement = () => {
    array = array.slice(0, -1);
  };
</script>

<div contenteditable={bool} class="projects">
  <h2>
    PROJECTS <i
      class="fas fa-plus{statei1}"
      on:mouseenter={() => setState(1, "enter")}
      on:mouseleave={() => setState(1, "leave")}
      on:click={addElement}
    />
    <i
      class="fas fa-minus{statei2}"
      on:mouseenter={() => setState(2, "enter")}
      on:mouseleave={() => setState(2, "leave")}
      on:click={removeElement}
    />
  </h2>
  <LineX />
  <div class="project">
    {#each array as item}
      <svelte:component this={item} size="12px" />
    {/each}
  </div>
</div>

<style>
  h2 {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  i {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  @media print {
    .fas {
      display: none;
    }
  }
</style>
