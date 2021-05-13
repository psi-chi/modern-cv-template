<script>
  let avatar, fileinput;

  const onFileSelected = (e) => {
    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (e) => {
      avatar = e.target.result;
    };
  };
</script>

<div
  class="profile"
  on:click={() => {
    fileinput.click();
  }}
>
  <div class="image-border" style="margin-left: -25px" />
  <div class="image-border" style="margin-left: 25px" />

  {#if avatar}
    <img class="avatar" src={avatar} alt="" />
  {:else}
    <img class="avatar" src="../images/avatar.jpg" alt="" />
  {/if}
  <input
    style="display:none"
    type="file"
    accept=".jpg, .jpeg, .png"
    on:change={(e) => onFileSelected(e)}
    bind:this={fileinput}
  />
</div>

<style>
  .profile {
    display: grid;
    height: 160px;
    width: 175px;
    margin-left: -2.5px;
    place-items: center;
  }

  .avatar {
    height: 120px;
    width: 120px;
    grid-row: 1;
    grid-column: 1;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .image-border {
    height: 110px;
    width: 110px;
    grid-row: 1;
    grid-column: 1;
    transform: rotate(45deg);
    border: 3px solid #fff;
    box-shadow: 0 0 5px #fff;
    cursor: pointer;
  }
</style>
