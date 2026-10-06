const fs = require("fs");
const FAKE = "64f9e2c8a7b1b23d45f67890";

function req(name, method, path, code, body, extra = [], raw) {
  const [p, q] = path.split("?");
  const url = { raw: "{{baseUrl}}" + path, host: ["{{baseUrl}}"], path: p.split("/").filter(Boolean) };
  if (q) url.query = q.split("&").map(x => { const [key, value] = x.split("="); return { key, value }; });
  const request = { method, header: [], url };
  if (body !== undefined || raw !== undefined) {
    request.header.push({ key: "Content-Type", value: "application/json" });
    request.body = { mode: "raw", raw: raw ?? JSON.stringify(body, null, 2), options: { raw: { language: "json" } } };
  }
  return {
    name, request, response: [],
    event: [{ listen: "test", script: { type: "text/javascript",
      exec: [`pm.test("Code ${code}", () => pm.response.to.have.status(${code}));`, ...extra] } }]
  };
}

const setP = ['pm.collectionVariables.set("patientId", pm.response.json().id);'];
const setC = ['pm.collectionVariables.set("consultationId", pm.response.json().id);'];
const consult = { patient: "{{patientId}}", date: "2026-10-05", motif: "Contrôle régulier",
  traitement: "Aucun", medecin: "Dr Helmi", notes: "Patient en bonne santé" };
const { motif, ...sansMotif } = consult;

const sante = [
  req("GET health (200)", "GET", "/api/health", 200),
  req("GET route inconnue (404)", "GET", "/api/inconnu", 404),
];
const patients = [
  req("POST patient valide (201)", "POST", "/api/patients", 201,
    { nom: "Ben Salah", prenom: "Ali", age: 34, telephone: "22123456", medecin: "Dr Helmi" }, setP),
  req("POST patient sans nom (400)", "POST", "/api/patients", 400, { prenom: "Ali" }),
  req("POST patient statut invalide (400)", "POST", "/api/patients", 400, { nom: "X", prenom: "Y", statut: "Absent" }),
  req("POST patient JSON mal forme (400)", "POST", "/api/patients", 400, undefined, [], '{ "nom": "X",'),
  req("GET tous les patients (200)", "GET", "/api/patients", 200),
  req("GET patients statut=Actif (200)", "GET", "/api/patients?statut=Actif", 200),
  req("GET un patient (200)", "GET", "/api/patients/{{patientId}}", 200),
  req("GET patient inexistant (404)", "GET", "/api/patients/" + FAKE, 404),
  req("GET patient id mal forme (400)", "GET", "/api/patients/abc", 400),
  req("PUT patient age=35 (200)", "PUT", "/api/patients/{{patientId}}", 200, { age: 35 }),
  req("PUT patient age=-5 (400)", "PUT", "/api/patients/{{patientId}}", 400, { age: -5 }),
];
const consultations = [
  req("POST consultation valide (201)", "POST", "/api/consultations", 201, consult, setC),
  req("POST consultation patient inexistant (404)", "POST", "/api/consultations", 404, { ...consult, patient: FAKE }),
  req("POST consultation sans motif (400)", "POST", "/api/consultations", 400, sansMotif),
  req("GET toutes les consultations (200)", "GET", "/api/consultations", 200),
  req("GET consultations statut=Terminée (200)", "GET", "/api/consultations?statut=Terminée", 200),
  req("GET consultations d'un patient (200)", "GET", "/api/consultations?patient={{patientId}}", 200),
  req("GET une consultation (200)", "GET", "/api/consultations/{{consultationId}}", 200),
  req("PUT consultation statut=Terminée (200)", "PUT", "/api/consultations/{{consultationId}}", 200, { statut: "Terminée" }),
  req("DELETE consultation (204)", "DELETE", "/api/consultations/{{consultationId}}", 204),
  req("DELETE consultation 2e fois (404)", "DELETE", "/api/consultations/{{consultationId}}", 404),
];
const nettoyage = [
  req("DELETE patient (204)", "DELETE", "/api/patients/{{patientId}}", 204),
  req("DELETE patient 2e fois (404)", "DELETE", "/api/patients/{{patientId}}", 404),
];

const collection = {
  info: { name: "API Cabinet",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  item: [
    { name: "1 - Santé", item: sante },
    { name: "2 - Patients", item: patients },
    { name: "3 - Consultations", item: consultations },
    { name: "4 - Nettoyage", item: nettoyage },
  ],
  variable: [
    { key: "baseUrl", value: "http://localhost:5001" },
    { key: "patientId", value: "" },
    { key: "consultationId", value: "" },
  ],
};

fs.writeFileSync("API_Cabinet.postman_collection.json", JSON.stringify(collection, null, 2), "utf8");
console.log("Fichier créé : API_Cabinet.postman_collection.json");