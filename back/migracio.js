const mysql = require('mysql2/promise');
const preguntes = require('../preguntes.json');
const respostesCorr = require('../respostes.json');


async function migrar(){
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '1234',
        database:'quiz'
    });

    //recorremos las preguntas
    for(let i= 0; i < preguntes.preguntes.length; i++){
        let pregunta = preguntes.preguntes[i];

        //insertamos las preguntas
        await connection.execute(
            'INSERT INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)',

            [
                pregunta.id,
                pregunta.pregunta,
                pregunta.imatge
            ]
        );

        //recorre las respuestas
        for(let j=0; j<pregunta.respostes.length; j++){
            let resposta = pregunta.respostes[j];

            let esCorrecta = false;

            for(let k=0; k < respostesCorr.respostesCorrectes.length; k++){
                if(respostesCorr.respostesCorrectes[k].preguntaId == pregunta.id &&
                    respostesCorr.respostesCorrectes[k].respostaCorrectaId == resposta.id){
                        esCorrecta = true;
                }
            }

            await connection.execute(
                'INSERT INTO respostes (pregunta_id, resposta_id, resposta, correcta) VALUES (?, ?, ?, ?)',
                [
                    pregunta.id,
                    resposta.id,
                    resposta.resposta,
                    esCorrecta
                ]
            );
        }
    }

    console.log("Migracio completada");

    await connection.end();
}

migrar();