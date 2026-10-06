document.querySelector("form").addEventListener("submit", crearPregunta);

async function crearPregunta(event){
    event.preventDefault();

    let respostaCorrecta = document.querySelector(
        'input[name="respostesRadios"]:checked'
    ).value;

    let pregunta = {
        id: 51,
        pregunta: "De quin país és aquesta bandera?",
        imatge: "",
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

    let formData = new FormData();

    formData.append(
        "imgBandera",
        document.getElementById("formFile").files[0]
    );

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

async function carregarPreguntes() {

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
            htmlStr += `
                <tr>
                    <td>${preguntes[i].id}</td>
                    <td>${preguntes[i].pregunta}</td>
                    <td>${respostes}</td>
                    <td>
                        <img src="${preguntes[i].imatge}" width="100"
                    </td>
                </tr>
            `;
        }
        document.getElementById("taulaPreguntes").innerHTML = htmlStr;
    } catch (error) {
        console.log(error);
    }

}

//Botons modal
document.getElementById("btnCrearAltra").addEventListener("click", function() {
    document.querySelector("form").reset();

    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalPreguntaCreada")
    );

    modal.hide();
});

document.getElementById("tornarPanell").addEventListener("click", function() {
    window.location.href = "admin.html";
});