<script>
  import LineX from "../Lines/LineX/LineXR.svelte";
  import Component from "../Others/Component2.svelte";

  let bool = true,
    length = 0,
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

<div contenteditable={bool} class="education">
  <h2>
    EDUCATION <i
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
      <div class="education-details">
        {#if length == index}
          <svelte:component this={item} line="false" month="false" />
        {:else}
          <svelte:component this={item} month="false" />
        {/if}
      </div>
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

  .container {
    display: grid;
    margin-top: 14px;
  }

  .education-details {
    display: grid;
    grid-template-columns: 150px 50px auto;
  }

  @media print {
    .fas {
      display: none;
    }
  }
</style>
