import { useEffect, useState } from 'react'
import { LandingPage } from './components/LandingPage.jsx'
import { LoginPage } from './components/LoginPage.jsx'
import { TopBar } from './components/TopBar.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { ActifsList } from './components/ActifsList.jsx'
import { ActifDetail } from './components/ActifDetail.jsx'
import { EmplacementsList } from './components/EmplacementsList.jsx'
import { OrdresTravailList } from './components/OrdresTravailList.jsx'
import { TicketsList } from './components/TicketsList.jsx'
import { MaintenancePreventiveList } from './components/MaintenancePreventiveList.jsx'
import { FournisseursList } from './components/FournisseursList.jsx'
import { AfrilandDashboard } from './components/AfrilandDashboard.jsx'
import { SlaReglesMesures } from './components/SlaReglesMesures.jsx'
import { SlaPenalitesPaiements } from './components/SlaPenalitesPaiements.jsx'
import { EvaluationsPrestataires } from './components/EvaluationsPrestataires.jsx'
import { ClesAcces } from './components/ClesAcces.jsx'
import { ProjetsImmobiliers } from './components/ProjetsImmobiliers.jsx'
import { TachesAlertes } from './components/TachesAlertes.jsx'
import { CategoriesActifs } from './components/CategoriesActifs.jsx'
import { PiecesRechange } from './components/PiecesRechange.jsx'
import { ConsommationEnergie } from './components/ConsommationEnergie.jsx'
import { Utilisateurs } from './components/Utilisateurs.jsx'
import * as dataService from './services/dataService.js'
import { executerMoteurRegles } from './services/automationEngine.js'
import { getPortalUser, deconnexionPortail } from './services/portalAuth.js'
import { ROLES } from './data/mockData.js'

