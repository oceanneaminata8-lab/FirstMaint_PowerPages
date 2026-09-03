import { Icon } from './Icons.jsx'
import { BrandMark } from './BrandMark.jsx'

const FONCTIONNALITES = [
  { titre: 'Actifs', icone: 'actifs', description: 'Inventaire complet des équipements avec fiche détail, historique d\'interventions et filtres avancés.' },
  { titre: 'Emplacements', icone: 'emplacements', description: 'Vue hiérarchique des sites : siège, agences, étages et salles techniques.' },
  { titre: 'Ordres de travail', icone: 'ordres', description: 'Planification des interventions, priorisation, assignation aux techniciens et journal de suivi.' },
  { titre: 'Tickets', icone: 'tickets', description: 'Centralisation des demandes remontées par les agences avant transformation en ordre de travail.' },
  { titre: 'Maintenance préventive', icone: 'preventive', description: 'Plans récurrents par fréquence, rattachés à un actif ou à une catégorie, pour anticiper les pannes.' },
  { titre: 'Fournisseurs & Contrats', icone: 'fournisseurs', description: 'Suivi des prestataires externes et des contrats de maintenance ou de garantie par actif.' },
]

const ATOUTS = [
  {
    titre: 'Rigueur panafricaine',
    description: 'Une gestion de maintenance à la hauteur des standards d\'excellence du Groupe, sur l\'ensemble de son réseau.',
  },
  {
    titre: 'Traçabilité complète',
    description: 'Chaque intervention, chaque changement de statut et chaque pièce jointe est journalisé, pour une continuité de service sans faille.',
  },
  {
    titre: 'Multi-sites, un seul système',
    description: 'Siège de Yaoundé, agences et sites techniques réunis dans une hiérarchie unique et consultable.',
  },
]

const STATS = [
  { valeur: '1987', label: 'Année de création d\'Afriland First Bank' },
  { valeur: '9 pays', label: 'Présence panafricaine — Cameroun et 8 filiales' },
  { valeur: 'Yaoundé', label: 'Siège social du Groupe, Cameroun' },
]

