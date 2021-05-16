<script>
  import Menu from "./components/Menu/Menu.svelte";
  import Avatar from "./components/Avatar/Avatar.svelte";
  import About from "./components/About/About.svelte";
  import Interests from "./components/Interests/Interests.svelte";
  import Contact from "./components/Contact/Contact.svelte";
  import Social from "./components/Social/Social.svelte";
  import Name from "./components/Name/Name.svelte";
  import SkillsR from "./components/Skills/SkillsR.svelte";
  import Work from "./components/Work/Work.svelte";
  import Education from "./components/Education/Education.svelte";
  import Certifications from "./components/Certifications/Certifications.svelte";
  import Projects from "./components/Projects/Projects.svelte";
  import Achievements from "./components/Achievements/Achievements.svelte";
  import Positions from "./components/Positions/Positions.svelte";
  import SkillsL from "./components/Skills/SkillsL.svelte";
  import CustomL from "./components/Custom/CustomL.svelte";
  import CustomR from "./components/Custom/CustomR.svelte";

  let avatar = true,
    aboutme = true,
    interests = true,
    contact = true,
    social = true,
    name = true,
    skillsr = true,
    work = true,
    education = true,
    certifications = true,
    projects = true,
    achievements = false,
    positions = false,
    skillsl = false,
    customl = false,
    customr = false,
    colorBool = false,
    color = "#fff",
    leftHeading = "#fff",
    rightHeading = "#000",
    avatarColor = color,
    leftProgressBorder = "#c0c0c0",
    rightProgressBorder = "#404040",
    iconColor = "#fff",
    circleColor = "#000",
    circleBorder = "#c0c0c0",
    leftSkillsColor = "#000",
    leftSkillsBackground = "#fff",
    rightSkillsBackground = "#000";
</script>

<main>
  <div class="menubar">
    <Menu
      bind:avatar
      bind:aboutme
      bind:interests
      bind:contact
      bind:social
      bind:name
      bind:skillsr
      bind:work
      bind:education
      bind:certifications
      bind:projects
      bind:achievements
      bind:positions
      bind:skillsl
      bind:customl
      bind:customr
      bind:colorBool
      bind:avatarColor
      bind:leftHeading
      bind:rightHeading
      bind:leftProgressBorder
      bind:rightProgressBorder
      bind:iconColor
      bind:circleColor
      bind:circleBorder
      bind:leftSkillsColor
      bind:leftSkillsBackground
      bind:rightSkillsBackground
      {color}
    />
  </div>
  <div
    class="main"
    size="A4"
    style="--icon-color: {iconColor}; --circle-color: {circleColor}; --circle-border: {circleBorder}; --left-skills-color: {leftSkillsColor}; --left-skills-background: {leftSkillsBackground}; --right-skills-background: {rightSkillsBackground}"
  >
    <div
      class="left"
      style="--heading-color: {leftHeading}; --progress-background: {leftHeading}; --left-progress-border: {leftProgressBorder}"
    >
      {#if avatar}
        <Avatar color={avatarColor} />
      {/if}
      {#if aboutme}
        <About />
      {/if}
      {#if customl}
        <CustomL />
      {/if}
      {#if skillsl}
        <SkillsL />
      {/if}
      {#if interests}
        <Interests />
      {/if}
      {#if contact}
        <Contact />
      {/if}
      {#if social}
        <Social />
      {/if}
    </div>
    <div
      class="right"
      style="--heading-color: {rightHeading}; --progress-background: {rightHeading}; --right-progress-border: {rightProgressBorder}"
    >
      {#if name}
        <Name />
      {/if}
      {#if skillsr}
        <SkillsR />
      {/if}
      {#if work}
        <Work />
      {/if}
      {#if education}
        <Education />
      {/if}
      {#if certifications}
        <Certifications />
      {/if}
      {#if projects}
        <Projects />
      {/if}
      {#if achievements}
        <Achievements />
      {/if}
      {#if positions}
        <Positions />
      {/if}
      {#if customr}
        <CustomR />
      {/if}
    </div>
  </div>
</main>

<style>
  :global(h2) {
    margin: 0;
    color: var(--heading-color);
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  :global(i) {
    color: var(--icon-color);
    text-shadow: 0 0 5px #000;
  }

  :global(a:hover) {
    color: var(--icon-color);
  }

  main {
    display: grid;
    grid-template-columns: 223px 21cm auto;
  }

  .menubar {
    grid-row: 1;
  }

  .main {
    display: grid;
    grid-column: 2;
    font-weight: bold;
    grid-template-columns: 251px auto;
    background: linear-gradient(#808080 0 0) 250px / 1px 100%,
      linear-gradient(to bottom, #fff 0%, #f0f0f0 100%) 251px / 100%,
      linear-gradient(to bottom, #404040 0%, #202020 100%);
    background-repeat: no-repeat;
    margin: 0 auto;
    margin-bottom: 8px;
    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
  }

  .main[size="A4"] {
    width: 21cm;
    height: 29.7cm;
  }

  .left {
    color: #c0c0c0;
    text-shadow: 0 0 3px #000;
    padding: 30px 35px 30px 40px;
    display: grid;
    caret-color: #fff;
    overflow-y: scroll;
  }

  .right {
    display: grid;
    padding: 40px 35px 30px 40px;
    grid-column: 2;
    caret-color: #000;
    overflow-y: scroll;
  }

  @media print {
    .main {
      margin: 0;
      box-shadow: 0;
      grid-column: 1;
    }

    .left {
      overflow: hidden;
    }

    .right {
      overflow: hidden;
    }
  }
</style>
