<script>
  import LineX from "../Lines/LineX/LineXL.svelte";
  import Component from "../Others/Component4.svelte";

  let bool = true,
    statei1 = "-square",
    statei2 = "-square",
    array = [
      {
        component: Component,
        display: "fas fa-map-marker-alt",
        title: "Location",
      },
      { component: Component, display: "fas fa-phone", title: "Phone" },
      { component: Component, display: "fas fa-envelope", title: "Email" },
    ];

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
    array = [
      ...array,
      { component: Component, display: "fas fa-question", title: "Lorem" },
    ];
  };

  const removeElement = () => {
    array = array.slice(0, -1);
  };
</script>

<div contenteditable="true" class="contact">
  <h2>
    CONTACT <i
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
  <div class="contact-details">
    {#each array as item}
      <svelte:component
        this={item.component}
        title={item.title}
        display={item.display}
        type="contact"
      />
    {/each}
  </div>
</div>

<style>
  h2 {
    text-shadow: 0 0 5px #000;
  }

  i {
    grid-row: 1 / 3;
    margin: 0;
  }

  .contact {
    width: 175px;
  }

  @media print {
    .fas {
      display: none;
    }
  }
</style>
