<script>
  export let avatar,
    aboutme,
    interests,
    contact,
    social,
    name,
    skillsr,
    work,
    education,
    certifications,
    projects,
    achievements,
    positions,
    skillsl,
    customl,
    customr;

  const setState = (classname) => {
    if (classname == "avatar") {
      avatar = !avatar;
    } else if (classname == "aboutme") {
      aboutme = !aboutme;
    } else if (classname == "interests") {
      interests = !interests;
    } else if (classname == "contact") {
      contact = !contact;
    } else if (classname == "social-media") {
      social = !social;
    } else if (classname == "name") {
      name = !name;
    } else if (classname == "skillsr") {
      skillsr = !skillsr;
    } else if (classname == "work-experience") {
      work = !work;
    } else if (classname == "education") {
      education = !education;
    } else if (classname == "certifications") {
      certifications = !certifications;
    } else if (classname == "projects") {
      projects = !projects;
    } else if (classname == "achievements") {
      achievements = !achievements;
    } else if (classname == "positions") {
      positions = !positions;
    } else if (classname == "skillsl") {
      skillsl = !skillsl;
    } else if (classname == "customl") {
      customl = !customl;
    } else if (classname == "customr") {
      customr = !customr;
    }
  };
</script>

<div class="menu">
  <div class="togglers">
    <h2>TOGGLE</h2>
    <div class="toggler">
      <span class="avatar" on:click={() => setState("avatar")}>
        <i class="far" class:fa-star={!avatar} />
        <i class="fas" class:fa-star={avatar} />
      </span>
      <p>AVATAR</p>
    </div>
    <div class="toggler">
      <span class="aboutme" on:click={() => setState("aboutme")}>
        <i class="far" class:fa-star={!aboutme} />
        <i class="fas" class:fa-star={aboutme} />
      </span>
      <p>ABOUT ME</p>
    </div>
    <div class="toggler">
      <span class="interests" on:click={() => setState("interests")}>
        <i class="far" class:fa-star={!interests} />
        <i class="fas" class:fa-star={interests} />
      </span>
      <p>INTERESTS</p>
    </div>
    <div class="toggler">
      <span class="contact" on:click={() => setState("contact")}>
        <i class="far" class:fa-star={!contact} />
        <i class="fas" class:fa-star={contact} />
      </span>
      <p>CONTACT</p>
    </div>
    <div class="toggler">
      <span class="social-media" on:click={() => setState("social-media")}>
        <i class="far" class:fa-star={!social} />
        <i class="fas" class:fa-star={social} />
      </span>
      <p>SOCIAL MEDIA</p>
    </div>
    <div class="toggler">
      <span class="name" on:click={() => setState("name")}>
        <i class="far" class:fa-star={!name} />
        <i class="fas" class:fa-star={name} />
      </span>
      <p>NAME</p>
    </div>
    <div class="toggler">
      <span class="skillsr" on:click={() => setState("skillsr")}>
        <i class="far" class:fa-star={!skillsr} />
        <i class="fas" class:fa-star={skillsr} />
      </span>
      <p>SKILLS</p>
    </div>
    <div class="toggler">
      <span
        class="work-experience"
        on:click={() => setState("work-experience")}
      >
        <i class="far" class:fa-star={!work} />
        <i class="fas" class:fa-star={work} />
      </span>
      <p>WORK EXPERIENCE</p>
    </div>
    <div class="toggler">
      <span class="education" on:click={() => setState("education")}>
        <i class="far" class:fa-star={!education} />
        <i class="fas" class:fa-star={education} />
      </span>
      <p>EDUCATION</p>
    </div>
    <div class="toggler">
      <span class="certifications" on:click={() => setState("certifications")}>
        <i class="far" class:fa-star={!certifications} />
        <i class="fas" class:fa-star={certifications} />
      </span>
      <p>CERTIFICATIONS</p>
    </div>
    <div class="toggler">
      <span class="projects" on:click={() => setState("projects")}>
        <i class="far" class:fa-star={!projects} />
        <i class="fas" class:fa-star={projects} />
      </span>
      <p>PROJECTS</p>
    </div>
    <div class="toggler">
      <span class="achievements" on:click={() => setState("achievements")}>
        <i class="far" class:fa-star={!achievements} />
        <i class="fas" class:fa-star={achievements} />
      </span>
      <p>ACHIEVEMENTS</p>
    </div>
    <div class="toggler">
      <span class="positions" on:click={() => setState("positions")}>
        <i class="far" class:fa-star={!positions} />
        <i class="fas" class:fa-star={positions} />
      </span>
      <p>POSITIONS</p>
    </div>
  </div>

  <div class="togglers">
    <h2>OTHERS</h2>
    <div class="toggler">
      <span class="skillsl" on:click={() => setState("skillsl")}>
        <i class="far" class:fa-star={!skillsl} />
        <i class="fas" class:fa-star={skillsl} />
      </span>
      <p>SKILLS (LEFT)</p>
    </div>
    <div class="toggler">
      <span class="customl" on:click={() => setState("customl")}>
        <i class="far" class:fa-star={!customl} />
        <i class="fas" class:fa-star={customl} />
      </span>
      <p>CUSTOM (LEFT)</p>
    </div>
    <div class="toggler">
      <span class="customr" on:click={() => setState("customr")}>
        <i class="far" class:fa-star={!customr} />
        <i class="fas" class:fa-star={customr} />
      </span>
      <p>CUSTOM (RIGHT)</p>
    </div>
  </div>
</div>

<style>
  h2 {
    color: #ffffff;
    text-shadow: 0 0 5px #ffffff;
  }

  .menu {
    height: 1086px;
    width: 175px;
    float: left;
    display: grid;
    margin: 8px 8px 8px 0;
    padding: 0 20px 0 20px;
    grid-row-gap: 35px;

    text-transform: uppercase;
    font-size: 14px;
    color: #ffffff;
    background: linear-gradient(#202020, #000000);
    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }

  .togglers {
    padding: 20px 0 20px 0;
    width: 160px;
  }

  .toggler {
    grid-template-columns: 30px 150px;
    display: grid;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 10px 0 0 10px;
  }

  .toggler > span > i {
    grid-row: 1;
    color: #ffffff;
    text-shadow: 0 0 5px #ffffff;
    place-self: center;
    margin: 0;
  }

  .toggler > p {
    margin: 0 0 0 5px;
    text-align: left;
  }

  @media print {
    .menu {
      display: none;
    }
  }

  ::selection {
    color: #000000;
    background: #ffffff;
    text-shadow: 0 0 3px #000000;
  }
</style>
