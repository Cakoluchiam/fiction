let header = `
      <div style="float:left;">
        <a href="https://www.projectlawful.com/boards/215">&laquo; Planecrash on ProjectLawful.com
        </a>
        <br>
        <div class="details">
          Post last updated: 2022-09-02 06:27
          <br>
          Generated: 2023-02-28 11:30
        </div>
      </div>
      <div class="float-right" style="text-align:right;">
        <a href="#toc_current" id="week_number" class="float-right">Weekly Reading</a>
        <br>
        <a href="https://discord.gg/RuGGVEAZau" style="">join the discussion on discord <img src="discord_logo.png" style="vertical-align:top;max-height:1.25rem;"></a>
        <br>
        <a href="https://www.youtube.com/playlist?list=PLAlH6yb8J7I0-UyuUbE3xRyaZv6jnv3yH"><img src="youtube_social_icon_red.png" style="max-height:1.25rem;vertical-align:top;" alt="youtube link"></a>
      </div>`;

header_element = document.getElementById("wwhb_header");
if(header_element !== null) header_element.innerHTML = header;