let formulario = document.querySelector("form");

if(formulario){
    formulario.addEventListener("submit", crearPregunta);
}

const params = new URLSearchParams(window.location.search);
const idPregunta = params.get("id");
let imgActual = "";

//si el form es per crear el titol es diferent de modifcar
const titolFormulari = document.getElementById("titolFormulari");

if(titolFormulari){
    if(idPregunta){
        titolFormulari.textContent = "Modificar pregunta";
    }else{
        titolFormulari.textContent = "Nova pregunta";
    }

}

//si es crea una nova pregunta la img es obligatoria, si es modifica, no ho es
const inputImatge = document.getElementById("formFile");
if(inputImatge){

    if(idPregunta){
        inputImatge.required = false;
        carregarPreguntaEdit();
    }else{
        inputImatge.required = true;
    }
}

async function crearPregunta(event){
    event.preventDefault();

    let respostaCorrecta = document.querySelector(
        'input[name="respostesRadios"]:checked'
    ).value;

    let pregunta = {
        pregunta: "De quin país és aquesta bandera?",
        imatge: imgActual,
        respostes: [
            {
                id: 1,
                resposta: document.getElementById("respostesForm1").value,
                correcta: respostaCorrecta == "1"
            },
            {
                id: 2,
                resposta: document.getElementById("respostesForm2").value,
                correcta: respostaCorrecta == "2"
            },
            {
                id: 3,
                resposta: document.getElementById("respostesForm3").value,
                correcta: respostaCorrecta == "3"
            },
            {
                id: 4,
                resposta: document.getElementById("respostesForm4").value,
                correcta: respostaCorrecta == "4"
            }
        ]
    };

    

    if(idPregunta){
        // MODIFICAR
        let formData = new FormData();
        let imatge = document.getElementById("formFile").files[0];

        if(imatge){
            formData.append("imgBandera", imatge);
        }

        formData.append(
            "pregunta",
            JSON.stringify(pregunta)
        );

        const resposta = await fetch("/preguntes/" + idPregunta, {
            method: "PUT",
            body: formData
        });
        if(resposta.ok){
            const modal = new bootstrap.Modal(
                document.getElementById("modalPreguntaEdit")
            );
            modal.show();
        }

    }else{
        // CREAR
        let formData = new FormData();
        let imatge = document.getElementById("formFile").files[0];

        formData.append("imgBandera", imatge);

        formData.append(
            "pregunta",
            JSON.stringify(pregunta)
        );

        const resposta = await fetch("/preguntes", {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            const modal = new bootstrap.Modal(
                document.getElementById("modalPreguntaCreada")
            );
            modal.show();
        }
    }
}

async function carregarPreguntaEdit(){
    try{
        const resposta = await fetch("/preguntes");
        const preguntes = await resposta.json();

        for(let i=0; i < preguntes.length; i++){

            if(preguntes[i].id == idPregunta){
                imgActual = preguntes[i].imatge;
                document.getElementById("respostesForm1").value = preguntes[i].respostes[0].resposta;
                document.getElementById("respostesForm2").value = preguntes[i].respostes[1].resposta;
                document.getElementById("respostesForm3").value = preguntes[i].respostes[2].resposta;
                document.getElementById("respostesForm4").value = preguntes[i].respostes[3].resposta;

                for(let j=0; j < preguntes[i].respostes.length; j++){
                    if(preguntes[i].respostes[j].correcta == 1){
                        document.getElementById(
                            "respostaCorrecta" + (j+1)
                        ).checked = true;
                    }
                }    
            }
        }

    }catch(error){
        console.log("Hi ha hagut algun error. " + error);
    }
}

async function carregarPreguntes(mostrarEditar) {

    try {

        const resposta = await fetch("/preguntes");
        const preguntes = await resposta.json();
        const taula = document.getElementById("taulaPreguntes");
        let htmlStr = "";
        

        for(let i = 0; i < preguntes.length; i++){

            let respostes ="";
            
            for(let j = 0; j < preguntes[i].respostes.length; j++){
                respostes += preguntes[i].respostes[j].resposta;
                if (preguntes[i].respostes[j].correcta == 1) {
                    respostes += " ✓";
                }
                if (j < preguntes[i].respostes.length - 1) {
                    respostes += "<br>";
                }
            }

            let btnAccio = "";

            if(mostrarEditar == "editar"){
                btnAccio = `
                    <td>
                        <button class="btn border-0 bg-transparent p-0 mt-2"
                                onclick="editarPregunta(${preguntes[i].id})">
                            ✏️
                        </button>
                    </td>
                `;
            }else if(mostrarEditar == "eliminar"){
                btnAccio = `
                    <td>
                        <button class="btn border-0 bg-transparent p-0 mt-2"
                                onclick="esborrarPregunta(${preguntes[i].id})">
                            🗑️
                        </button>
                    </td>
                `;
            }else{
                btnAccio = "";
            }

            htmlStr += `
                <tr>
                    <td>${preguntes[i].id}</td>
                    <td>${preguntes[i].pregunta}</td>
                    <td>${respostes}</td>
                    <td>
                        <img src="${preguntes[i].imatge}" width="100">
                    </td>
                    ${btnAccio}
                </tr>
            `;
        }
        document.getElementById("taulaPreguntes").innerHTML = htmlStr;
    } catch (error) {
        console.log(error);
    }

}
//Function per a obrir el form per modificar la pregunta
function editarPregunta(id) {
    window.location.href = "admin-Crear.html?id=" + id;
}

//Function per eliminar la pregunta seleccionada
function esborrarPregunta(id){
    const modal = new bootstrap.Modal(
        document.getElementById("modalEliminar")
    );

    modal.show();

    const confirmarDelete = document.getElementById("btnConfirmar");

    confirmarDelete.onclick = async function(){

        const resposta = await fetch("/preguntes/" + id, {
            method: "DELETE"
        });

        if(resposta.ok){

            modal.hide();

            const modalEliminada = new bootstrap.Modal(
                document.getElementById("modalMissatgeEliminar")
            );

            modalEliminada.show();

            carregarPreguntes(false);
        }
    };
}


//Botons modals

//modal esborrar
const btnTancarDelete = document.getElementById("btnTancarDelete");

if(btnTancarDelete){
    btnTancarDelete.addEventListener("click", function(){
        carregarPreguntes(false);
    });
}


const tornarPanellDelete = document.getElementById("btnTornarPanellD");

if(tornarPanellDelete){
    tornarPanellDelete.addEventListener("click", function(){
        window.location.href = "admin.html";
    });
}

//modal editar
const btnEditAltra = document.getElementById("btnEditAltra");
if(btnEditAltra){
    btnEditAltra.addEventListener("click", function() {
        window.location.href = "admin-Update.html";
    });
}

const tornarPanellM = document.getElementById("tornarPanellM");
if(tornarPanellM){
    tornarPanellM.addEventListener("click", function() {
        window.location.href = "admin.html";
    });
}


//modal crear
const btnCrearAltra = document.getElementById("btnCrearAltra");
if(btnCrearAltra){
    btnCrearAltra.addEventListener("click", function() {
        document.querySelector("form").reset();

        const modal = bootstrap.Modal.getInstance(
            document.getElementById("modalPreguntaCreada")
        );

        modal.hide();
    });
}

const tornarPanell = document.getElementById("tornarPanell");
if(tornarPanell){
    tornarPanell.addEventListener("click", function() {
        window.location.href = "admin.html";
    });
}

