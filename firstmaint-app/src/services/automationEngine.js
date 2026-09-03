// ============================================================================
// MOTEUR DE RÈGLES — automatisations requises par le cahier des charges :
// génération anticipée des OT préventifs, escalade SLA à 4 paliers sur le
// correctif, non-respect d'échéance préventive à 3 paliers, validation tacite
// de clôture, alertes budget/jalon sur les projets immobiliers, rapport
// mensuel préventif simulé.
//
// Les règles métier doivent être exécutées côté Dataverse, par Power Automate
// ou une Azure Function. Le client ne doit jamais modifier des données locales.
//
// Idempotent : chaque alerte/tâche générée porte un `sourceId` stable ; le
// moteur ne recrée jamais une alerte déjà émise pour le même événement.
// ============================================================================

export async function executerMoteurRegles() {
  // Les automatisations persistantes seront déclenchées côté serveur.
  return []
}

/*
  Ancienne implémentation client conservée uniquement dans l'historique Git.

  // 1. Plans préventifs actifs : génération anticipée de l'OT à J-30 (criticité
  // Critique/Haute) ou J-15 (Moyenne/Basse) avant l'échéance de chaque actif
  // couvert (US-03, section 3.4, étape 1). La checklist du plan est copiée sur
  // l'OT généré ; l'échéance elle-même n'avance qu'à la clôture de l'OT
  // (dataService.avancerEcheancePreventive), pas à la génération.
  for (const ech of echeancesPlan) {
    const plan = plansPreventifs.find((p) => p.id === ech.planPreventifId)
    if (!plan || plan.etatCycleVie !== 'Actif') continue
    const actif = actifs.find((a) => a.id === ech.actifId)
    const anticipation = DELAI_ANTICIPATION_PAR_CRITICITE[actif?.criticite] ?? 15
    const dateGeneration = new Date(ech.prochaineEcheance)
    dateGeneration.setDate(dateGeneration.getDate() - anticipation)

    const dejaGenere = ordresTravail.some(
      (o) => o.planPreventifId === plan.id && o.actifId === ech.actifId && o.dateEcheance === ech.prochaineEcheance
    )
    if (dateGeneration <= aujourdHui && !dejaGenere) {
      const prestataire = fournisseurs.find((f) => f.id === plan.prestataireParDefautId)
      const ot = await createOrdreTravail({
        titre: `Intervention préventive — ${plan.nom}`,
        description: plan.description,
        statut: 'Affecté', // pré-affecté au prestataire/équipe par défaut du plan
        priorite: actif?.criticite === 'Critique' ? 'Haute' : 'Moyenne',
        origine: 'Préventif',
        planPreventifId: plan.id,
        actifId: ech.actifId,
        technicien: prestataire?.nom || '',
        dateEcheance: ech.prochaineEcheance,
        checklist: plan.checklist.map((item) => ({ ...item, coche: false })),
      })
      nouveauxOT.push(ot)
      ajouterAlerte({
        titre: `OT préventif généré — ${plan.nom}`,
        niveau: 'Info',
        source: 'Moteur préventif',
        description: `Ordre de travail ${ot.numero} généré ${anticipation} j avant l'échéance du ${ech.prochaineEcheance}.`,
        sourceId: `preventif-genere-${ech.id}-${ech.prochaineEcheance}`,
      })
    }
  }

  // 2. Non-respect d'une échéance préventive — 3 paliers (US-03, section 3.5).
  for (const ech of echeancesPlan) {
    const plan = plansPreventifs.find((p) => p.id === ech.planPreventifId)
    if (!plan || plan.etatCycleVie !== 'Actif') continue
    const actif = actifs.find((a) => a.id === ech.actifId)
    const retardJours = joursDepuis(ech.prochaineEcheance)
    if (retardJours < 1) continue

    const critique = actif?.criticite === 'Critique'
    const haute = actif?.criticite === 'Haute'

    if (retardJours >= 1) {
      ajouterAlerte({
        titre: `Échéance préventive dépassée — ${plan.nom}`,
        niveau: 'Avertissement',
        source: 'Suivi préventif',
        description: `Échéance du ${ech.prochaineEcheance} dépassée de ${Math.floor(retardJours)} jour(s) pour l'actif "${actif?.nom || ech.actifId}".`,
        sourceId: `rappel-echeance-${ech.id}-${ech.prochaineEcheance}`,
      })
    }

    const seuilNonConformite = critique ? 7 : (haute ? 15 : null)
    if (seuilNonConformite && retardJours >= seuilNonConformite) {
      const cree = ajouterAlerte({
        titre: `Non-conformité préventive — ${plan.nom}`,
        niveau: 'Critique',
        source: 'Suivi préventif',
        description: `Échéance dépassée de ${Math.floor(retardJours)} jour(s) sur un actif de criticité ${actif?.criticite} — non-conformité SLA comptabilisée.`,
        sourceId: `non-conformite-echeance-${ech.id}-${ech.prochaineEcheance}`,
      })
      if (cree) {
        tachesWorkflow.push({
          id: idAleatoire('twf'),
          titre: `Non-conformité préventive à traiter — ${plan.nom}`,
          type: 'Non-conformité préventive',
          assigneA: 'Gestionnaire DMG',
          statut: 'À faire',
          dateEcheance: new Date().toISOString().slice(0, 10),
        })
      }
    }

    const seuilCritique = critique ? 30 : (haute ? 60 : null)
    if (seuilCritique && retardJours >= seuilCritique) {
      const cree = ajouterAlerte({
        titre: `Échéance préventive gravement dépassée — ${plan.nom}`,
        niveau: 'Critique',
        source: 'Suivi préventif',
        description: `Échéance dépassée de ${Math.floor(retardJours)} jour(s) — suspension du contrat associé et mobilisation d'un prestataire de secours à envisager.`,
        sourceId: `critique-echeance-${ech.id}-${ech.prochaineEcheance}`,
      })
      if (cree) {
        tachesWorkflow.push({
          id: idAleatoire('twf'),
          titre: `Suspension contrat à valider — ${plan.nom}`,
          type: 'Escalade Responsable DMG',
          assigneA: 'Responsable DMG',
          statut: 'À faire',
          dateEcheance: new Date().toISOString().slice(0, 10),
        })
        const contrat = contrats.find((c) => c.actifsCouverts.includes(ech.actifId))
        if (contrat) contrat.statut = 'Suspendu'
      }
    }
  }

  // 3. OT correctifs : escalade SLA à 4 paliers (US-02, section 2.4).
  for (const ot of ordresTravail) {
    if (ot.origine !== 'Corrective' || ['Clôturé', 'Rejeté'].includes(ot.statut)) continue
    const actif = actifs.find((a) => a.id === ot.actifId)
    const delaiHeures = DELAI_MAX_PAR_CRITICITE[actif?.criticite] ?? 72
    const heuresEcoulees = joursDepuis(ot.dateOuverture) * 24
    const pourcentage = (heuresEcoulees / delaiHeures) * 100

    const paliers = [
      { seuil: 200, niveau: 'Critique', libelle: '200 % du délai SLA dépassé', dest: 'Direction Générale' },
      { seuil: 100, niveau: 'Critique', libelle: '100 % du délai SLA dépassé', dest: 'Responsable DMG' },
      { seuil: 80, niveau: 'Avertissement', libelle: '80 % du délai SLA écoulé', dest: 'Responsable de site' },
      { seuil: 50, niveau: 'Avertissement', libelle: '50 % du délai SLA écoulé', dest: 'Gestionnaire DMG' },
    ]
    for (const palier of paliers) {
      if (pourcentage < palier.seuil) continue
      const sourceId = `escalade-${palier.seuil}-${ot.id}`
      const cree = ajouterAlerte({
        titre: `${palier.libelle} — ${ot.numero || ot.titre}`,
        niveau: palier.niveau,
        source: 'Moteur d\'escalade',
        description: `L'ordre de travail "${ot.titre}" a atteint ${palier.seuil}% de son délai SLA (${actif?.criticite || 'criticité inconnue'}). Notification : ${palier.dest}.`,
        sourceId,
      })
      if (cree && palier.seuil === 100 && ot.statut !== 'En escalade') {
        ot.statut = 'En escalade'
        historiqueOrdreTravail.push({
          id: idAleatoire('hist'), ordreTravailId: ot.id, statut: 'En escalade',
          date: new Date().toISOString().slice(0, 10), auteur: 'Moteur d\'escalade',
        })
      }
      break // ne notifier que le palier le plus élevé atteint
    }
  }

  // 4. Défaut d'accusé de réception (US-02, étape 3) : OT affecté sans accusé
  // au-delà du seuil par criticité (30 min / 2h / 4h).
  const SEUIL_ACCUSE_HEURES = { Critique: 0.5, Haute: 2, Moyenne: 4, Basse: 4 }
  for (const ot of ordresTravail) {
    if (ot.statut !== 'Affecté' || ot.dateAccuseReception) continue
    const actif = actifs.find((a) => a.id === ot.actifId)
    const seuil = SEUIL_ACCUSE_HEURES[actif?.criticite] ?? 4
    const dateAffectation = dateEntreeStatut(ot.id, 'Affecté') || ot.dateOuverture
    const heuresEcoulees = joursDepuis(dateAffectation) * 24
    if (heuresEcoulees >= seuil) {
      ajouterAlerte({
        titre: `Défaut d'accusé de réception — ${ot.numero || ot.titre}`,
        niveau: 'Avertissement',
        source: 'Suivi correctif',
        description: `Aucun accusé de réception depuis l'affectation (seuil ${seuil}h dépassé).`,
        sourceId: `defaut-accuse-${ot.id}`,
      })
    }
  }

  // 5. Attente de pièce prolongée (US-02, étape 4) : > 48h criticité Critique,
  // > 5 jours criticité Haute.
  for (const ot of ordresTravail) {
    if (ot.statut !== 'En attente de pièce') continue
    const actif = actifs.find((a) => a.id === ot.actifId)
    const dateEntree = dateEntreeStatut(ot.id, 'En attente de pièce')
    if (!dateEntree) continue
    const joursEcoules = joursDepuis(dateEntree)
    const seuilJours = actif?.criticite === 'Critique' ? 2 : (actif?.criticite === 'Haute' ? 5 : null)
    if (seuilJours && joursEcoules >= seuilJours) {
      ajouterAlerte({
        titre: `Attente de pièce prolongée — ${ot.numero || ot.titre}`,
        niveau: 'Avertissement',
        source: 'Suivi correctif',
        description: `En attente de pièce depuis ${Math.floor(joursEcoules)} jour(s) — envisager une solution palliative.`,
        sourceId: `attente-piece-${ot.id}-${dateEntree}`,
      })
    }
  }

  // 6. Rappel de validation de clôture (workflows v2.0, étape 6) : pas de
  // validation tacite — un OT "Résolu" reste ouvert tant que le responsable de
  // site ne s'est pas prononcé explicitement. Un rappel est renvoyé chaque
  // jour (sourceId daté -> se répète sans jamais dupliquer le même jour).
  for (const ot of ordresTravail) {
    if (ot.statut !== 'Résolu' || !ot.dateResolution) continue
    const joursEcoules = Math.floor(joursDepuis(ot.dateResolution))
    if (joursEcoules < 1) continue
    ajouterAlerte({
      titre: `Validation de clôture en attente — ${ot.numero || ot.titre}`,
      niveau: 'Avertissement',
      source: 'Suivi correctif',
      description: `Résolu depuis ${joursEcoules} jour(s), en attente de validation explicite du responsable de site (pas de clôture automatique).`,
      sourceId: `rappel-cloture-${ot.id}-${new Date().toISOString().slice(0, 10)}`,
    })
  }

  // 7. Trois correctifs en 30 jours sur le même actif -> revue du plan
  // préventif recommandée (US-02/US-03, articulation des workflows).
  const parActif = new Map()
  ordresTravail
    .filter((o) => o.origine === 'Corrective' && joursDepuis(o.dateOuverture) <= 30)
    .forEach((o) => parActif.set(o.actifId, [...(parActif.get(o.actifId) || []), o]))
  for (const [actifId, ots] of parActif) {
    if (ots.length < 3) continue
    const actif = actifs.find((a) => a.id === actifId)
    const moisCourant = new Date().toISOString().slice(0, 7)
    const cree = ajouterAlerte({
      titre: `Revue du plan préventif recommandée — ${actif?.nom || actifId}`,
      niveau: 'Avertissement',
      source: 'Articulation correctif/préventif',
      description: `${ots.length} interventions correctives sur cet actif au cours des 30 derniers jours.`,
      sourceId: `revue-preventif-${actifId}-${moisCourant}`,
    })
    if (cree) {
      tachesWorkflow.push({
        id: idAleatoire('twf'),
        titre: `Revoir le plan préventif de "${actif?.nom || actifId}"`,
        type: 'Revue plan préventif',
        assigneA: 'Gestionnaire DMG',
        statut: 'À faire',
        dateEcheance: new Date().toISOString().slice(0, 10),
      })
    }
  }

  // 8. Rapport mensuel préventif simulé (US-03, point d'attention 3.6) — une
  // seule "génération" par mois.
  const moisCourant = new Date().toISOString().slice(0, 7)
  if (!rapportsMensuels.some((r) => r.mois === moisCourant)) {
    const debutMois = `${moisCourant}-01`
    const realises = ordresTravail.filter((o) => o.origine === 'Préventif' && o.statut === 'Clôturé' && o.dateCloture >= debutMois).length
    const prevus = echeancesPlan.filter((e) => e.prochaineEcheance >= debutMois && e.prochaineEcheance <= new Date().toISOString().slice(0, 10)).length
    const enRetard = echeancesPlan.filter((e) => joursDepuis(e.prochaineEcheance) > 0).length
    rapportsMensuels.push({
      id: idAleatoire('rap'), mois: moisCourant, dateEnvoi: new Date().toISOString().slice(0, 10),
      realises, prevus, enRetard,
    })
    tachesWorkflow.push({
      id: idAleatoire('twf'),
      titre: `Rapport mensuel préventif ${moisCourant} envoyé au Responsable DMG`,
      type: 'Rapport mensuel',
      assigneA: 'Responsable DMG',
      statut: 'Terminé',
      dateEcheance: new Date().toISOString().slice(0, 10),
    })
  }

  // 9. Projets immobiliers : dépassement budget >10% ou jalon en retard >15j.
  projetsImmobiliers.forEach((p) => {
    if (p.statut === 'Terminé' || !p.budget) return
    if (p.budgetConsomme > p.budget * 1.1) {
      ajouterAlerte({
        titre: `Dépassement budgétaire — ${p.nom}`,
        niveau: 'Critique',
        source: 'Suivi de projets',
        description: `Budget consommé (${p.budgetConsomme.toLocaleString('fr-FR')} FCFA) supérieur de plus de 10 % au budget alloué (${p.budget.toLocaleString('fr-FR')} FCFA).`,
        sourceId: `budget-${p.id}`,
      })
    }
  })
  jalonsProjets.forEach((j) => {
    if (j.statut === 'Atteint') return
    if (joursDepuis(j.dateEcheance) > 15) {
      const projet = projetsImmobiliers.find((p) => p.id === j.projetId)
      ajouterAlerte({
        titre: `Jalon très en retard — ${j.nom}`,
        niveau: 'Critique',
        source: 'Suivi de projets',
        description: `Jalon "${j.nom}"${projet ? ` (${projet.nom})` : ''} en retard de plus de 15 jours sur son échéance du ${j.dateEcheance}.`,
        sourceId: `jalon-retard-${j.id}`,
      })
    }
  })

  // 10. Stock de pièces de rechange sous le seuil minimum (Gestion de la logistique).
  piecesRechange.forEach((piece) => {
    if (piece.quantiteStock < piece.seuilMinimum) {
      ajouterAlerte({
        titre: `Stock bas — ${piece.nom}`,
        niveau: 'Avertissement',
        source: 'Suivi des stocks',
        description: `Stock actuel (${piece.quantiteStock} ${piece.unite}) sous le seuil minimum (${piece.seuilMinimum} ${piece.unite}).`,
        sourceId: `stock-bas-${piece.id}`,
      })
    }
  })

  return { nouveauxOT }
}
*/
