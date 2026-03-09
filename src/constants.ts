import { CriterionConfig } from './types';

export const CRITERIA_CONFIG: CriterionConfig[] = [
  // Ouverture Sociale
  { id: 'boursiers', label: 'Taux de boursiers (%)', brutKey: 'inclus_fiche_ecole_tx_boursiers_brut', scoreKey: 'inclus_fiche_ecole_tx_boursiers_score_5', type: 'higher_is_better' },
  { id: 'cout', label: 'Coût scolarité (€)', brutKey: 'inclus_fiche_ecole_cout_scola_cursus_brut', scoreKey: 'inclus_fiche_ecole_cout_scola_cursus_score_5', type: 'lower_is_better' },
  { id: 'ouverture_sociale_index', label: 'Index Ouverture Sociale', brutKey: 'fiche_ecole_ouverture_sociale_index_brut', scoreKey: 'fiche_ecole_ouverture_sociale_index_score_5', type: 'higher_is_better', isIndex: true, subCriteria: ['boursiers', 'cout'] },
  
  // Excellence Académique
  { id: 'publi', label: 'Publications FWCI', brutKey: 'inclus_excellence_nb_publi_pondere_fwci_brut', scoreKey: 'inclus_excellence_nb_publi_pondere_fwci_score_5', type: 'higher_is_better' },
  { id: 'publi_inter', label: 'Part publications internationales (%)', brutKey: 'inclus_excellence_part_publications_internationales_brut', scoreKey: 'inclus_excellence_part_publications_internationales_score_5', type: 'higher_is_better' },
  { id: 'pp_publiants', label: 'Part PP publiants (%)', brutKey: 'inclus_excellence_part_pp_publiants_brut', scoreKey: 'inclus_excellence_part_pp_publiants_score_5', type: 'higher_is_better' },
  { id: 'impact_rech_index', label: 'Index Impact Recherche', brutKey: 'excellence_impact_rech_index_brut', scoreKey: 'excellence_impact_rech_index_score_5', type: 'higher_is_better', isIndex: true, subCriteria: ['publi', 'publi_inter', 'pp_publiants'] },
  
  { id: 'attract_select', label: 'Index Attractivité/Sélectivité', brutKey: 'excellence_attract_select_index_brut', scoreKey: 'excellence_attract_select_index_score_5', type: 'higher_is_better' },
  { id: 'moy_bac', label: 'Moyenne Bac intégrés', brutKey: 'excellence_moy_bac_integres', scoreKey: 'excellence_moy_bac_integres_score_5', type: 'higher_is_better' },
  { id: 'prepa', label: 'Index Prépa', brutKey: 'excellence_prepa_brut', scoreKey: 'excellence_prepa_score_5', type: 'higher_is_better' },
  { id: 'dble_diplome', label: 'Part doubles diplômes FR (%)', brutKey: 'excellence_part_dble_diplomes_fr_brut', scoreKey: 'excellence_part_dble_diplomes_fr_score_5', type: 'higher_is_better' },
  
  // Encadrement
  { id: 'etu_par_prof', label: 'Étudiants par prof', brutKey: 'inclus_encadrement_etu_par_prof_brut', scoreKey: 'inclus_encadrement_etu_par_prof_score_5', type: 'lower_is_better' },
  { id: 'perso_admin', label: 'Personnel admin / 100 étu', brutKey: 'inclus_encadrmeent_personnel_admin_brut', scoreKey: 'inclus_encadrement_personnel_admin_score_5', type: 'higher_is_better' },
  { id: 'pct_h_pp', label: 'Part H-PP (%)', brutKey: 'inclus_encadrement_pct_h_pp_brut', scoreKey: 'inclus_encadrement_pct_h_pp_score_5', type: 'higher_is_better' },
  { id: 'tx_hdr', label: 'Taux HDR (%)', brutKey: 'inclus_encadrement_tx_hdr_brut', scoreKey: 'inclus_encadrement_tx_hdr_score_5', type: 'higher_is_better' },
  { id: 'encadrement_index', label: 'Index Encadrement', brutKey: 'encadrement_index_brut', scoreKey: 'encadrement_index_score_5', type: 'higher_is_better', isIndex: true, subCriteria: ['etu_par_prof', 'perso_admin', 'pct_h_pp', 'tx_hdr'] },
  
  // Professionnalisation
  { id: 'salaire', label: 'Salaire sortie (€ net mensuel)', brutKey: 'pro_salaire_sortie_src_insersup_brut', scoreKey: 'pro_salaire_sortie_src_insersup_score_5', type: 'higher_is_better' },
  { id: 'tx_emploi', label: 'Taux emploi (%)', brutKey: 'pro_tx_emploi_cefdg_brut', scoreKey: 'pro_tx_emploi_cefdg_score_5', type: 'higher_is_better' },
  
  // International
  { id: 'partenaires_accrdt', label: 'Partenaires accrédités (%)', brutKey: 'international_part_partenaires_accrdt_brut', scoreKey: 'international_part_partenaires_accrdt_score_5', type: 'higher_is_better' },
  { id: 'reputation_index', label: 'Index Réputation Internationale', brutKey: 'international_reputation_index_brut', scoreKey: 'international_reputation_index_score_5', type: 'higher_is_better' },
  
  { id: 'etu_etranger', label: 'Part étudiants à l\'étranger (%)', brutKey: 'inlcus_international_part_etudiant_a_etranger_brut', scoreKey: 'inclus_international_part_etudiant_a_etranger_score_5', type: 'higher_is_better' },
  { id: 'etu_inter', label: 'Part étudiants internationaux (%)', brutKey: 'inclus_international_part_etudiants_internationaux_brut', scoreKey: 'inclus_international_part_etudiants_internationaux_score_5', type: 'higher_is_better' },
  { id: 'prof_phd', label: 'Part prof PhD (%)', brutKey: 'inclus_international_part_prof_phd_brut', scoreKey: 'inclus_international_part_prof_phd_score_5', type: 'higher_is_better' },
  { id: 'exposition_index', label: 'Index Exposition Internationale', brutKey: 'international_exposition_index_brut', scoreKey: 'international_exposition_index_score_5', type: 'higher_is_better', isIndex: true, subCriteria: ['etu_etranger', 'etu_inter', 'prof_phd'] },
];

export const FIXED_CRITERIA = [
  'excellence_duree_grade_master_score_5',
  'excellence_labels_internationaux_score_5',
  'environnement_label_ddrs_score_2'
];
