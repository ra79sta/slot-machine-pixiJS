import * as PIXI from "pixi.js";
import bagsOfGold from "../assets/bagsOfGold.png";
import gold from "../assets/gold.png";
import lepricon from "../assets/lepricon.png";
import guitarLepricon from "../assets/guitarLepricon.png";
import yellowLine from "../assets/yellow-line.png";
import plus from "../assets/plus.png";
import minus from "../assets/minus.png";
import info from "../assets/info.png";
import xMark from "../assets/x-mark.png";
import sound from "../assets/sounds/arcade-game-fruit-machine-jackpot-002-long.mp3";
import soundButonClick from "../assets/sounds/multimedia_button_click_006.mp3";
import winSound from "../assets/sounds/win-sound.mp3";

const app = new PIXI.Application({ backgroundColor: 0x15c7ee });

app.loader
  .add([
    { name: "bagsOfGold", url: bagsOfGold },
    { name: "gold", url: gold },
    { name: "lepricon", url: lepricon },
    { name: "guitarLepricon", url: guitarLepricon },
    { name: "yellowLine", url: yellowLine },
    { name: "plus", url: plus },
    { name: "minus", url: minus },
    { name: "info", url: info },
    { name: "xMark", url: xMark }
  ])
  .load(onAssetsLoaded);

const REEL_WIDTH = 240;
const SYMBOL_SIZE = 160;
const IMAGE_SIZE = 200;
let credit = 100;
let bet = 1;
let wonCredit = null;

