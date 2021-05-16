<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
  import Component from "../Others/Component3.svelte";

  let bool = true,
    statei1 = "-square",
    statei2 = "-square",
    array = [Component];

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
    length++;
  };

  const removeElement = () => {
    array = array.slice(0, -1);
    length--;
  };
</script>

<div contenteditable={bool} class="positions">
  <h2>
    POSITIONS OF RESPONSIBILITY <i
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
  <div class="container">
    {#each array as item, index}
      <div class="position">
        <svelte:component this={item} />
      </div>
    {/each}
  </div>
</div>

<style>
  h2 {
    text-shadow: 0 0 3px #aaa;
  }

  i {
    color: #000;
    text-shadow: 0 0 5px #aaa;
  }

  .container {
    display: grid;
    grid-row-gap: 5px;
    margin-top: 20px;
  }

  @media print {
    .fas {
      display: none;
    }
  }
</style>
