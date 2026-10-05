//TODO HACER QUE EL NOMBRE, EL TIEMPO Y EL NUMERO DE PREGUNTAS RESPONDIDAS APAREZCAN EN UN CARD FLOTANTE AL LADO
//QUIZÁ PONER EL PROGRES DE PUNTA A PUNTA?

const NPREG = 10;
const NBUTTONS = 4;

let arrayPreguntes = [];
let pctAct = 0;
let sessionId;
let segons = 0;
let myTimer;
let pregActual = 0;

let estatDeLaPartida = {
  contadorPreguntes: 0,
  respostesUsu: []
}

estatDeLaPartida.respostesUsu = new Array(NPREG).fill(null);

//-------------------------------- MAIN --------------------------------

fetch('./dades')
  .then(dades => dades.json())
  .then(data => {

    console.log("dades carregades!", data);

    sessionId = data.sessionId;
    arrayPreguntes = data.questions;

    iniciarPartida(arrayPreguntes);
  });

//-------------------------------- FUNCIONS --------------------------------

function iniciarPartida(preguntes){

  let htmlStr = ""

  for (let i = 0; i < NPREG; i++){

    htmlStr +=
      `<div id="pregunta-${i}" class="card border-danger mt-3 pb-3 mx-auto d-none" style="max-width: 580px; height: 540px; overflow-y: auto;">

        <div class="card-header text-center">
          Pregunta ${i + 1}
        </div>

        <div class="card-body">

          <img class="mb-2 d-block mx-auto"
              width="250px"
              height="200px"
              style="object-fit: contain;" 
               src="${preguntes[i].imatge}">

          <h4 class="card-title text-center mb-3">
            ${preguntes[i].pregunta}
          </h4>

          <div class="row g-2 mx-2">

            <div class="col-6">
              <button id="resposta-${i}-0"
                      class="btn btn-primary w-100 resposta">
                ${preguntes[i].respostes[0].resposta}
              </button>
            </div>

            <div class="col-6">
              <button id="resposta-${i}-1"
                      class="btn btn-primary w-100 resposta">
                ${preguntes[i].respostes[1].resposta}
              </button>
            </div>

            <div class="col-6">
              <button id="resposta-${i}-2"
                      class="btn btn-primary w-100 resposta">
                ${preguntes[i].respostes[2].resposta}
              </button>
            </div>

            <div class="col-6">
              <button id="resposta-${i}-3"
                      class="btn btn-primary w-100 resposta">
                ${preguntes[i].respostes[3].resposta}
              </button>
            </div>
          </div>
        </div>
      </div>`
  }

  document.getElementById("partida").innerHTML = htmlStr;
  document.getElementById("pregunta-0").classList.remove("d-none");
  renderitzarMarcador();
  myTimer = setInterval(jocTimer, 1000);
}


function marcar(preg, res){

  for(let i = 0; i < NBUTTONS; i++){

    document.getElementById(`resposta-${preg}-${i}`).classList.remove("active");

  }

  document.getElementById(`resposta-${preg}-${res}`).classList.add("active");


  let pregId = arrayPreguntes[preg].id;
  let resId = arrayPreguntes[preg].respostes[res].id;


  console.log("A la pregunta " + pregId + " s'ha escollit l'opció " + resId);


  if(estatDeLaPartida.respostesUsu[preg] == null){

    estatDeLaPartida.contadorPreguntes++;

  }


  estatDeLaPartida.respostesUsu[preg] = {
    id: pregId,
    res: resId
  };


  if(estatDeLaPartida.contadorPreguntes == NPREG){

    document.getElementById("btnEnviar").classList.remove("d-none");

  }


  renderitzarMarcador();

  console.log(estatDeLaPartida.contadorPreguntes);
  console.log(estatDeLaPartida.respostesUsu);
}


function renderitzarMarcador(){

  pctAct = (estatDeLaPartida.contadorPreguntes / NPREG) * 100;

  document.getElementById("marcador").innerHTML =
    `
      <div class="progress">

        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar"
             aria-valuenow="${pctAct}"
             aria-valuemin="1"
             aria-valuemax="${NPREG}"
             style="width:${pctAct}%;">
        </div>

      </div>
    `
}


