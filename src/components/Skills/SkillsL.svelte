<script>
  import LineX from "../Lines/LineX/LineXL.svelte";

  let bool = true,
    statei1 = "-square",
    statei2 = "-square",
    array = [
      "Lorem",
      "Ipsum",
      "Lorem",
      "Ipsum",
      "Lorem",
      "Ipsum",
      "Lorem",
      "Ipsum",
      "Lorem",
      "Ipsum",
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
    array = [...array, "Lorem"];
  };

  const removeElement = () => {
    array = array.slice(0, -1);
  };
</script>

<div contenteditable={bool} class="skills">
  <h2>
    SKILLS
    <i
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
  <div class="skill">
    {#each array as item}
      <p>{item}</p>
    {/each}
  </div>
</div>

<style>
  h2 {
    color: #fff;
    text-shadow: 0 0 5px #000;
  }

  i {
    color: #fff;
    text-shadow: 0 0 3px #fff;
  }

  p {
    color: #000;
    background: #fff;
    font-weight: bold;
    margin: 0 0 5px 5px;
    padding: 5px;
    border-radius: 5px;
    width: fit-content;
    float: left;
    text-shadow: 0 0 3px #aaa;
  }

  .skill {
    float: left;
    margin-top: 20px;
    text-transform: uppercase;
    caret-color: #000;
  }

  p:hover {
    color: #fff;
    background: #000;
    text-shadow: 0 0 3px #fff;
    border: 3px solid #000;
    padding: 2px;
    cursor: pointer;
    caret-color: #fff;
  }

  @media print {
    .fas {
      display: none;
    }
  }
</style>
