import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("schools.db");

// Initialize SQLite table with exact column names from user request
// We drop and recreate to ensure schema matches if it was created with an older version
db.exec(`DROP TABLE IF EXISTS schools`);
db.exec(`
  CREATE TABLE schools (
    id_ecole INTEGER PRIMARY KEY AUTOINCREMENT,
    ecole TEXT,
    type TEXT,
    inclus_fiche_ecole_tx_boursiers_brut REAL,
    inclus_fiche_ecole_tx_boursiers_score_5 REAL,
    inclus_fiche_ecole_cout_scola_cursus_brut REAL,
    inclus_fiche_ecole_cout_scola_cursus_score_5 REAL,
    fiche_ecole_ouverture_sociale_index_brut REAL,
    fiche_ecole_ouverture_sociale_index_score_5 REAL,
    excellence_duree_grade_master_score_5 REAL,
    excellence_labels_internationaux_brut REAL,
    excellence_labels_internationaux_score_5 REAL,
    excellence_nb_publications_brut REAL,
    excellence_fwci_brut REAL,
    inclus_excellence_nb_publi_pondere_fwci_brut REAL,
    inclus_excellence_nb_publi_pondere_fwci_score_5 REAL,
    inclus_excellence_part_publications_internationales_brut REAL,
    inclus_excellence_part_publications_internationales_score_5 REAL,
    inclus_excellence_part_pp_publiants_brut REAL,
    inclus_excellence_part_pp_publiants_score_5 REAL,
    excellence_impact_rech_index_brut REAL,
    excellence_impact_rech_index_score_5 REAL,
    excellence_attract_select_index_brut REAL,
    excellence_attract_select_index_score_5 REAL,
    excellence_moy_bac_integres REAL,
    excellence_moy_bac_integres_score_5 REAL,
    excellence_prepa_brut REAL,
    excellence_prepa_score_5 REAL,
    excellence_part_dble_diplomes_fr_brut REAL,
    excellence_part_dble_diplomes_fr_score_5 REAL,
    inclus_encadrement_etu_par_prof_brut REAL,
    inclus_encadrement_etu_par_prof_score_5 REAL,
    inclus_encadrmeent_personnel_admin_brut REAL,
    inclus_encadrement_personnel_admin_score_5 REAL,
    inclus_encadrement_pct_h_pp_brut REAL,
    inclus_encadrement_pct_h_pp_score_5 REAL,
    inclus_encadrement_tx_hdr_brut REAL,
    inclus_encadrement_tx_hdr_score_5 REAL,
    encadrement_index_brut REAL,
    encadrement_index_score_5 REAL,
    pro_salaire_sortie_src_insersup_brut REAL,
    pro_salaire_sortie_src_insersup_score_5 REAL,
    pro_tx_emploi_cefdg_brut REAL,
    pro_tx_emploi_cefdg_score_5 REAL,
    international_part_partenaires_accrdt_brut REAL,
    international_part_partenaires_accrdt_score_5 REAL,
    international_reputation_liste_brut TEXT,
    international_reputation_index_brut REAL,
    international_reputation_index_score_5 REAL,
    inlcus_international_part_etudiant_a_etranger_brut REAL,
    inclus_international_part_etudiant_a_etranger_score_5 REAL,
    inclus_international_part_etudiants_internationaux_brut REAL,
    inclus_international_part_etudiants_internationaux_score_5 REAL,
    inclus_international_part_prof_phd_brut REAL,
    inclus_international_part_prof_phd_score_5 REAL,
    international_exposition_index_brut REAL,
    international_exposition_index_score_5 REAL,
    environnement_label_ddrs_score_2 REAL,
    note_finale REAL,
    rang INTEGER
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.get("/api/schools", (req, res) => {
    try {
      const schools = db.prepare("SELECT * FROM schools ORDER BY rang ASC").all();
      res.json(schools);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  app.post("/api/import", (req, res) => {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    try {
      const deleteStmt = db.prepare("DELETE FROM schools");
      const insertStmt = db.prepare(`
        INSERT INTO schools (
          ecole, type, inclus_fiche_ecole_tx_boursiers_brut, inclus_fiche_ecole_tx_boursiers_score_5,
          inclus_fiche_ecole_cout_scola_cursus_brut, inclus_fiche_ecole_cout_scola_cursus_score_5,
          fiche_ecole_ouverture_sociale_index_brut, fiche_ecole_ouverture_sociale_index_score_5,
          excellence_duree_grade_master_score_5, excellence_labels_internationaux_brut,
          excellence_labels_internationaux_score_5, excellence_nb_publications_brut, excellence_fwci_brut,
          inclus_excellence_nb_publi_pondere_fwci_brut, inclus_excellence_nb_publi_pondere_fwci_score_5,
          inclus_excellence_part_publications_internationales_brut, inclus_excellence_part_publications_internationales_score_5,
          inclus_excellence_part_pp_publiants_brut, inclus_excellence_part_pp_publiants_score_5,
          excellence_impact_rech_index_brut, excellence_impact_rech_index_score_5,
          excellence_attract_select_index_brut, excellence_attract_select_index_score_5,
          excellence_moy_bac_integres, excellence_moy_bac_integres_score_5,
          excellence_prepa_brut, excellence_prepa_score_5,
          excellence_part_dble_diplomes_fr_brut, excellence_part_dble_diplomes_fr_score_5,
          inclus_encadrement_etu_par_prof_brut, inclus_encadrement_etu_par_prof_score_5,
          inclus_encadrmeent_personnel_admin_brut, inclus_encadrement_personnel_admin_score_5,
          inclus_encadrement_pct_h_pp_brut, inclus_encadrement_pct_h_pp_score_5,
          inclus_encadrement_tx_hdr_brut, inclus_encadrement_tx_hdr_score_5,
          encadrement_index_brut, encadrement_index_score_5,
          pro_salaire_sortie_src_insersup_brut, pro_salaire_sortie_src_insersup_score_5,
          pro_tx_emploi_cefdg_brut, pro_tx_emploi_cefdg_score_5,
          international_part_partenaires_accrdt_brut, international_part_partenaires_accrdt_score_5,
          international_reputation_liste_brut, international_reputation_index_brut, international_reputation_index_score_5,
          inlcus_international_part_etudiant_a_etranger_brut, inclus_international_part_etudiant_a_etranger_score_5,
          inclus_international_part_etudiants_internationaux_brut, inclus_international_part_etudiants_internationaux_score_5,
          inclus_international_part_prof_phd_brut, inclus_international_part_prof_phd_score_5,
          international_exposition_index_brut, international_exposition_index_score_5,
          environnement_label_ddrs_score_2, note_finale, rang
        ) VALUES (
          @ecole, @type, @inclus_fiche_ecole_tx_boursiers_brut, @inclus_fiche_ecole_tx_boursiers_score_5,
          @inclus_fiche_ecole_cout_scola_cursus_brut, @inclus_fiche_ecole_cout_scola_cursus_score_5,
          @fiche_ecole_ouverture_sociale_index_brut, @fiche_ecole_ouverture_sociale_index_score_5,
          @excellence_duree_grade_master_score_5, @excellence_labels_internationaux_brut,
          @excellence_labels_internationaux_score_5, @excellence_nb_publications_brut, @excellence_fwci_brut,
          @inclus_excellence_nb_publi_pondere_fwci_brut, @inclus_excellence_nb_publi_pondere_fwci_score_5,
          @inclus_excellence_part_publications_internationales_brut, @inclus_excellence_part_publications_internationales_score_5,
          @inclus_excellence_part_pp_publiants_brut, @inclus_excellence_part_pp_publiants_score_5,
          @excellence_impact_rech_index_brut, @excellence_impact_rech_index_score_5,
          @excellence_attract_select_index_brut, @excellence_attract_select_index_score_5,
          @excellence_moy_bac_integres, @excellence_moy_bac_integres_score_5,
          @excellence_prepa_brut, @excellence_prepa_score_5,
          @excellence_part_dble_diplomes_fr_brut, @excellence_part_dble_diplomes_fr_score_5,
          @inclus_encadrement_etu_par_prof_brut, @inclus_encadrement_etu_par_prof_score_5,
          @inclus_encadrmeent_personnel_admin_brut, @inclus_encadrement_personnel_admin_score_5,
          @inclus_encadrement_pct_h_pp_brut, @inclus_encadrement_pct_h_pp_score_5,
          @inclus_encadrement_tx_hdr_brut, @inclus_encadrement_tx_hdr_score_5,
          @encadrement_index_brut, @encadrement_index_score_5,
          @pro_salaire_sortie_src_insersup_brut, @pro_salaire_sortie_src_insersup_score_5,
          @pro_tx_emploi_cefdg_brut, @pro_tx_emploi_cefdg_score_5,
          @international_part_partenaires_accrdt_brut, @international_part_partenaires_accrdt_score_5,
          @international_reputation_liste_brut, @international_reputation_index_brut, @international_reputation_index_score_5,
          @inlcus_international_part_etudiant_a_etranger_brut, @inclus_international_part_etudiant_a_etranger_score_5,
          @inclus_international_part_etudiants_internationaux_brut, @inclus_international_part_etudiants_internationaux_score_5,
          @inclus_international_part_prof_phd_brut, @inclus_international_part_prof_phd_score_5,
          @international_exposition_index_brut, @international_exposition_index_score_5,
          @environnement_label_ddrs_score_2, @note_finale, @rang
        )
      `);

      const insertMany = db.transaction((rows) => {
        deleteStmt.run();
        for (const row of rows) insertStmt.run(row);
      });

      insertMany(data);
      res.json({ success: true, count: data.length });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import data" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
