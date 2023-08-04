/*
 * Josh Chou
 * 07/16/2023
 * Section: CSE 154 AA, Marina Wooden
 * The is set.js which gives the set game its behavior.
 */
"use strict";

(function() {
  let guid;
  let pid;
  let hp;
  const POKE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  window.addEventListener("load", init);

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} isEasy true if the selected mode is "easy", false if "standard"
   * @return {div} returns a div element representing the card
   */
  async function init() {
    await fillPokedexView();
    id("charmander").classList.add("found");
    id("charmander").addEventListener("click", showP1Card);
    id("bulbasaur").classList.add("found");
    id("bulbasaur").addEventListener("click", showP1Card);
    id("squirtle").classList.add("found");
    id("squirtle").addEventListener("click", showP1Card);
    id("start-btn").addEventListener("click", startBtnBehavior);
    id("endgame").addEventListener("click", endGameBehavior);
    id("flee-btn").addEventListener("click", makeMove);
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} isEasy true if the selected mode is "easy", false if "standard"
   */
  async function startBtnBehavior() {
    id("pokedex-view").classList.add("hidden");
    id("p2").classList.remove("hidden");
    let url = POKE_URL + "/game.php";
    let params = new FormData();
    params.append("startgame", "true");
    params.append("mypokemon", qs("#p1 .name").textContent);
    try {
      const response = await fetch(url, {method: "POST", body: params});
      const data = await statusCheck(response);
      const jsonData = await data.json();
      guid = jsonData.guid;
      pid = jsonData.pid;
      hp = jsonData.p1.hp;
      showP2Card(jsonData);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} isEasy true if the selected mode is "easy", false if "standard"
   */
  function endGameBehavior() {
    id("pokedex-view").classList.remove("hidden");
    id("p2").classList.add("hidden");
    id("endgame").classList.add("hidden");
    id("results-container").classList.add("hidden");
    id("p1-turn-results").textContent = "";
    id("p2-turn-results").textContent = "";
    id("p2").classList.add("hidden");
    qs("#p1 .hp-info").classList.add("hidden");
    id("start-btn").classList.remove("hidden");
    qs("#p1 .hp").textContent = hp + "HP";
    qs("h1").textContent = "Your Pokedex";
    qs("#p1 .health-bar").style.width = "100%";
    qs("#p2 .health-bar").style.width = "100%";
    qs("#p1 .health-bar").classList.remove("low-health");
    qs("#p2 .health-bar").classList.remove("low-health");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} isEasy true if the selected mode is "easy", false if "standard"
   * @return {div} returns a div element representing the card
   */
  async function fillPokedexView() {
    try {
      const response = await fetch(POKE_URL + 'pokedex.php?pokedex=all');
      const data = await response.text();
      const lines = data.trim().split('\n');
      const extractedTexts = [];
      for (let line of lines) {
        const colonIndex = line.indexOf(':');
        const extractedText = line.slice(colonIndex + 1).trim();
        extractedTexts.push(extractedText);
      }
      const pokedexView = qs('#pokedex-view');
      for (let i = 0; i < extractedTexts.length; i++) {
        let newImg = document.createElement("img");
        newImg.src = POKE_URL + "sprites/" + extractedTexts[i] + ".png";
        newImg.classList.add("sprite");
        newImg.id = extractedTexts[i];
        newImg.alt = extractedTexts[i];
        pokedexView.appendChild(newImg);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} isEasy true if the selected mode is "easy", false if "standard"
   * @return {div} returns a div element representing the card
   */
  async function showP1Card() {
    const pokeResponse = await fetch(POKE_URL + 'pokedex.php?pokemon=' + this.id);
    const pokeData = await pokeResponse.json();
    qs("#p1 .name").textContent = pokeData.name;
    qs("#p1 .pokepic").src = POKE_URL + pokeData.images.photo;
    qs("#p1 .type").src = POKE_URL + pokeData.images.typeIcon;
    qs("#p1 .weakness").src = POKE_URL + pokeData.images.weaknessIcon;
    qs("#p1 .hp").textContent = pokeData.hp + "HP";
    qs("#p1 .info").textContent = pokeData.info.description;
    const buttons = qsa("#p1 .moves button");
    buttons.forEach(button => button.classList.add("hidden"));
    for (let move = 0; move < pokeData.moves.length; move++) {
      if (pokeData.moves[move].dp !== undefined) {
        addMove(pokeData.moves[move].name, pokeData.moves[move].dp, pokeData.moves[move].type);
      } else {
        addMoveNoDP(pokeData.moves[move].name, pokeData.moves[move].type);
      }
    }
    id("start-btn").classList.remove("hidden");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {boolean} pokeData true if the selected mode is "easy", false if "standard"
   */
  function showP2Card(pokeData) {
    qs("#p2 .name").textContent = pokeData.p2.name;
    qs("#p2 .pokepic").src = POKE_URL + pokeData.p2.images.photo;
    qs("#p2 .type").src = POKE_URL + pokeData.p2.images.typeIcon;
    qs("#p2 .weakness").src = POKE_URL + pokeData.p2.images.weaknessIcon;
    qs("#p2 .hp").textContent = pokeData.p2.hp + "HP";
    qs("#p2 .info").textContent = pokeData.p2.info.description;
    const buttons = qsa("#p2 .moves button");
    buttons.forEach(button => button.classList.add("hidden"));
    let p2Moves = pokeData.p2.moves;
    for (let move = 0; move < pokeData.p2.moves.length; move++) {
      if (pokeData.p2.moves[move].dp !== undefined) {
        addMoveP2(p2Moves[move].name, p2Moves[move].dp, p2Moves[move].type);
      } else {
        addMoveNoDPP2(pokeData.p2.moves[move].name, pokeData.p2.moves[move].type);
      }
    }
    for (let i = 0; i < qsa("#p1 .moves button").length; i++) {
      qsa("#p1 .moves button")[i].disabled = false;
      qsa("#p1 .moves button")[i].addEventListener("click", makeMove);
    }
    qs("h1").textContent = "Pokemon Battle!";
    id("start-btn").classList.add("hidden");
    qs(".hp-info").classList.remove("hidden");
    id("results-container").classList.remove("hidden");
    id("flee-btn").classList.remove("hidden");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} name true if the selected mode is "easy", false if "standard"
   * @param {String} dp true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  async function makeMove() {
    id("loading").classList.remove("hidden");
    let params = new FormData();
    if (this.id === "flee-btn") {
      params.append("movename", "flee");
    } else {
      params.append("movename", this.querySelector(".move").textContent);
    }
    params.append("guid", guid);
    params.append("pid", pid);
    try {
      const response = await fetch(POKE_URL + "game.php", {method: "POST", body: params});
      const data = await statusCheck(response);
      const jsonData = await data.json();
      id("loading").classList.add("hidden");
      id("results-container").classList.remove("hidden");
      id("p1-turn-results").classList.remove("hidden");
      id("p2-turn-results").classList.remove("hidden");
      id("p1-turn-results").textContent = "Player 1 played " +
      jsonData.results["p1-move"] + " and " + jsonData.results["p1-result"];
      if (jsonData.results["p2-move"] === null || jsonData.results["p2-result"] === null) {
        id("p2-turn-results").classList.add("hidden");
      }
      id("p2-turn-results").textContent = "Player 2 played " +
      jsonData.results["p2-move"] + " and " + jsonData.results["p2-result"];
      updateState(jsonData);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} jsonData true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function updateState(jsonData) {
    qs("#p1 .hp").textContent = jsonData.p1["current-hp"] + "HP";
    if ((100 * (jsonData.p1["current-hp"] / jsonData.p1.hp)) < 20) {
      qs("#p1 .health-bar").classList.add("low-health");
    }
    qs("#p1 .health-bar").style.width = 100 * (jsonData.p1["current-hp"] / jsonData.p1.hp) + "%";
    qs("#p2 .hp").textContent = jsonData.p2["current-hp"] + "HP";
    if ((100 * (jsonData.p2["current-hp"] / jsonData.p2.hp)) < 20) {
      qs("#p2 .health-bar").classList.add("low-health");
    }
    qs("#p2 .health-bar").style.width = 100 * (jsonData.p2["current-hp"] / jsonData.p2.hp) + "%";
    if ((100 * (jsonData.p1["current-hp"] / jsonData.p1.hp) <= 0)) {
      endGame("p2");
    } else if ((100 * (jsonData.p2["current-hp"] / jsonData.p2.hp) <= 0)) {
      if (!id(jsonData.p2.shortname).classList.contains("found")) {
        id(jsonData.p2.shortname).classList.add("found");
        id(jsonData.p2.shortname).addEventListener("click", showP1Card);
      }
      endGame("p1");
    }
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} winner true if the selected mode is "easy", false if "standard"
   * @param {String} dp true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function endGame(winner) {
    for (let i = 0; i < qsa("#p1 .moves button").length; i++) {
      qsa("#p1 .moves button")[i].disabled = true;
    }
    if (winner === "p1") {
      qs("h1").textContent = "You Win!";
    } else {
      qs("h1").textContent = "You Lose!";
    }
    id("endgame").classList.remove("hidden");
    id("flee-btn").classList.add("hidden");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} name true if the selected mode is "easy", false if "standard"
   * @param {String} dp true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function addMove(name, dp, type) {
    qs(".moves .hidden .move").textContent = name;
    qs(".moves .hidden img").alt = type;
    qs(".moves .hidden .dp").textContent = dp;
    qs(".moves .hidden img").src = POKE_URL + "icons/" + type + ".jpg";
    qs(".moves .hidden").classList.remove("hidden");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} name true if the selected mode is "easy", false if "standard"
   * @param {String} dp true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function addMoveP2(name, dp, type) {
    qs("#p2 .moves .hidden .move").textContent = name;
    qs("#p2 .moves .hidden img").alt = type;
    qs("#p2 .moves .hidden .dp").textContent = dp;
    qs("#p2 .moves .hidden img").src = POKE_URL + "icons/" + type + ".jpg";
    qs("#p2 .moves .hidden").classList.remove("hidden");
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} name true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function addMoveNoDP(name, type) {
    qs(".moves .hidden .move").textContent = name;
    qs(".moves .hidden img").alt = type;
    qs(".moves .hidden img").src = POKE_URL + "icons/" + type + ".jpg";
    qs(".moves .hidden .dp").textContent = "";
    qs(".moves .hidden").classList.remove("hidden");
  }

  /**
   * generates a unique card depending on the selected difficulty
   * div is given proper alt text and .card class
   * @param {String} name true if the selected mode is "easy", false if "standard"
   * @param {String} type true if the selected mode is "easy", false if "standard"
   */
  function addMoveNoDPP2(name, type) {
    qs("#p2 .moves .hidden .move").textContent = name;
    qs("#p2 .moves .hidden img").alt = type;
    qs("#p2 .moves .hidden img").src = POKE_URL + "icons/" + type + ".jpg";
    qs("#p2 .moves .hidden .dp").textContent = "";
    qs("#p2 .moves .hidden").classList.remove("hidden");
  }

  /**
   * This helper function simplifies the getElementById command
   * @param {String} id the id of the html element
   * @return {Element} the selected element
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * This helper function simplifies the querySelector command
   * @param {String} selector html selector of the element
   * @return {Element} the selected element
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * This function simplifies the querySelectorAll command
   * @param {String} selector the html selector of the element
   * @return {NodeList} the selected elements
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
