export interface SchoolData {
  id_ecole: number;
  ecole: string;
  type: string;
  inclus_fiche_ecole_tx_boursiers_brut: number;
  inclus_fiche_ecole_tx_boursiers_score_5: number;
  inclus_fiche_ecole_cout_scola_cursus_brut: number;
  inclus_fiche_ecole_cout_scola_cursus_score_5: number;
  fiche_ecole_ouverture_sociale_index_brut: number;
  fiche_ecole_ouverture_sociale_index_score_5: number;
  excellence_duree_grade_master_score_5: number;
  excellence_labels_internationaux_brut: string;
  excellence_labels_internationaux_score_5: number;
  excellence_nb_publications_brut: number;
  excellence_fwci_brut: number;
  inclus_excellence_nb_publi_pondere_fwci_brut: number;
  inclus_excellence_nb_publi_pondere_fwci_score_5: number;
  inclus_excellence_part_publications_internationales_brut: number;
  inclus_excellence_part_publications_internationales_score_5: number;
  inclus_excellence_part_pp_publiants_brut: number;
  inclus_excellence_part_pp_publiants_score_5: number;
  excellence_impact_rech_index_brut: number;
  excellence_impact_rech_index_score_5: number;
  excellence_attract_select_index_brut: number;
  excellence_attract_select_index_score_5: number;
  excellence_moy_bac_integres: number;
  excellence_moy_bac_integres_score_5: number;
  excellence_prepa_brut: number;
  excellence_prepa_score_5: number;
  excellence_part_dble_diplomes_fr_brut: number;
  excellence_part_dble_diplomes_fr_score_5: number;
  inclus_encadrement_etu_par_prof_brut: number;
  inclus_encadrement_etu_par_prof_score_5: number;
  inclus_encadrmeent_personnel_admin_brut: number;
  inclus_encadrement_personnel_admin_score_5: number;
  inclus_encadrement_pct_h_pp_brut: number;
  inclus_encadrement_pct_h_pp_score_5: number;
  inclus_encadrement_tx_hdr_brut: number;
  inclus_encadrement_tx_hdr_score_5: number;
  encadrement_index_brut: number;
  encadrement_index_score_5: number;
  pro_salaire_sortie_src_insersup_brut: number;
  pro_salaire_sortie_src_insersup_score_5: number;
  pro_tx_emploi_cefdg_brut: number;
  pro_tx_emploi_cefdg_score_5: number;
  international_part_partenaires_accrdt_brut: number;
  international_part_partenaires_accrdt_score_5: number;
  international_reputation_liste_brut: string;
  international_reputation_index_brut: number;
  international_reputation_index_score_5: number;
  inlcus_international_part_etudiant_a_etranger_brut: number;
  inclus_international_part_etudiant_a_etranger_score_5: number;
  inclus_international_part_etudiants_internationaux_brut: number;
  inclus_international_part_etudiants_internationaux_score_5: number;
  inclus_international_part_prof_phd_brut: number;
  inclus_international_part_prof_phd_score_5: number;
  international_exposition_index_brut: number;
  international_exposition_index_score_5: number;
  environnement_label_ddrs_score_2: number;
  note_finale: number;
  rang: number;
  [key: string]: any;
}

export type CriterionType = 'higher_is_better' | 'lower_is_better';

export interface CriterionConfig {
  id: string;
  label: string;
  brutKey: string;
  scoreKey: string;
  type: CriterionType;
  isIndex?: boolean;
  subCriteria?: string[]; // IDs of sub-criteria
}

export type ThresholdMap = Record<string, number[]>; // Map of criterion ID to 10 threshold values (for scores 0.5 to 5.0)
