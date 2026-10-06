//TODO: MODIFICAR EL FORM DEL NOM PER A QUE FUNCIONI AMB ENTER

const express = require('express');
const app = express();
const port = Number(process.argv[2])||30002;
const fs = require('fs');
const mysql = require('mysql2/promise');
const multer = require('multer');
const upload = multer ({dest: 'uploads/'});
const sessions = new Map();

const { v4: uuidv4 } = require('uuid');

let connection;

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

iniciarServidor(); //Per evitar que la petició arribi abans de tenir la connexió

app.get('/dades', async (req, res) => {
  try {
    let sql = 'SELECT * FROM preguntes ORDER BY RAND() LIMIT 10';
    const [result] = await connection.query(sql);

    console.log(result);

    let idsPreg = getIdsPreguntes(result);

    let sqlRespostes = `
      SELECT pregunta_id, resposta_id, resposta
      FROM respostes
      WHERE pregunta_id IN (?)`;

    const [resultRespostes] = await connection.query(
      sqlRespostes,
      [idsPreg]
    );

    console.log(resultRespostes);

    let deuPreg = [];

    for(let i = 0; i < result.length; i++){

      let pregunta = {
        id: result[i].id,
        pregunta: result[i].pregunta,
        respostes: [],
        imatge: result[i].imatge
      };

      for(let j = 0; j < resultRespostes.length; j++){

        if(resultRespostes[j].pregunta_id == result[i].id){

          pregunta.respostes.push({
            id: resultRespostes[j].resposta_id,
            resposta: resultRespostes[j].resposta
          });

        }
      }
      deuPreg.push(pregunta);
    }

    const sessionId = uuidv4();
    sessions.set(sessionId, {
      id_Questions: idsPreg
    });

    console.log(sessions);

    res.json({
      sessionId: sessionId,
      questions: deuPreg
    });

  } catch(error) {

    console.log(error);
    res.status(500).send("Error obtenint les preguntes");
  }
});
 
app.post('/respostes', async (req, res) => {
  try {
    let sessionId = req.body.sessionId;
    let respostesUsuari = req.body.respostes_usuari;
    let sessio = sessions.get(sessionId);
    let idsPreguntes = sessio.id_Questions;
    let sql = `
      SELECT pregunta_id, resposta_id, correcta
      FROM respostes
      WHERE pregunta_id IN (?)
    `;

    const [result] = await connection.query(
      sql,
      [idsPreguntes]
    );

    let encerts = 0;

    for(let i = 0; i < respostesUsuari.length; i++){

      let respostaUsu = respostesUsuari[i];

      for(let j = 0; j < result.length; j++){

        if(result[j].pregunta_id == respostaUsu.id
        && result[j].resposta_id == respostaUsu.res){

          if(result[j].correcta == 1){
            encerts++;
          }

        }
      }
    }

    res.json({
      Encerts: encerts,
      Respostes: respostesUsuari.length
    });

  } catch(error) {

    console.log(error);
    res.status(500).send("Error al corregir les respostes");
  }
});


//GET --Veure preguntes
app.get("/preguntes", async (req,res) => {

  try{
    const [preguntes] = await connection.query("SELECT * FROM preguntes");
    const [respostes] = await connection.query("SELECT * FROM respostes");

    for (let i = 0; i < preguntes.length; i++) {
      preguntes[i].respostes = [];

        for (let j = 0; j < respostes.length; j++) {
          if (respostes[j].pregunta_id == preguntes[i].id) {
            preguntes[i].respostes.push(respostes[j]);

          }
        }
    }

    res.json(preguntes);
    
  }catch (error){
    res.status(500).send("Error al llegir les preguntes.");
  }
});

//POST --Crear pregunta
app.post("/preguntes", upload.single("imgBandera"), async (req, res) => {
  try{
    const preg = JSON.parse(req.body.pregunta);
    const imgBandera = "/uploads/" + req.file.filename;    
    const nouId = await generarId();

    const[resultatPreg] = await connection.query(`
      INSERT INTO preguntes (id, pregunta, imatge)
      VALUES (?, ?, ?)`,
      [
        nouId,
        preg.pregunta,
        imgBandera
      ]
    );

    for (const resposta of preg.respostes) {
      const [resultatRes] = await connection.query(`
        INSERT INTO respostes
        (pregunta_id, resposta_id, resposta, correcta)
        VALUES (?, ?, ?, ?)`,
        [
          nouId,
          resposta.id,
          resposta.resposta,
          resposta.correcta
        ]
      );
    }
    res.json({ missatge: "Pregunta creada" });
  }catch (error) {
    console.log(error);
    res.status(500).send("Error creant pregunta");
  }
});
 
//PUT --Modificar pregunta
app.put("/preguntes/:id", async (req, res) =>{
  try{
    const id = req.params.id;
    const preg = req.body;

    await connection.query(`
      UPDATE preguntes
      SET pregunta = ?, imatge = ?
      WHERE id = ?`,
      [
        preg.pregunta,
        preg.imatge,
        id
      ]
    );

    for(const resposta of preg.respostes){ //para no repetir el update por cada respuesta
      await connection.query(`
         UPDATE respostes
         SET resposta = ?,
             correcta = ?
         WHERE pregunta_id = ? AND resposta_id = ?`,
         [
          resposta.resposta,
          resposta.correcta,
          id,
          resposta.id
         ]
      );
    }
    res.json({ missatge: "Pregunta modificada" });
  }catch(error){
    res.status(500).send("Error modificant pregunta");
  }
});

//DELETE --Eliminar pregunta
app.delete("/preguntes/:id", async(req, res) =>{
  try{
    const id = req.params.id;

    await connection.query(
      `DELETE FROM respostes WHERE pregunta_id = ?`,
      [id]
    );

    await connection.query(
      `DELETE FROM preguntes WHERE id = ?`,
      [id]
    );

    res.json({missatge: "Pregunta esborrada correctament."});
  }catch(error){
    res.status(500).send("Error esborrant la pregunta");
  }
});


// ------------------------ FUNCIONS ------------------------
async function conectarDB(){
    connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '1234',
    database:'quiz'
  });
}

async function iniciarServidor(){

  await conectarDB();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

}

function getIdsPreguntes(preguntes){
 let idsPreguntes=[];

 for(let i = 0; i<preguntes.length; i++){
  idsPreguntes.push(preguntes[i].id);
 }

 return idsPreguntes;
}

//Generar Ids
async function generarId(){
    let id;
    let existe =true;

    while(existe){
        id= Math.floor(Math.random() * 10000) + 1;

        const[resSql] = await connection.query(
            `
            SELECT id FROM preguntes WHERE id = ?
            `, [id]
        );

        if(resSql.length == 0){
            existe = false;
        }
    }

    return id;
}