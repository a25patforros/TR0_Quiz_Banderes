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
                    <td>${preguntes[i].imatge}</td>
                </tr>
            `;
        }
        document.getElementById("taulaPreguntes").innerHTML = htmlStr;
    } catch (error) {
        console.log(error);
    }

}