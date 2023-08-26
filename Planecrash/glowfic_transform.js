function get_tag_id(tag) {
  let anchors = tag.getElementsByTagName("a");
  let tag_id_list = [];
  for(let anchor of anchors) {
    if(anchor.parentElement !== tag) continue;
    let tag_id = anchor.id.split("-");
    if(tag_id[0] !== "reply" && tag_id[0] !== "post") {
      console.warn("tag has non-id anchor at toplevel with id: " + anchor.id);
      continue;
    }
    tag_id_list.push(Number.parseInt(tag_id[1]));
  }
  if(tag_id_list.length === 0) {
    if(!tag.classList.contains("post-post"))
      throw new Error("tag has no id");
    if(tag.parentElement.id !== "content")
      throw new Error("post not in top level");
    let edit_boxen = tag.parentElement.getElementsByClassName("post-edit-box");
    if(edit_boxen.length === 0)
      throw new Error("post has no edit box");
    let anchors = edit_boxen[0].getElementsByTagName("a");
    if(anchors.length === 0)
      throw new Error("post has no permalink");
    for(anchor of anchors) {
      if(anchor.rel !== "alternate" || !(anchor.href)) continue;
      let tag_id_path = anchor.href.split("/");
      let tag_id = tag_id_path[tag_id_path.length-1].split("?")[0];
      console.log(tag_id);
      if(!Number.isInteger(Number.parseInt(tag_id))) continue;
      if(tag_id_list.indexOf(tag_id) === -1)
        tag_id_list.push(tag_id);
    }
    if(tag_id_list.length === 0)
      throw new Error("post has no id");
  }
  if(tag_id_list.length > 1)
    throw new Error("tag has multiple ids: " + tag_id_list);
  return tag_id_list[0];
}

function get_tags_json(tag_list, last_tag_id=-1) {
  tag_list = tag_list.getElementsByClassName("post-reply");
  let tags_with_id = [];
  for(let tag of tag_list) {
    try {
      let tag_id = get_tag_id(tag);
      if(tag_id < last_tag_id) {
        let message = "Encountered nonsequential tag #" + tag_id;
        message += " following tag #" + last_tag_id;
        console.warn(message);
      }
      last_tag_id = tag_id;
      tags_with_id.push(tag_to_json(tag));
    } catch(error) {
      let message = "get_tags_json encountered error processing tag";
      message += " following tag #" + last_tag_id + ": " + error.message;
      console.warn(message);
    }
  }
  return tags_with_id;
}

function get_properties_html(tag, property_name) {
  // Character name
  let property_list = tag.getElementsByClassName(property_name);
  let properties = []
  for(let property of property_list) {
    properties.push(property.innerHTML);
  }
  return properties;
}

function tag_to_json(tag) {
  let json_tag = {};

  json_tag.id = get_tag_id(tag);

  let text_properties = [
    {
      name: "character",
      class: "post-character"
    },
    {
      name: "screenname",
      class: "post-screenname"
    },
    {
      name: "author",
      class: "post-author"
    },
    {
      name: "timestamp",
      class: "post-posted"
    },
    {
      name: "updated",
      class: "post-updated"
    }
  ];

  for(let property of text_properties) {
    let property_list = get_properties_html(tag, property.class);
    if(property_list.length > 1)
      throw new Error(
        "tag #" + json_tag.id + " has multiple " + property.name + "s",
        {cause: property_list}
      );
    else if(property_list.length == 1)
      json_tag[property.name] = property_list[0];
  }

  // Icon
  let icons = tag.getElementsByClassName("icon");
  if(icons.length > 1)
    throw new Error(
      "tag #" + json_tag.id + " has multiple icons",
      {cause: icons}
    );
  else if(icons.length == 1) {
    let icon = icons[0];
    json_tag["icon_url"] = icon.src;
    json_tag["icon_alt"] = icon.alt;
    json_tag["icon_title"] = icon.title;
  }

  // Content (separate for later enhancement?)
  let contents = get_properties_html(tag, "post-content");
  if(contents.length > 1)
    throw new Error(
      "tag #" + json_tag.id + " has multiple content boxen",
      {cause: contents}
    );
  else if(contents.length == 1) {
    json_tag.content = contents[0];
  }

  return json_tag;
}

function glowfic_to_json() {
  console.log("Beginning glowfic transform...");
  let content = document.getElementById("content");
  let tags = [];

  let lead_posts = content.getElementsByClassName("post-post");
  if(lead_posts.length < 1)
    console.warn("Thread has no lead post");
  else if(lead_posts.length > 1)
    throw new Error("Thread has multiple lead posts");
  else {
    let lead_post = lead_posts[0];
    let lead_post_id_anchor = document.createElement("a");
    tags.push(tag_to_json(lead_posts[0]));
  }

  let tag_lists = content.getElementsByClassName("flat-post-replies");
  if(tag_lists.length < 1)
    console.warn("Content has no lists of tags");
  if(tag_lists.length > 1)
    console.warn("Content has more than one list of tags");
  let last_tag_id = -1;
  for(let tag_list of tag_lists) {
    new_tags = get_tags_json(tag_list);
    if(new_tags.length === 0) {
      console.warn("Encountered empty tag list");
      continue;
    }
    new_tags_start_id = new_tags[0].id;
    if(new_tags_start_id < last_tag_id) {
      let message = "tag list includes nonsequential tag #";
      message += new_tags_start_id + " following tag #" + last_tag_id;
      console.warn(message);
    }
    tags = tags.concat(new_tags);
    last_tag_id = tags[tags.length-1].id;
  } 

  console.log("" + tags.length + " tags with id");

  console.log("...end glowfic transform.");

  return tags;
}

console.log(glowfic_to_json());