function onAssetsLoaded() {
  // Create different slot symbols.
  let bagsOfGold = PIXI.Texture.from("bagsOfGold");
  let gold = PIXI.Texture.from("gold");
  let lepricon = PIXI.Texture.from("lepricon");
  let guitarLepricon = PIXI.Texture.from("guitarLepricon");
  let yellowLine = PIXI.Texture.from("yellowLine");
  let plus = PIXI.Texture.from("plus");
  let minus = PIXI.Texture.from("minus");
  let info = PIXI.Texture.from("info");
  let xMark = PIXI.Texture.from("xMark");

  const slotTextures = [
    { name: bagsOfGold },
    { name: gold },
    { name: lepricon },
    { name: guitarLepricon },
  ];

  // Build the reels
  const reels = [];
  const reelContainer = new PIXI.Container();
  for (let i = 0; i < 3; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter(),
    };
    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < slotTextures.length; j++) {
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)].name
      );

      // Scale the symbol to fit symbol area.
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelContainer);

  // Build the yellow line
  const line = new PIXI.Sprite(yellowLine);

  // Build top & bottom covers and position reelContainer
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

  reelContainer.y = margin;
  reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 3);

  const top = new PIXI.Graphics();
  top.beginFill(0, 1);
  top.drawRect(0, 0, app.screen.width, margin);

  const bottom = new PIXI.Graphics();
  bottom.beginFill(0, 1);
  bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

  // Build point box bet box and information box
  const pointsBox = new PIXI.Graphics();
  pointsBox.lineStyle(2, 0x15c7ee, 1);
  pointsBox.beginFill(0x15c7ee, 0.25);
  pointsBox.drawRoundedRect(
    30,
    SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2,
    90,
    35,
    10
  );
  pointsBox.endFill();

  const betBox = new PIXI.Graphics();
  betBox.lineStyle(2, 0x15c7ee, 1);
  betBox.beginFill(0x15c7ee, 0.25);
  betBox.drawRoundedRect(
    bottom.width - 160,
    SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2,
    90,
    35,
    10
  );
  betBox.endFill();

  // Info box
  const infoContainer = new PIXI.Container();

  const informationBox = new PIXI.Graphics();
  informationBox.lineStyle(2, 0xEA9191, 1);
  informationBox.beginFill(0xEA9191, 1);
  informationBox.drawRect(0, 0, app.screen.width, app.screen.height);
  informationBox.endFill();

  const guitarLepriconImage = new PIXI.Sprite(guitarLepricon);
  guitarLepriconImage.x = app.screen.width / 12;
  guitarLepriconImage.y = app.screen.height / 4 - IMAGE_SIZE / 2;
  guitarLepriconImage.scale.x = guitarLepriconImage.scale.y = Math.min(
    IMAGE_SIZE / guitarLepriconImage.width,
    IMAGE_SIZE / guitarLepriconImage.height
  );

  const lepriconImage = new PIXI.Sprite(lepricon);
  lepriconImage.x = app.screen.width / 12;
  lepriconImage.y = (app.screen.height * 3) / 4 - IMAGE_SIZE / 2;
  lepriconImage.scale.x = lepriconImage.scale.y = Math.min(
    IMAGE_SIZE / lepriconImage.width,
    IMAGE_SIZE / lepriconImage.height
  );

  const bagsOfGoldImage = new PIXI.Sprite(bagsOfGold);
  bagsOfGoldImage.x = app.screen.width / 2 + 20;
  bagsOfGoldImage.y = app.screen.height / 4 - IMAGE_SIZE / 2;
  bagsOfGoldImage.scale.x = bagsOfGoldImage.scale.y = Math.min(
    IMAGE_SIZE / bagsOfGoldImage.width,
    IMAGE_SIZE / bagsOfGoldImage.height
  );

  const goldImage = new PIXI.Sprite(gold);
  goldImage.x = app.screen.width / 2 + 20;
  goldImage.y = (app.screen.height * 3) / 4 - IMAGE_SIZE / 2;
  goldImage.scale.x = goldImage.scale.y = Math.min(
    IMAGE_SIZE / goldImage.width,
    IMAGE_SIZE / goldImage.height
  );
  const infoStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 17,
    fontStyle: "italic",
    fill: ["#ffffff", "#00ff99"], 
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
  });
  const infoTextGuitarLepricon = new PIXI.Text(`3 same in any horisontal line ${bet} credit`, infoStyle)
  infoTextGuitarLepricon.x = app.screen.width / 8
  infoTextGuitarLepricon.y = app.screen.height / 2 - 50

  const infoTextLepricon = new PIXI.Text(`3 same in any horisontal line ${bet*2} credit`, infoStyle)
  infoTextLepricon.x = app.screen.width / 8
  infoTextLepricon.y =  (app.screen.height * 3) / 4 + 60

  const infoTextBagsOfGold = new PIXI.Text(`3 same in any horisontal line ${bet*3} credit`, infoStyle)
  infoTextBagsOfGold.x = app.screen.width / 2 + 20
  infoTextBagsOfGold.y =  app.screen.height / 2 - 50

  const infoTextGold = new PIXI.Text(`3 same in any horisontal line ${bet*4} credit`, infoStyle)
  infoTextGold.x = app.screen.width / 2 + 20
  infoTextGold.y =  (app.screen.height * 3) / 4 + IMAGE_SIZE / 2 

  infoContainer.addChild(informationBox);
  infoContainer.addChild(guitarLepriconImage);
  infoContainer.addChild(lepriconImage);
  infoContainer.addChild(bagsOfGoldImage);
  infoContainer.addChild(goldImage);
  infoContainer.addChild(infoTextGuitarLepricon);
  infoContainer.addChild(infoTextLepricon);
  infoContainer.addChild(infoTextBagsOfGold);
  infoContainer.addChild(infoTextGold);

  // Add play text
  const style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"],
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
  });

  const playText = new PIXI.Text("PLAY", style);
  playText.x = Math.round((bottom.width - playText.width) / 2);
  playText.y =
    app.screen.height - margin + Math.round((margin - playText.height) / 2);
  bottom.addChild(playText);

  //Build spin play box
  const spinBox = new PIXI.Graphics();
  spinBox.lineStyle(2, 0x15c7ee, 1);
  spinBox.beginFill(0x15c7ee, 0.15);
  spinBox.drawRoundedRect(
    Math.round((bottom.width - playText.width) / 2),
    app.screen.height - margin + Math.round((margin - playText.height) / 2),
    playText.width,
    playText.height,
    10
  );
  spinBox.endFill();

  // Add header text
  const headerText = new PIXI.Text("LEPRICON SLOT!", style);
  headerText.x = Math.round((top.width - headerText.width) / 2);
  headerText.y = Math.round((margin - headerText.height) / 2);
  top.addChild(headerText);

  app.stage.addChild(top);
  app.stage.addChild(bottom);
  app.stage.addChild(pointsBox);
  app.stage.addChild(betBox);
  app.stage.addChild(spinBox);

  // Set the interactivity.
  playText.interactive = true;
  playText.buttonMode = true;
  playText.addListener("pointerdown", () => {
    startPlay();
    creditText.text = credit;
  });

  let running = false;
  const winnerSound = new Audio(winSound)
  // Function to start playing.
  function startPlay() {
    if (running) return;
    running = true;
    if (running) {
      plusButton.interactive = false;
      minusButton.interactive = false;
      const playSound = new Audio(sound);
      playSound.play();
    }
    creditBalance();
    winnerSound.pause();
    winnerSound.currentTime = 0
    app.stage.removeChild(winText);
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = 2500 + i * 600 + extra * 600;
      tweenTo(
        r,
        "position",
        target,
        time,
        backout(0.5),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );
    }
  }

  //Add stake buttons and info button
  function makeButton(image, MP3audio, x, y, scale) {
    const button = new PIXI.Sprite(image);
    const buttonClick = new Audio(MP3audio);
    button.on('pointerdown', event => buttonClick.play());
    button.interactive = true;
    button.buttonMode = true;
    app.stage.addChild(button);
    button.x = x;
    button.y = y;
    button.scale.set(scale);
    return button;
  }

  const minusButton = makeButton(
    minus,
    soundButonClick,
    bottom.width - 205,
    SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2,
    0.05
  );
  const plusButton = makeButton(
    plus,
    soundButonClick,
    bottom.width - 60,
    SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2,
    0.05
  );
  const infoButton = makeButton(
    info,
    soundButonClick,
    top.width - 40,
    (top.height - plusButton.height) / 2,
    0.05
  );

  //Make exit info button
  function makeExitButton(image, MP3audio, x, y, scale) {
    const button = new PIXI.Sprite(image);
    const buttonClick = new Audio(MP3audio);
    button.on('pointerdown', event => buttonClick.play());
    button.interactive = true;
    button.buttonMode = true;
    infoContainer.addChild(button);
    button.x = x;
    button.y = y;
    button.scale.set(scale);
    return button;
  }
  const exitInfoButton = makeExitButton(
    xMark,
    soundButonClick,
    top.width - 40,
    (top.height - plusButton.height) / 2,
    0.05
  );

  exitInfoButton.addListener("pointerdown", () => {
    app.stage.removeChild(infoContainer);
    plusButton.interactive = true;
    minusButton.interactive = true;
    playText.interactive = true;
    infoButton.interactive = true;
    exitInfoButton.interactive = false;
  });

  //Make bet and credit
  function addBet() {
    if (bet >= 1 && bet <= 2) {
      bet++;
    }
  }
  function minusBet() {
    if (bet > 1) {
      bet--;
    }
  }
  function creditBalance() {
    return (credit = credit - bet);
  }

  function checkCreditBalance() {
    if (credit < bet && credit > 0) {
      bet = credit;
      betText.text = `Bet:${bet}`;
    }
  }
  minusButton.addListener("pointerdown", () => {
    minusBet();
    betText.text = `Bet:${bet}`;
    infoTextGuitarLepricon.text = `3  same in any horisontal line ${bet} credit`;
    infoTextLepricon.text = `3 same in any horisontal line ${bet*2} credit`;
    infoTextBagsOfGold.text = `3 same in any horisontal line ${bet*3} credit`;
    infoTextGold.text = `3 same in any horisontal line ${bet*4} credit`;
  });
  plusButton.addListener("pointerdown", () => {
    addBet();
    if (credit <= bet) {
      plusButton.interactive = false;
    }
    betText.text = `Bet:${bet}`;
    infoTextGuitarLepricon.text = `3 same in any horisontal line ${bet} credit`;
    infoTextLepricon.text = `3 same in any horisontal line ${bet*2} credit`;
    infoTextBagsOfGold.text = `3 in any horisontal line ${bet*3} credit`;
    infoTextGold.text = `3 same in any horisontal line ${bet*4} credit`;
  });
  infoButton.addListener("pointerdown", () => {
    app.stage.addChild(infoContainer);
    plusButton.interactive = false;
    minusButton.interactive = false;
    playText.interactive = false;
    infoButton.interactive = false;
    exitInfoButton.interactive = true;
  });

  // Add bet text, credit text and win text
  const betStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"],
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
  });

  const winStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 50,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"],
    stroke: "#FDCC3D",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
  });

  const betText = new PIXI.Text(`Bet: ${bet}`, betStyle);
  betText.x = bottom.width - 150;
  betText.y = SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2;
  app.stage.addChild(betText);

  const creditText = new PIXI.Text(credit, betStyle);
  creditText.x = 60;
  creditText.y = SYMBOL_SIZE * 3 + margin + (bottom.height - 35) / 2;
  app.stage.addChild(creditText);

  const winText = new PIXI.Text(`YOU WON ${wonCredit}`, winStyle);
  winText.x = (app.screen.width - winText.width) / 2;
  winText.y = (app.screen.height - winText.height) / 2;

  // Reels done handler.
  function reelsComplete() {
    running = false;

    plusButton.interactive = true;
    minusButton.interactive = true;

    const positionOfSprites = [];
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const positionY = s.y;
        // const positionX = s.x;
        positionOfSprites.push({
          position: Math.round(positionY),
          id: s._texture.baseTexture.uid,
          name: s._texture.baseTexture.textureCacheIds[0],
        });
      }
    }
    checkWin(positionOfSprites);
    checkCreditBalance();
    if (credit === 0) {
      playText.interactive = false;
    }
  }

  function checkWinPrize(arr, spriteOf) {
    return arr.every((el) => el === spriteOf);
  }

  //Check which line wins
  function checkWin(arr) {
    let winLineFirst = [];
    let winLineSecond = [];
    let winLineThird = [];
    let firstLine = [];
    let secondLine = [];
    let thirdLine = [];
    let arrFromObj = [];
    let spriteBagsOfGold = 5;
    let spriteLepricon = 7;
    let spriteGold = 6;
    let spriteGuitarLepricon = 8;
    let cleardArrFromObj = [];
    for (let i = 0; i < arr.length; i++) {
      arrFromObj.push(Object.values(arr[i]));
    }
    cleardArrFromObj = arrFromObj.sort().splice(3);
    firstLine = cleardArrFromObj.slice(0, 3);
    secondLine = cleardArrFromObj.slice(3, 6);
    thirdLine = cleardArrFromObj.slice(6, 9);

    for (let i in firstLine) {
      for (let j in firstLine) {
        if (i !== j && firstLine[i][1] === firstLine[j][1]) {
          if (winLineFirst.indexOf(i) < 0) {
            winLineFirst.push(firstLine[i][1]);
          }
        }
      }
    }
    for (let i in secondLine) {
      for (let j in secondLine) {
        if (i !== j && secondLine[i][1] === secondLine[j][1]) {
          if (winLineSecond.indexOf(i) < 0) {
            winLineSecond.push(secondLine[i][1]);
          }
        }
      }
    }
    for (let i in thirdLine) {
      for (let j in thirdLine) {
        if (i !== j && thirdLine[i][1] === thirdLine[j][1]) {
          if (winLineThird.indexOf(i) < 0) {
            winLineThird.push(thirdLine[i][1]);
          }
        }
      }
    }

    function winnerLinePrize() {
      if (
        winLineFirst.length > 2 &&
        checkWinPrize(winLineFirst, spriteGuitarLepricon)
      ) {
        wonCredit = bet;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineFirst.length > 2 &&
        checkWinPrize(winLineFirst, spriteLepricon)
      ) {
        wonCredit = bet * 2;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineFirst.length > 2 &&
        checkWinPrize(winLineFirst, spriteBagsOfGold)
      ) {
        wonCredit = bet * 3;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineFirst.length > 2 &&
        checkWinPrize(winLineFirst, spriteGold)
      ) {
        wonCredit = bet * 4;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineSecond.length > 2 &&
        checkWinPrize(winLineSecond, spriteGuitarLepricon)
      ) {
        wonCredit = bet;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineSecond.length > 2 &&
        checkWinPrize(winLineSecond, spriteLepricon)
      ) {
        wonCredit = bet * 2;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineSecond.length > 2 &&
        checkWinPrize(winLineSecond, spriteBagsOfGold)
      ) {
        wonCredit = bet * 3;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineSecond.length > 2 &&
        checkWinPrize(winLineSecond, spriteGold)
      ) {
        wonCredit = bet * 4;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineThird.length > 2 &&
        checkWinPrize(winLineThird, spriteGuitarLepricon)
      ) {
        wonCredit = bet;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineThird.length > 2 &&
        checkWinPrize(winLineThird, spriteLepricon)
      ) {
        wonCredit = bet * 2;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineThird.length > 2 &&
        checkWinPrize(winLineThird, spriteBagsOfGold)
      ) {
        wonCredit = bet * 3;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      } else if (
        winLineThird.length > 2 &&
        checkWinPrize(winLineThird, spriteGold)
      ) {
        wonCredit = bet * 4;
        credit = credit + wonCredit;
        creditText.text = credit;
        winText.text = `YOU WON ${wonCredit}`;
      }
    }
    

    function showLines() {
      if (winLineFirst.length > 2) {
        line.x = 0;
        line.y = -100;
        app.stage.addChild(line);
        app.stage.addChild(winText);
        winnerSound.play();
        setTimeout(function () {
          app.stage.removeChild(line);
        }, 800);
      } else if (winLineSecond.length > 2) {
        line.x = 0;
        line.y = 60;
        app.stage.addChild(line);
        app.stage.addChild(winText);
        winnerSound.play();
        setTimeout(function () {
          app.stage.removeChild(line);
        }, 800);
      } else if (winLineThird.length > 2) {
        line.x = 0;
        line.y = 200;
        app.stage.addChild(line);
        app.stage.addChild(winText);
        winnerSound.play();
        setTimeout(function () {
          app.stage.removeChild(line);
        }, 800);
      }
    }

    function lineWinner() {
        showLines();
        winnerLinePrize();
    }

    return lineWinner();
  }

  // Listen for animate update.
  app.ticker.add((delta) => {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Detect going over and swap a texture.
          s.texture =
            slotTextures[Math.floor(Math.random() * slotTextures.length)].name;
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });
}

const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange,
    complete: oncomplete,
    start: Date.now(),
  };

  tweening.push(tween);
  return tween;
}

// Listen for animate update.
app.ticker.add((delta) => {
  const now = Date.now();
  const remove = [];
  for (let i = 0; i < tweening.length; i++) {
    const t = tweening[i];
    const phase = Math.min(1, (now - t.start) / t.time);

    t.object[t.property] = lerp(
      t.propertyBeginValue,
      t.target,
      t.easing(phase)
    );
    if (t.change) t.change(t);
    if (phase === 1) {
      t.object[t.property] = t.target;
      if (t.complete) t.complete(t);
      remove.push(t);
    }
  }
  for (let i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});

function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

function backout(amount) {
  return (t) => --t * t * ((amount + 1) * t + amount) + 1;
}

export default app;
