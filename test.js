"use strict";

function getOpt(parent){
  const opts = document.getElementById(parent).querySelectorAll("input[type=radio]");
  for (let r of opts){
    if (r.checked) return r.value;
  }
  return null;
}

function draw(){
  const testText = document.getElementById("text").value;
  const hAlign = getOpt("halignFieldset");
  const vAlign = getOpt("valignFieldset");

  const canvas = document.getElementById("c");
  canvas.classList.toggle("rtl", document.getElementById("rtl").checked);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.fillRect(64, 48, 256, 128);

  ctx.fillStyle = "red";
  ctx.font = "22px sans-serif";
  ctx.fillTextBox(testText, 64, 48, 256, 128, hAlign, vAlign);
  //ctx.fillText(testText, 64, 48);
}

document.addEventListener("DOMContentLoaded", function () {
  const optionsForm = document.getElementById("options");
  optionsForm.onsubmit = e => e.preventDefault();
  optionsForm.addEventListener("change", draw);
  document.getElementById("text").addEventListener("keyup", draw);
  draw();
});