export function LandingPage({ onSeConnecter }) {
  return (
    <div className="landing">
      <div className="landing-utility-bar">
        <span>Afriland First Bank — Direction des Moyens Généraux</span>
        <span className="landing-utility-lang">FR · EN</span>
      </div>

      <header className="landing-header">
        <div className="landing-brand">
          <BrandMark compact />
        </div>
        <nav className="landing-nav">
          <a href="#accueil" className="active">Accueil</a>
          <a href="#a-propos">À propos</a>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#tarifs">Accès</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="btn-cta" onClick={onSeConnecter}>Se connecter</button>
      </header>

      <div className="landing-pattern-strip" aria-hidden="true" />

      <section className="landing-hero" id="accueil">
        <div className="landing-hero-text">
          <span className="landing-eyebrow">Outil interne — Afriland First Bank</span>
          <h1>
            La rigueur d'une <span className="accent">banque panafricaine</span>,
            appliquée à la maintenance de vos sites.
          </h1>
          <p>
            FirstMaint est l'outil de gestion de maintenance déployé par Afriland
            First Bank pour piloter avec précision les actifs, les interventions
            et les sites de son réseau — du siège de Yaoundé à ses agences à
            travers l'Afrique.
          </p>
          <div className="landing-hero-actions">
            <button className="btn-cta" onClick={onSeConnecter}>Se connecter</button>
            <a href="#fonctionnalites" className="btn-cta secondary">Découvrir les fonctionnalités</a>
          </div>
        </div>
      </section>

      <div className="landing-pattern-strip" aria-hidden="true" />

      <section className="landing-section" id="fonctionnalites">
        <div className="landing-section-header">
          <span className="landing-kicker">Fonctionnalités</span>
          <h2>Tout ce qu'il faut pour piloter la maintenance</h2>
          <p>Des actifs jusqu'aux contrats fournisseurs, chaque module s'appuie sur les mêmes données.</p>
        </div>
        <div className="landing-grid">
          {FONCTIONNALITES.map((f) => (
            <div key={f.titre} className="landing-card">
              <span className="landing-card-icon"><Icon type={f.icone} /></span>
              <h3>{f.titre}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-sunken" id="a-propos">
        <div className="landing-apropos-grid">
          <div>
            <span className="landing-kicker">À propos</span>
            <h2>Un outil pensé pour le Groupe Afriland</h2>
            <p>
              Fondée en 1987 à Yaoundé, Afriland First Bank s'est imposée comme
              l'un des groupes bancaires panafricains de référence, avec des
              filiales en République Démocratique du Congo, en Guinée
              Équatoriale, en Guinée, au Liberia, au Soudan du Sud, à
              São Tomé-et-Príncipe, en Côte d'Ivoire et en Zambie. Sa vision —
              devenir « la banque africaine du millénaire » — porte l'ambition
              d'une Afrique financièrement souveraine et connectée. FirstMaint
              accompagne cette ambition au niveau des infrastructures.
            </p>
          </div>

          <div className="landing-hero-panel">
            <div className="landing-hero-pattern" aria-hidden="true" />
            <span className="landing-hero-panel-caption">Afriland First Bank en bref</span>
            <div className="landing-hero-stats">
              {STATS.map((s) => (
                <div key={s.label} className="landing-stat-card">
                  <span className="value">{s.valeur}</span>
                  <span className="label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="landing-atouts">
          {ATOUTS.map((a) => (
            <div key={a.titre} className="landing-atout">
              <h3>{a.titre}</h3>
              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="tarifs">
        <div className="landing-section-header">
          <span className="landing-kicker">Accès</span>
          <h2>Un accès réservé aux collaborateurs</h2>
          <p>FirstMaint est un outil interne — pas d'abonnement, un accès sécurisé pour chaque collaborateur habilité.</p>
        </div>
        <div className="landing-tarif-card">
          <h3>Accès collaborateur</h3>
          <p>
            Déployé et financé par Afriland First Bank pour l'ensemble des équipes
            de maintenance, techniciens et gestionnaires de site. Aucun coût
            supplémentaire, aucune carte bancaire requise.
          </p>
          <button className="btn-cta" onClick={onSeConnecter}>Se connecter avec mon compte</button>
        </div>
      </section>

      <section className="landing-section landing-section-sunken" id="contact">
        <div className="landing-section-header">
          <span className="landing-kicker">Contact</span>
          <h2>Une question, un incident ?</h2>
          <p>L'équipe Facilities Management est à votre écoute.</p>
        </div>
        <div className="landing-contact-card">
          <div>
            <strong>Support technique interne</strong>
            <span>Contactez votre référent maintenance via le canal habituel de votre agence ou du siège.</span>
          </div>
          <div>
            <strong>Assistance applicative</strong>
            <span>Pour un problème d'accès à FirstMaint, adressez-vous à votre responsable IT local.</span>
          </div>
        </div>
      </section>

      <div className="landing-pattern-strip" aria-hidden="true" />

      <section className="landing-cta">
        <h2>Prêt à commencer ?</h2>
        <p>Connectez-vous pour accéder au tableau de bord de votre site.</p>
        <button className="btn-cta" onClick={onSeConnecter}>Se connecter à FirstMaint</button>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <BrandMark variant="inverse" compact />
            <p>Outil interne de gestion de maintenance d'Afriland First Bank.</p>
          </div>
          <div>
            <strong>Navigation</strong>
            <a href="#accueil">Accueil</a>
            <a href="#a-propos">À propos</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
          </div>
          <div>
            <strong>Groupe</strong>
            <a href="#tarifs">Accès</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          © {new Date().getFullYear()} FirstMaint — Afriland First Bank. Application de gestion de maintenance interne.
        </div>
      </footer>
    </div>
  )
}
