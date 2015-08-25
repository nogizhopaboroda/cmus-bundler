#!/usr/bin/env node

var fs = require("fs");

var HOME_DIR    = process.env.HOME || process.env.USERPROFILE;
var CMUS_DIR    = HOME_DIR + "/.cmus";
var RC_FILE     = CMUS_DIR + "/rc";
var THEMES_DIR  = CMUS_DIR + "/themes";
var PLUGINS_DIR = CMUS_DIR + "/plugins";



if (!fs.existsSync(CMUS_DIR)){
  console.log("~/.cmus directory created");
  fs.mkdirSync(CMUS_DIR);
}

if (!fs.existsSync(THEMES_DIR)){
  console.log("~/.cmus/themes directory created");
  fs.mkdirSync(THEMES_DIR);
}

if (!fs.existsSync(PLUGINS_DIR)){
  console.log("~/.cmus/plugins directory created");
  fs.mkdirSync(PLUGINS_DIR);
}

if (!fs.existsSync(RC_FILE)){
  console.log("~/.cmus/rc file created");
  fs.writeFileSync(RC_FILE, "");
}
