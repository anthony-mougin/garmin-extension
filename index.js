const fs = require("fs");
const archiver = require("archiver");

// Le chemin du dossier à compresser
const sourceDir = "lib";

// Le chemin du fichier de sortie
const outPath = "garmin-connect-tools.zip";

// Créer un flux d'écriture pour le fichier de sortie
const output = fs.createWriteStream(outPath);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Niveau de compression
});

// Écouter l'événement 'close' pour savoir quand l'archive est prête
output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log("Archiver a terminé la création du fichier zip.");
});

// Écouter les erreurs
archive.on("error", function (err) {
  throw err;
});

// Lier le flux d'écriture à l'archive
archive.pipe(output);

// Ajouter le dossier source à l'archive
// Le second paramètre (false) indique que les fichiers seront à la racine de l'archive
archive.directory(sourceDir, false);

// Finaliser l'archive (ne plus accepter de nouveaux fichiers)
archive.finalize();
