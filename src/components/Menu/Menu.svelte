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
    customr,
    colorBool,
    color,
    leftHeading,
    rightHeading,
    avatarColor,
    leftProgressBorder,
    rightProgressBorder,
    iconColor,
    circleColor,
    circleBorder,
    leftSkillsColor,
    leftSkillsBackground,
    rightSkillsBackground;

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

  const setColor = (colors, num) => {
    let colorArray = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      colorArray[i] =
        parseInt(colors[i], 16) - num <= 0
          ? "00"
          : parseInt(colors[i], 16) - num <= 15
          ? "0" + (parseInt(colors[i], 16) - num).toString(16)
          : (parseInt(colors[i], 16) - num).toString(16);
    }

    colorArray = "#" + colorArray.join("");
    return colorArray;
  };

  const setLightColor = (H, num) => {
    let r = 0,
      g = 0,
      b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }

    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    l = num;

    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r2 = 0,
      g2 = 0,
      b2 = 0;

    if (0 <= h && h < 60) {
      r2 = c;
      g2 = x;
      b2 = 0;
    } else if (60 <= h && h < 120) {
      r2 = x;
      g2 = c;
      b2 = 0;
    } else if (120 <= h && h < 180) {
      r2 = 0;
      g2 = c;
      b2 = x;
    } else if (180 <= h && h < 240) {
      r2 = 0;
      g2 = x;
      b2 = c;
    } else if (240 <= h && h < 300) {
      r2 = x;
      g2 = 0;
      b2 = c;
    } else if (300 <= h && h < 360) {
      r2 = c;
      g2 = 0;
      b2 = x;
    }

    r2 = Math.round((r2 + m) * 255).toString(16);
    g2 = Math.round((g2 + m) * 255).toString(16);
    b2 = Math.round((b2 + m) * 255).toString(16);

    if (r2.length == 1) r2 = "0" + r2;
    if (g2.length == 1) g2 = "0" + g2;
    if (b2.length == 1) b2 = "0" + b2;

    return "#" + r2 + g2 + b2;
  };

  const setTheme = () => {
    let temp = color.replace("#", "");
    let colors = [temp.slice(0, 2), temp.slice(2, 4), temp.slice(4, 6)];

    leftHeading = color;
    rightHeading = setColor(colors, 15);
    avatarColor = color;
    leftProgressBorder = setColor(colors, 191);
    rightProgressBorder = setLightColor(color, 88);
    iconColor = color;
    circleColor = color;
    circleBorder = setLightColor(color, 88);
    leftSkillsColor = "#fff";
    leftSkillsBackground = color;
    rightSkillsBackground = color;
    colorBool = true;
  };

  const setDefaultTheme = () => {
    leftHeading = "#fff";
    rightHeading = "#000";
    avatarColor = "#fff";
    leftProgressBorder = "#c0c0c0";
    rightProgressBorder = "#404040";
    iconColor = "#fff";
    circleColor = "#000";
    circleBorder = "#c0c0c0";
    leftSkillsColor = "#000";
    leftSkillsBackground = "#fff";
    rightSkillsBackground = "#000";
    colorBool = false;
  };
</script>

<div class="menu">
  <div class="heading">
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

  <div class="heading">
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

  <div class="heading">
    <h2>CHANGE THEME</h2>
    <div class="toggler">
      <span
        class="color"
        on:click={() => {
          setState("color");
          setTheme;
        }}
      >
        <i class="far" class:fa-star={colorBool == false} on:click={setTheme} />
        <i
          class="fas"
          class:fa-star={colorBool == true}
          on:click={setDefaultTheme}
        />
      </span>
      <input type="color" bind:value={color} on:input={setTheme} />
    </div>
  </div>
</div>

<style>
  h2 {
    color: #fff;
    text-shadow: 0 0 5px #fff;
  }

  input {
    border-radius: 5px;
    background: #fff;
    height: 25px;
    width: 25px;
    padding: 1px;
    cursor: pointer;
    margin-left: 5px;
    grid-column: 2;
  }

  input:hover {
    background: #ddd;
  }

  input:active {
    background: #888;
  }

  .menu {
    width: 175px;
    display: grid;
    padding: 20px;
    grid-row-gap: 50px;

    text-transform: uppercase;
    font-size: 14px;
    color: #fff;
    background: linear-gradient(#202020, #000);
    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }

  .heading {
    width: 160px;
  }

  .toggler {
    grid-template-columns: 30px 150px;
    display: grid;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 10px 0 0 10px;
    align-items: center;
  }

  .toggler > span > i {
    grid-row: 1;
    color: #fff;
    text-shadow: 0 0 5px #fff;
    place-self: center;
    margin: 0;
  }

  .toggler > p {
    margin: 0 0 0 5px;
  }

  @media print {
    .menu {
      display: none;
    }
  }
</style>
