const Joueur = require("../models/joueur");
const Partie = require("../models/partie");

async function getall(req, res) {
  try {
    const data = await Joueur.find();
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function add(req, res) {
  try {
    //console.log("data", req.body);
    const joueur = new Joueur({
      pseudo: req.body.pseudo,
      sante: 100,
      score: 0,
    });
    await joueur.save();
    res.status(200).send("add good");
  } catch (err) {
    res.status(400).send({ error: err });
    //console.log();
  }
}

async function deletejoueur(req, res) {
  try {
    await Joueur.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted");
  } catch (err) {
    res.status(400).send(err);
  }
}

async function getbyid(req, res) {
  try {
    const data = await Joueur.findById(req.params.id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function attaque(req, res) {
  try {
    const j1 = await Joueur.findById(req.params.id1);
    const j2 = await Joueur.findById(req.params.id2);
    score1 = j1.score + 20;
    sante1 = j2.sante - 10;
    const j1u = await Joueur.findByIdAndUpdate(req.params.id1, {
      score: score1,
    });
    const j2u = await Joueur.findByIdAndUpdate(req.params.id2, {
      sante: sante1,
    });
    res.status(200).send(j1u + "....." + j2u);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function addpartie(req, res) {
  try {
    //console.log("data", req.body);
    const partie = new Partie({
      nom: req.body.nom,
      joueur_1: req.params.id1,
      joueur_2: req.params.id2,
      etat: "en cours",
    });
    await partie.save();
    res.status(200).send("add good");
  } catch (err) {
    res.status(400).send({ error: err });
    //console.log();
  }
}

async function addpartiesocket(data) {
  try {
    //console.log("data", req.body);
    const partie = new Partie({
      nom: data.nom,
      joueur_1: data.id1,
      joueur_2: data.id2,
      etat: "en cours",
    });
    await partie.save();
    //res.status(200).send("add good");
  } catch (err) {
    //res.status(400).send({ error: err });
    console.log(err);
  }
}

async function getbyidsocket(data) {
  try {
    const j1u = await Joueur.findById(data.id1);
    const j2u = await Joueur.findById(data.id2);
    r = { j1: j1u, j2: j2u };
    return r;
    //res.status(200).send(data);
  } catch (err) {
    //res.status(400).send(err);
    console.log(err);
  }
}


async function attack(io,id1,id2){
  try{
    const {j1,j2} = await getbyidsocket({id1,id2});
    const score1 = j1.score + 20;
    j2.sante = j2.sante - 10;
    if(j1.score >= 100 || j2.sante <= 0 ){
      io.emit("terminé",j1.pseudo.toString()+" a gagné!");
    }
    if(j2.score >= 100 || j1.sante <= 0 ){
      io.emit("terminé",j2.pseudo.toString()+" a gagné!");
    }
    else{
      j1.score = score1;
      await Joueur.findByIdAndUpdate(j1._id,j1);
      await Joueur.findByIdAndUpdate(j2._id, j2);
      const r = { j1: j1, j2: j2 };
      io.emit("aff",r);
    }
  }catch(err){
    console.log("Error : "+err.message);
  }
}

module.exports = {
  getall,
  add,
  deletejoueur,
  getbyid,
  attaque,
  addpartie,
  addpartiesocket,
  getbyidsocket,
  attack
};