function enviarRespostes(){
  clearInterval(myTimer);

  fetch('./respostes', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      respostes_usuari: estatDeLaPartida.respostesUsu,
      temps: segons
    })
  })
  .then(resposta => resposta.json())
  .then(data => {
    respostaEncerts(data.Encerts);

    document.getElementById("resultatText").innerHTML =
      "Has encertat " + data.Encerts +
      " de " + data.Respostes + " preguntes!" +
      "<br>" +
      "Temps emprat: " + document.getElementById("timer").innerHTML;

    document.getElementById("joc").classList.add("d-none");

    document.getElementById("resultat").classList.remove("d-none");
  });
}

function jocTimer(){
  segons++;

  let hores = Math.floor(segons/3600);//Calculem les hores senceres
  let minuts = Math.floor((segons%3600)/60); //Calculamos de la resta de segundos que quedan despues de calcular las horas
  let segActuals = segons % 60; //Los segundos restantes despues de quitar los minutos enteros

  if(hores < 10){
    hores = "0" + hores; //por si son 2h que salga 02
  }

  if(minuts < 10){
    minuts = "0" + minuts;
  }

  if(segActuals < 10){
    segActuals = "0" + segActuals;
  }
   
  document.getElementById("timer").innerHTML = hores + ":" + minuts + ":" + segActuals;
}

function seguentPregunta(){
  if(pregActual < (NPREG - 1)){
    document.getElementById(`pregunta-${pregActual}`).classList.add("d-none");

    pregActual++;

    document.getElementById(`pregunta-${pregActual}`).classList.remove("d-none");
  }
}

function preguntaAnterior(){
  if(pregActual > 0){
    document.getElementById(`pregunta-${pregActual}`).classList.add("d-none");

    pregActual--;

    document.getElementById(`pregunta-${pregActual}`).classList.remove("d-none");
  }
}

function respostaEncerts(encerts){ //Canvia el text i el color del card segons el resultat!
  let text = "";
  let cardResultat = document.getElementById("cardResultat");

  cardResultat.classList.remove(
    "border-success",
    "border-warning",
    "border-danger"
  );

  if(encerts >= 8){
    text = "Molt bé! ";
    cardResultat.classList.add("border-success");

  }else if(encerts >= 5){
    text = "No està gens malament! ";
    cardResultat.classList.add("border-warning");

  }else{
    text = "A la próxima anirà millor! ";
    cardResultat.classList.add("border-danger");
    
  }
  document.getElementById("titleText").innerHTML = text;
}

//-------------------------------- EVENTS --------------------------------

window.addEventListener("load", function(){ // mirem el localstorage 
  let nomLS = localStorage.getItem("nom"); 
  console.log(nomLS); 

  if(nomLS != null){ 
    document.getElementById("nomJugador").innerHTML = "Jugador: " + nomLS;
    document.getElementById("benvinguda").classList.add("d-none");
    document.getElementById("joc").classList.remove("d-none"); 
  }
});

document.getElementById("partida").addEventListener("click", function(event){

  if(event.target.classList.contains("resposta")){

    let idPreg = event.target.id;

    let partes = idPreg.split("-");

    let preg = partes[1];
    let res = partes[2];

    marcar(preg, res);
  }

});


document.getElementById("btnEnviar").addEventListener("click", function(event){

  enviarRespostes();

});


document.getElementById("btnEnviaNom").addEventListener("click", function(){

  let nomLS = document.getElementById("inputNom").value;

  localStorage.setItem("nom", nomLS);

  document.getElementById("nomJugador").innerHTML = "Jugador: " + nomLS;
  document.getElementById("benvinguda").classList.add("d-none");
  document.getElementById("joc").classList.remove("d-none");
});

document.getElementById("btnSortir").addEventListener("click", function(event){
  localStorage.removeItem("nom");

  location.reload();
  //recarrega la pagina automaticament
});

document.getElementById("seguent").addEventListener("click", function(){
  seguentPregunta();
});

document.getElementById("anterior").addEventListener("click", function(){
  preguntaAnterior();
});

document.getElementById("btnRepetir").addEventListener("click",function(){
  location.reload(); //Recarrega la pagina per obtenir 10 noves preguntes.
});

document.getElementById("btnTancar").addEventListener("click",function(){
  localStorage.removeItem("nom"); //Esborrem el nom
  location.reload(); //Recarrega la pagina i torna a benvinguda
});