export default function App() {
  // 'landing' -> 'login' -> 'app' : parcours d'entrée avant d'accéder à l'outil.
  const [vue, setVue] = useState('landing')
  const [utilisateurEmail, setUtilisateurEmail] = useState('')
  const [role, setRole] = useState(ROLES[0])

  const [ongletActif, setOngletActif] = useState('dashboard')
  const [chargement, setChargement] = useState(true)
  const [erreurChargement, setErreurChargement] = useState(null)
  // Site du Responsable de site connecté (US-01, point d'attention 1.6 —
  // sécurité par ligne) : null pour les autres rôles, qui voient tout.
  const [siteId, setSiteId] = useState(null)

  const [emplacements, setEmplacements] = useState([])
  const [categoriesActif, setCategoriesActif] = useState([])
  const [actifs, setActifs] = useState([])
  const [ordresTravail, setOrdresTravail] = useState([])
  const [tickets, setTickets] = useState([])
  const [historiqueOrdreTravail, setHistoriqueOrdreTravail] = useState([])
  const [plansPreventifs, setPlansPreventifs] = useState([])
  const [echeancesPlan, setEcheancesPlan] = useState([])
  const [demandesModificationActif, setDemandesModificationActif] = useState([])
  const [fichesAnalysePostIncident, setFichesAnalysePostIncident] = useState([])
  const [rapportsMensuels, setRapportsMensuels] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [contrats, setContrats] = useState([])

  const [slaRules, setSlaRules] = useState([])
  const [slaMeasures, setSlaMeasures] = useState([])
  const [penalites, setPenalites] = useState([])
  const [validationsPaiement, setValidationsPaiement] = useState([])
  const [evaluationsPrestataires, setEvaluationsPrestataires] = useState([])
  const [cles, setCles] = useState([])
  const [mouvementsCles, setMouvementsCles] = useState([])
  const [projetsImmobiliers, setProjetsImmobiliers] = useState([])
  const [jalonsProjets, setJalonsProjets] = useState([])
  const [tachesWorkflow, setTachesWorkflow] = useState([])
  const [alertesAutomatiques, setAlertesAutomatiques] = useState([])
  const [journalAudit, setJournalAudit] = useState([])
  const [piecesRechange, setPiecesRechange] = useState([])
  const [mouvementsStock, setMouvementsStock] = useState([])
  const [consommationsEnergie, setConsommationsEnergie] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])

  const [actifSelectionneId, setActifSelectionneId] = useState(null)

  // Recharge les collections que le moteur de règles est susceptible de modifier
  // (génération d'OT, alertes, tâches, échéances, contrats) sans redemander tout
  // le jeu de données.
  async function rafraichirApresMoteur() {
    const [ot, hist, pm, ech, taches, alertes, ctr, rap, slam, pen, vp, fapi] = await Promise.all([
      dataService.getOrdresTravail(),
      dataService.getHistoriqueOrdreTravail(),
      dataService.getPlansPreventifs(),
      dataService.getEcheancesPlan(),
      dataService.getTachesWorkflow(),
      dataService.getAlertesAutomatiques(),
      dataService.getContrats(),
      dataService.getRapportsMensuels(),
      dataService.getSlaMeasures(),
      dataService.getPenalites(),
      dataService.getValidationsPaiement(),
      dataService.getFichesAnalysePostIncident(),
    ])
    setOrdresTravail(ot)
    setHistoriqueOrdreTravail(hist)
    setPlansPreventifs(pm)
    setEcheancesPlan(ech)
    setTachesWorkflow(taches)
    setAlertesAutomatiques(alertes)
    setContrats(ctr)
    setRapportsMensuels(rap)
    setSlaMeasures(slam)
    setPenalites(pen)
    setValidationsPaiement(vp)
    setFichesAnalysePostIncident(fapi)
  }

  // Chargement initial — c'est le SEUL endroit qui appelle la couche de service
  // au démarrage. Quand Dataverse sera branché, ce useEffect ne changera pas :
  // seules les fonctions dans dataService.js changeront de comportement.
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [
          emp, cat, act, ot, tk, hist, pm, ech, dma, fapi, rap, frs, ctr,
          slar, slam, pen, vp, evals, clesData, mvc, proj, jal, taches, alertes, audit,
          pr, mvs, nrj, utl,
        ] = await Promise.all([
          dataService.getEmplacements(),
          dataService.getCategoriesActif(),
          dataService.getActifs(),
          dataService.getOrdresTravail(),
          dataService.getTickets(),
          dataService.getHistoriqueOrdreTravail(),
          dataService.getPlansPreventifs(),
          dataService.getEcheancesPlan(),
          dataService.getDemandesModificationActif(),
          dataService.getFichesAnalysePostIncident(),
          dataService.getRapportsMensuels(),
          dataService.getFournisseurs(),
          dataService.getContrats(),
          dataService.getSlaRules(),
          dataService.getSlaMeasures(),
          dataService.getPenalites(),
          dataService.getValidationsPaiement(),
          dataService.getEvaluationsPrestataires(),
          dataService.getCles(),
          dataService.getMouvementsCles(),
          dataService.getProjetsImmobiliers(),
          dataService.getJalonsProjets(),
          dataService.getTachesWorkflow(),
          dataService.getAlertesAutomatiques(),
          dataService.getJournalAudit(),
          dataService.getPiecesRechange(),
          dataService.getMouvementsStock(),
          dataService.getConsommationsEnergie(),
          dataService.getUtilisateurs(),
        ])
        setEmplacements(emp)
        setCategoriesActif(cat)
        setActifs(act)
        setOrdresTravail(ot)
        setTickets(tk)
        setHistoriqueOrdreTravail(hist)
        setPlansPreventifs(pm)
        setEcheancesPlan(ech)
        setDemandesModificationActif(dma)
        setFichesAnalysePostIncident(fapi)
        setRapportsMensuels(rap)
        setFournisseurs(frs)
        setContrats(ctr)
        setSlaRules(slar)
        setSlaMeasures(slam)
        setPenalites(pen)
        setValidationsPaiement(vp)
        setEvaluationsPrestataires(evals)
        setCles(clesData)
        setMouvementsCles(mvc)
        setProjetsImmobiliers(proj)
        setJalonsProjets(jal)
        setTachesWorkflow(taches)
        setAlertesAutomatiques(alertes)
        setJournalAudit(audit)
        setPiecesRechange(pr)
        setMouvementsStock(mvs)
        setConsommationsEnergie(nrj)
        setUtilisateurs(utl)

        // Passe unique du moteur de règles au démarrage (génération des OT préventifs
        // en retard, alertes d'échéance, escalades, dépassements budgétaires) — cf.
        // automationEngine.js. Idempotent, donc sans risque à chaque rechargement.
        await executerMoteurRegles()
        await rafraichirApresMoteur()
      } catch (error) {
        console.error('Échec du chargement initial des données :', error)
        setErreurChargement(error.message || 'Erreur inconnue.')
      } finally {
        setChargement(false)
      }
    }
    chargerDonnees()
  }, [])

  async function executerMoteurEtRafraichir() {
    await executerMoteurRegles()
    await rafraichirApresMoteur()
  }

  function changerOnglet(cle) {
    setActifSelectionneId(null)
    setOngletActif(cle)
  }

  function seConnecter(email, roleChoisi, siteChoisiId) {
    setUtilisateurEmail(email)
    setRole(roleChoisi || ROLES[0])
    setSiteId(roleChoisi === 'Responsable de site' ? (siteChoisiId || null) : null)
    setVue('app')
  }

  function seDeconnecter() {
    // Site connecté via Power Pages/Entra ID : on ferme la vraie session
    // portail plutôt que de simplement revenir à l'écran d'accueil local.
    if (getPortalUser()) {
      deconnexionPortail()
      return
    }
    setUtilisateurEmail('')
    setOngletActif('dashboard')
    setActifSelectionneId(null)
    setVue('landing')
  }

  async function changerStatutActif(id, statut) {
    await dataService.updateActifStatut(id, statut)
    setActifs((prev) => prev.map((a) => (a.id === id ? { ...a, statut } : a)))
    setJournalAudit(await dataService.getJournalAudit())
  }

  async function creerActif(nouvelActif) {
    const cree = await dataService.createActif(nouvelActif)
    setActifs((prev) => [cree, ...prev])
  }

  // Retourne le détail des lignes rejetées (US-01, section 1.5) pour que l'écran
  // d'import puisse l'afficher — importActifsCsv ne renvoie plus un simple tableau.
  async function importerActifsCsv(lignes) {
    const { crees, rejetes } = await dataService.importActifsCsv(lignes)
    setActifs((prev) => [...crees, ...prev])
    setJournalAudit(await dataService.getJournalAudit())
    return { crees, rejetes }
  }

  async function rafraichirApresChangementActif() {
    const [act, dma, journal] = await Promise.all([
      dataService.getActifs(),
      dataService.getDemandesModificationActif(),
      dataService.getJournalAudit(),
    ])
    setActifs(act)
    setDemandesModificationActif(dma)
    setJournalAudit(journal)
  }

  async function activerActif(id) {
    await dataService.activerActif(id, utilisateurEmail || role)
    await rafraichirApresChangementActif()
    await rafraichirApresMoteur() // alerte non bloquante si criticité Critique sans contrat/plan
  }

  async function demanderRetraitActif(id, motif) {
    await dataService.demanderRetraitActif(id, motif, utilisateurEmail || role)
    await rafraichirApresChangementActif()
    await rafraichirApresMoteur()
  }

  async function confirmerRetraitActif(id) {
    await dataService.confirmerRetraitActif(id, utilisateurEmail || role)
    await rafraichirApresChangementActif()
    await rafraichirApresMoteur()
  }

  async function ajouterPieceJointeActif(id, nomFichier, typeDocument) {
    const mis = await dataService.ajouterPieceJointeActif(id, nomFichier, typeDocument)
    setActifs((prev) => prev.map((a) => (a.id === id ? mis : a)))
  }

  async function demanderModificationActif(id, champs, categorie) {
    await dataService.demanderModificationActif(id, champs, categorie, utilisateurEmail || role)
    await rafraichirApresChangementActif()
    await rafraichirApresMoteur() // notifications structurantes -> tachesWorkflow
  }

  async function validerDemandeModification(id) {
    await dataService.validerDemandeModification(id, role)
    await rafraichirApresChangementActif()
  }

  async function creerEmplacement(nouvelEmplacement) {
    const cree = await dataService.createEmplacement(nouvelEmplacement)
    setEmplacements((prev) => [...prev, cree])
  }

  async function creerOrdreTravail(nouvelOrdre) {
    const cree = await dataService.createOrdreTravail(nouvelOrdre)
    setOrdresTravail((prev) => [cree, ...prev])
  }

  // Toute étape du workflow correctif/préventif (US-02, section 2.3) peut, côté
  // service, déclencher en cascade des mesures SLA, pénalités, tâches, alertes,
  // fiches post-incident ou avancement d'échéance préventive : on rafraîchit
  // donc systématiquement l'ensemble de ces collections plutôt que de ne patcher
  // que l'OT localement.
  async function rafraichirApresChangementOt() {
    await rafraichirApresMoteur()
  }

  const auteurCourant = () => utilisateurEmail || role

  async function changerStatutOrdreTravail(id, statut) {
    await dataService.updateOrdreTravailStatut(id, statut, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function qualifierOrdreTravail(id, details) {
    await dataService.qualifierOrdreTravail(id, details, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function accuserReceptionOrdreTravail(id, accepte, motifRefus) {
    await dataService.accuserReception(id, accepte, motifRefus, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function passerEnAttenteDePiece(id, delaiEstime) {
    await dataService.passerEnAttenteDePiece(id, delaiEstime, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function reprendreIntervention(id) {
    await dataService.reprendreIntervention(id, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function resoudreOrdreTravail(id, compteRendu) {
    await dataService.resoudreOrdreTravail(id, compteRendu, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function validerClotureOrdreTravail(id, valide, motifRefus) {
    await dataService.validerClotureOrdreTravail(id, valide, motifRefus, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function rejeterOrdreTravail(id, motif) {
    await dataService.rejeterOrdreTravail(id, motif, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function cloturerOrdreTravailAvecCompteRendu(id, compteRendu) {
    await dataService.cloturerOrdreTravailAvecCompteRendu(id, compteRendu, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function cocherItemChecklist(id, itemId, coche) {
    const mis = await dataService.cocherItemChecklist(id, itemId, coche)
    setOrdresTravail((prev) => prev.map((o) => (o.id === id ? mis : o)))
  }

  async function proposerDateIntervention(id, date) {
    const mis = await dataService.proposerDateIntervention(id, date, auteurCourant())
    setOrdresTravail((prev) => prev.map((o) => (o.id === id ? mis : o)))
  }

  async function validerDateIntervention(id, date) {
    await dataService.validerDateIntervention(id, date, auteurCourant())
    await rafraichirApresChangementOt()
  }

  async function signalerAnomaliePreventif(otPreventifId, description) {
    const cree = await dataService.signalerAnomaliePreventif(otPreventifId, description)
    if (cree) setOrdresTravail((prev) => [cree, ...prev])
  }

  async function ajouterPieceJointeOrdreTravail(id, nomFichier) {
    const mis = await dataService.ajouterPieceJointeOrdreTravail(id, nomFichier)
    setOrdresTravail((prev) => prev.map((o) => (o.id === id ? mis : o)))
  }

  async function creerTicket(nouveauTicket) {
    const cree = await dataService.createTicket(nouveauTicket)
    setTickets((prev) => [cree, ...prev])
  }

  // Transforme un ticket self-service en ordre de travail correctif (US-03) et
  // relie les deux enregistrements dans les deux sens.
  async function transformerTicketEnOrdre(ticketId) {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    const ordre = await dataService.createOrdreTravail({
      titre: ticket.titre,
      description: ticket.description,
      statut: 'Nouveau',
      priorite: 'Moyenne',
      origine: 'Corrective',
      actifId: ticket.actifId || '',
      technicien: '',
    })
    setOrdresTravail((prev) => [ordre, ...prev])
    await dataService.updateTicketStatut(ticketId, 'En traitement')
    await dataService.relierTicketAOrdre(ticketId, ordre.id)
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, statut: 'En traitement', ordreTravailId: ordre.id } : t)))
  }

  async function changerStatutTicket(id, statut) {
    await dataService.updateTicketStatut(id, statut)
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, statut } : t)))
  }

  async function ajouterPieceJointeTicket(id, nomFichier) {
    const mis = await dataService.ajouterPieceJointeTicket(id, nomFichier)
    setTickets((prev) => prev.map((t) => (t.id === id ? mis : t)))
  }

  async function creerCategorieActif(nouvelleCategorie) {
    const cree = await dataService.createCategorieActif(nouvelleCategorie)
    setCategoriesActif((prev) => [...prev, cree])
  }

  async function creerPieceRechange(nouvellePiece) {
    const cree = await dataService.createPieceRechange(nouvellePiece)
    setPiecesRechange((prev) => [...prev, cree])
  }

  async function creerMouvementStock(nouveauMouvement) {
    const cree = await dataService.createMouvementStock(nouveauMouvement)
    setMouvementsStock((prev) => [cree, ...prev])
    setPiecesRechange(await dataService.getPiecesRechange())
    await executerMoteurEtRafraichir()
  }

  async function creerConsommationEnergie(nouvelleConso) {
    const cree = await dataService.createConsommationEnergie(nouvelleConso)
    setConsommationsEnergie((prev) => [cree, ...prev])
  }

  async function creerUtilisateur(nouvelUtilisateur) {
    const cree = await dataService.createUtilisateur(nouvelUtilisateur)
    setUtilisateurs((prev) => [...prev, cree])
  }

  async function changerRoleUtilisateur(id, role) {
    await dataService.updateUtilisateurRole(id, role)
    setUtilisateurs((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  async function changerStatutUtilisateur(id, statut) {
    await dataService.updateUtilisateurStatut(id, statut)
    setUtilisateurs((prev) => prev.map((u) => (u.id === id ? { ...u, statut } : u)))
  }

  async function creerPlanPreventif(nouveauPlan) {
    const cree = await dataService.createPlanPreventif(nouveauPlan)
    setPlansPreventifs((prev) => [cree, ...prev])
  }

  async function validerPlanPreventif(id, dateDebut) {
    await dataService.validerPlanPreventif(id, role, dateDebut)
    const [pm, ech] = await Promise.all([dataService.getPlansPreventifs(), dataService.getEcheancesPlan()])
    setPlansPreventifs(pm)
    setEcheancesPlan(ech)
  }

  async function creerFournisseur(nouveauFournisseur) {
    const cree = await dataService.createFournisseur(nouveauFournisseur)
    setFournisseurs((prev) => [cree, ...prev])
  }

  async function creerContrat(nouveauContrat) {
    const cree = await dataService.createContrat(nouveauContrat)
    setContrats((prev) => [cree, ...prev])
  }

  async function creerSlaRule(nouvelleRegle) {
    const cree = await dataService.createSlaRule(nouvelleRegle)
    setSlaRules((prev) => [cree, ...prev])
  }

  async function creerSlaMeasure(nouvelleMesure) {
    const cree = await dataService.createSlaMeasure(nouvelleMesure)
    setSlaMeasures((prev) => [cree, ...prev])
  }

  async function changerStatutPenalite(id, statut) {
    await dataService.updatePenaliteStatut(id, statut)
    setPenalites((prev) => prev.map((p) => (p.id === id ? { ...p, statut } : p)))
    setJournalAudit(await dataService.getJournalAudit())
  }

  async function changerStatutValidation(id, statut, validateur) {
    const mis = await dataService.updateValidationPaiementStatut(id, statut, validateur)
    setValidationsPaiement((prev) => prev.map((v) => (v.id === id ? mis : v)))
    setJournalAudit(await dataService.getJournalAudit())
  }

  async function creerEvaluationPrestataire(nouvelleEvaluation) {
    const cree = await dataService.createEvaluationPrestataire(nouvelleEvaluation)
    setEvaluationsPrestataires((prev) => [cree, ...prev])
  }

  // Peut rejeter (double validation manquante pour une clé de zone classifiée
  // Élevée) : laissé volontairement à la charge de l'appelant (ClesAcces.jsx)
  // pour afficher un message d'erreur au bon endroit du formulaire.
  async function creerMouvementCle(nouveauMouvement) {
    const cree = await dataService.createMouvementCle(nouveauMouvement)
    setMouvementsCles((prev) => [cree, ...prev])
    setCles(await dataService.getCles())
    setJournalAudit(await dataService.getJournalAudit())
  }

  async function creerProjetImmobilier(nouveauProjet) {
    const cree = await dataService.createProjetImmobilier(nouveauProjet)
    setProjetsImmobiliers((prev) => [cree, ...prev])
  }

  async function changerStatutJalon(id, statut) {
    await dataService.updateJalonProjet(id, statut)
    setJalonsProjets((prev) => prev.map((j) => (j.id === id ? { ...j, statut } : j)))
  }

  async function enregistrerDepenseProjet(id, montant) {
    const mis = await dataService.updateProjetBudgetConsomme(id, montant)
    setProjetsImmobiliers((prev) => prev.map((p) => (p.id === id ? mis : p)))
    await executerMoteurEtRafraichir()
  }

  // Bascule automatique en exploitation (US-07) : crée l'emplacement patrimoine +
  // le plan préventif associé, donc on recharge ces deux collections en plus du projet.
  async function receptionnerProjet(id) {
    await dataService.receptionnerProjet(id)
    const [proj, emp, pm, alertes] = await Promise.all([
      dataService.getProjetsImmobiliers(),
      dataService.getEmplacements(),
      dataService.getPlansPreventifs(),
      dataService.getAlertesAutomatiques(),
    ])
    setProjetsImmobiliers(proj)
    setEmplacements(emp)
    setPlansPreventifs(pm)
    setAlertesAutomatiques(alertes)
  }

  async function changerStatutTacheWorkflow(id, statut) {
    await dataService.updateTacheWorkflowStatut(id, statut)
    setTachesWorkflow((prev) => prev.map((t) => (t.id === id ? { ...t, statut } : t)))
  }

  async function marquerAlerteLue(id) {
    await dataService.marquerAlerteLue(id)
    setAlertesAutomatiques((prev) => prev.map((a) => (a.id === id ? { ...a, lu: true } : a)))
  }

  if (vue === 'landing') {
    return <LandingPage onSeConnecter={() => setVue('login')} />
  }

  if (vue === 'login') {
    return <LoginPage onConnexion={seConnecter} onRetour={() => setVue('landing')} emplacements={emplacements} />
  }

  if (chargement) {
    return (
      <div className="app-shell">
        <TopBar utilisateurEmail={utilisateurEmail} role={role} alertesNonLues={0} onNaviguer={changerOnglet} onDeconnexion={seDeconnecter} />
        <div className="app-body">
          <Sidebar active={ongletActif} onChange={changerOnglet} role={role} />
          <main className="main">
            {erreurChargement ? (
              <p className="login-erreur">
                Impossible de charger les données ({erreurChargement}). Vérifie que le site est bien
                servi par Power Pages (les appels /_api ne fonctionnent pas en local) et que les
                permissions de table sont configurées, puis recharge la page.
              </p>
            ) : (
              <p>Chargement des données…</p>
            )}
          </main>
        </div>
      </div>
    )
  }

  const actifSelectionne = actifs.find((a) => a.id === actifSelectionneId)
  const alertesNonLues = alertesAutomatiques.filter((a) => !a.lu).length

  // Sécurité par ligne (US-01, point d'attention 1.6) : le Responsable de site
  // ne voit que les actifs/tickets/OT rattachés à son site (et ses sous-emplacements).
  function appartientAuSite(emplacementId) {
    if (!siteId) return true
    let courant = emplacements.find((e) => e.id === emplacementId)
    while (courant) {
      if (courant.id === siteId) return true
      courant = emplacements.find((e) => e.id === courant.parentId)
    }
    return false
  }
  const actifsVisibles = siteId ? actifs.filter((a) => appartientAuSite(a.emplacementId)) : actifs
  const ticketsVisibles = siteId ? tickets.filter((t) => appartientAuSite(t.emplacementId)) : tickets
  const idsActifsVisibles = new Set(actifsVisibles.map((a) => a.id))
  const ordresTravailVisibles = siteId ? ordresTravail.filter((o) => idsActifsVisibles.has(o.actifId)) : ordresTravail

  return (
    <div className="app-shell">
      <TopBar utilisateurEmail={utilisateurEmail} role={role} alertesNonLues={alertesNonLues} onNaviguer={changerOnglet} onDeconnexion={seDeconnecter} />
      <div className="app-body">
      <Sidebar active={ongletActif} onChange={changerOnglet} role={role} />
      <main className="main">
        {ongletActif === 'dashboard' && (
          <Dashboard actifs={actifsVisibles} ordresTravail={ordresTravailVisibles} tickets={ticketsVisibles} emplacements={emplacements} role={role} />
        )}
        {ongletActif === 'actifs' && (
          actifSelectionne ? (
            <ActifDetail
              actif={actifSelectionne}
              emplacements={emplacements}
              categoriesActif={categoriesActif}
              ordresTravail={ordresTravail}
              tickets={tickets}
              plansPreventifs={plansPreventifs}
              contrats={contrats}
              fournisseurs={fournisseurs}
              journalAudit={journalAudit}
              demandesModificationActif={demandesModificationActif.filter((d) => d.actifId === actifSelectionne.id)}
              onRetour={() => setActifSelectionneId(null)}
              onActiver={activerActif}
              onDemanderRetrait={demanderRetraitActif}
              onConfirmerRetrait={confirmerRetraitActif}
              onAjouterPieceJointe={ajouterPieceJointeActif}
              onDemanderModification={demanderModificationActif}
              onValiderDemandeModification={validerDemandeModification}
            />
          ) : (
            <ActifsList
              actifs={actifsVisibles}
              emplacements={emplacements}
              categoriesActif={categoriesActif}
              onChangerStatut={changerStatutActif}
              onSelectionner={setActifSelectionneId}
              onCreer={creerActif}
              onImporterCsv={importerActifsCsv}
              onActiver={activerActif}
              onGenererCodeInventaire={dataService.genererProchainCodeInventaire}
              onCreerEmplacement={creerEmplacement}
            />
          )
        )}
        {ongletActif === 'emplacements' && (
          <EmplacementsList emplacements={emplacements} actifs={actifs} onCreer={creerEmplacement} />
        )}
        {ongletActif === 'categoriesActifs' && (
          <CategoriesActifs categoriesActif={categoriesActif} actifs={actifs} fournisseurs={fournisseurs} onCreer={creerCategorieActif} />
        )}
        {ongletActif === 'piecesRechange' && (
          <PiecesRechange
            piecesRechange={piecesRechange}
            mouvementsStock={mouvementsStock}
            categoriesActif={categoriesActif}
            onCreerPiece={creerPieceRechange}
            onCreerMouvement={creerMouvementStock}
          />
        )}
        {ongletActif === 'consommationEnergie' && (
          <ConsommationEnergie consommationsEnergie={consommationsEnergie} emplacements={emplacements} onCreer={creerConsommationEnergie} />
        )}
        {ongletActif === 'utilisateurs' && (
          <Utilisateurs
            utilisateurs={utilisateurs}
            onCreer={creerUtilisateur}
            onChangerRole={changerRoleUtilisateur}
            onChangerStatut={changerStatutUtilisateur}
          />
        )}
        {ongletActif === 'ordresTravail' && (
          <OrdresTravailList
            ordresTravail={ordresTravailVisibles}
            actifs={actifs}
            fournisseurs={fournisseurs}
            emplacements={emplacements}
            historiqueOrdreTravail={historiqueOrdreTravail}
            onCreer={creerOrdreTravail}
            onChangerStatut={changerStatutOrdreTravail}
            onQualifier={qualifierOrdreTravail}
            onAccuserReception={accuserReceptionOrdreTravail}
            onPasserEnAttenteDePiece={passerEnAttenteDePiece}
            onReprendreIntervention={reprendreIntervention}
            onResoudre={resoudreOrdreTravail}
            onValiderCloture={validerClotureOrdreTravail}
            onRejeter={rejeterOrdreTravail}
            onCloturerAvecCompteRendu={cloturerOrdreTravailAvecCompteRendu}
            onCocherItemChecklist={cocherItemChecklist}
            onProposerDateIntervention={proposerDateIntervention}
            onValiderDateIntervention={validerDateIntervention}
            onSignalerAnomalie={signalerAnomaliePreventif}
            onAjouterPieceJointe={ajouterPieceJointeOrdreTravail}
          />
        )}
        {ongletActif === 'tickets' && (
          <TicketsList
            tickets={ticketsVisibles}
            emplacements={emplacements}
            actifs={actifs}
            onCreer={creerTicket}
            onChangerStatut={changerStatutTicket}
            onAjouterPieceJointe={ajouterPieceJointeTicket}
            onTransformerEnOrdre={transformerTicketEnOrdre}
          />
        )}
        {ongletActif === 'maintenancePreventive' && (
          <MaintenancePreventiveList
            plansPreventifs={plansPreventifs}
            echeancesPlan={echeancesPlan}
            actifs={actifs}
            categoriesActif={categoriesActif}
            fournisseurs={fournisseurs}
            ordresTravail={ordresTravail}
            role={role}
            onCreer={creerPlanPreventif}
            onValider={validerPlanPreventif}
          />
        )}
        {ongletActif === 'fournisseurs' && (
          <FournisseursList
            fournisseurs={fournisseurs}
            contrats={contrats}
            actifs={actifs}
            onCreerFournisseur={creerFournisseur}
            onCreerContrat={creerContrat}
          />
        )}
        {ongletActif === 'afrilandDashboard' && (
          <AfrilandDashboard
            slaMeasures={slaMeasures}
            penalites={penalites}
            validationsPaiement={validationsPaiement}
            evaluationsPrestataires={evaluationsPrestataires}
            projetsImmobiliers={projetsImmobiliers}
            jalonsProjets={jalonsProjets}
            tachesWorkflow={tachesWorkflow}
            alertesAutomatiques={alertesAutomatiques}
            rapportsMensuels={rapportsMensuels}
            fichesAnalysePostIncident={fichesAnalysePostIncident}
            role={role}
          />
        )}
        {ongletActif === 'slaReglesMesures' && (
          <SlaReglesMesures
            slaRules={slaRules}
            slaMeasures={slaMeasures}
            categoriesActif={categoriesActif}
            contrats={contrats}
            fournisseurs={fournisseurs}
            ordresTravail={ordresTravail}
            onCreerRegle={creerSlaRule}
            onCreerMesure={creerSlaMeasure}
          />
        )}
        {ongletActif === 'slaPenalites' && (
          <SlaPenalitesPaiements
            penalites={penalites}
            validationsPaiement={validationsPaiement}
            slaMeasures={slaMeasures}
            contrats={contrats}
            fournisseurs={fournisseurs}
            journalAudit={journalAudit}
            onChangerStatutPenalite={changerStatutPenalite}
            onChangerStatutValidation={changerStatutValidation}
          />
        )}
        {ongletActif === 'evaluationsPrestataires' && (
          <EvaluationsPrestataires
            evaluationsPrestataires={evaluationsPrestataires}
            fournisseurs={fournisseurs}
            onCreer={creerEvaluationPrestataire}
          />
        )}
        {ongletActif === 'clesAcces' && (
          <ClesAcces
            cles={cles}
            mouvementsCles={mouvementsCles}
            emplacements={emplacements}
            journalAudit={journalAudit}
            onCreerMouvement={creerMouvementCle}
          />
        )}
        {ongletActif === 'projetsImmobiliers' && (
          <ProjetsImmobiliers
            projetsImmobiliers={projetsImmobiliers}
            jalonsProjets={jalonsProjets}
            emplacements={emplacements}
            onCreerProjet={creerProjetImmobilier}
            onChangerStatutJalon={changerStatutJalon}
            onEnregistrerDepense={enregistrerDepenseProjet}
            onReceptionner={receptionnerProjet}
          />
        )}
        {ongletActif === 'tachesAlertes' && (
          <TachesAlertes
            tachesWorkflow={tachesWorkflow}
            alertesAutomatiques={alertesAutomatiques}
            onChangerStatutTache={changerStatutTacheWorkflow}
            onMarquerLue={marquerAlerteLue}
            onExecuterMoteur={executerMoteurEtRafraichir}
          />
        )}
      </main>
      </div>
    </div>
  )
}
