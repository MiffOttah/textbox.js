"use strict";

// textbox.js
// version 1.0.1
// Copyright © 2021 MiffTheFox
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function(){

  const ALIGN_NEAR = 0;
  const ALIGN_CENTER = 1;
  const ALIGN_FAR = 2;

  const NEWLINE_REGEXP = /[\f\n\r\v\u0085\u2028\u2029]/g;
  const SPACE_REGEXP = /[ \t\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]+/g;

  function isLTR(element){
    return window.getComputedStyle(element, null).getPropertyValue("direction") !== "rtl";
  }

  function interpretHAlign(ctx, hAlign){
    switch ((hAlign || ctx.textAlign).toString().toLowerCase()){
      case "start": return isLTR(ctx.canvas) ? ALIGN_NEAR : ALIGN_FAR;
      case "end": return isLTR(ctx.canvas) ? ALIGN_FAR : ALIGN_NEAR;
      case "c": case "center": return ALIGN_CENTER;
      case "r": case "right": return ALIGN_FAR;
      default: return ALIGN_NEAR;
    }
  }

  function interpretVAlign(ctx, vAlign){
    if (!vAlign) return ALIGN_NEAR;
    switch (vAlign.toString().toLowerCase()){
      case "center": case "middle": return ALIGN_CENTER;
      case "far": case "b": case "bottom": return ALIGN_FAR;
      default: return ALIGN_NEAR;
    }
  }

  function draw(ctx, text, x, y, width, height, hAlign, vAlign, drawMethod){
    if (!text) return; // drawing an empty string (or falsy object) is a no-op
    text = text.toString();

    const lines = [null];
    let maxAscent = 0;
    let maxDescent = 0;
    let lineIndex = 0;

    // there's cross-browser compatiblity stuff in 2021 apparently
    function measure(text){
      const measurements = ctx.measureText(text);
      const a = measurements.fontBoundingBoxAscent || measurements.actualBoundingBoxAscent;
      if (a > maxAscent) maxAscent = a;
      const d = measurements.fontBoundingBoxDescent || measurements.actualBoundingBoxDescent;
      if (d > maxDescent) maxDescent = d;
      return measurements;
    }

    // newlines must be in their own word
    const words = text.replace(NEWLINE_REGEXP, " \n ").replace(SPACE_REGEXP, " ").split(" ");
    //console.log("words = %o", words);

    // this is where the fun begins
    for (let word of words){
      if (word === "\n"){
        // force a newline because of the \n
        lines.push(null);
        lineIndex++;
      } else {
        if (lines[lineIndex]){
          const potentialLine = lines[lineIndex].concat(" ", word);
          const measurements = measure(potentialLine);

          if (measurements.width > width){
            // potentialLine too long, so put the word on its own line
            lines.push(word);
            lineIndex++;
          } else {
            lines[lineIndex] = potentialLine;
          }
        } else {
          // if the line's blank, just set the line value directly
          // this way, a word that's way too long for the text box won't wrap
          lines[lineIndex] = word;

          // also make sure to grab the ascent and descent for the standalone word
          measure(word);
        }
      }
    }

    const oldTextAlign = ctx.textAlign; // save this so we can reset it
    const ha2 = interpretHAlign(ctx, hAlign);
    const va2 = interpretVAlign(ctx, vAlign);

    const lineHeight = maxAscent + maxDescent;
    const blockHeight = lines.length * lineHeight;
    ctx.textAlign = ["left", "center", "right"][ha2];

    // calcuate starting position
    let drawX = x;
    if (ha2 === ALIGN_FAR) { drawX += width; }
    else if (ha2 === ALIGN_CENTER) { drawX += width / 2; }

    let drawY = y;
    if (va2 === ALIGN_FAR) { drawY += height - blockHeight; }
    else if (va2 === ALIGN_CENTER) { drawY += (height - blockHeight) / 2; }
    drawY += maxAscent; // move to the first text baseline

    // draw lines
    for (let line of lines){
      if (line){
        drawMethod.call(ctx, line, drawX, drawY);
      }
      drawY += lineHeight;
    }

    // reset context textAlign
    ctx.textAlign = oldTextAlign;
  }

  window.CanvasRenderingContext2D.prototype.fillTextBox = function(text, x, y, width, height, hAlign = null, vAlign = null){
    draw(this, text, x, y, width, height, hAlign, vAlign, window.CanvasRenderingContext2D.prototype.fillText);
  };

})();
