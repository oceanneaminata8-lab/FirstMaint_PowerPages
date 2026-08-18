// Authentification réelle Power Pages / Microsoft Entra ID — remplace l'ancien
// écran de connexion factice (email/mot de passe non vérifiés). Power Pages
// expose l'identité du visiteur connecté sur window.Microsoft.Dynamic365.Portal.User
// et gère lui-même le flux OAuth : on se contente de déclencher/arrêter la
// connexion via ses routes /Account/Login/.
import { getRequestVerificationToken } from './portalApi.js'

// Locataire Entra ID d'Afriland First Bank (afrilandfirstbank.com), utilisé
// comme "authority" pour le fournisseur d'identité Entra ID configuré sur le
// site Power Pages FirstMaint.
const TENANT_ID = '2bd82a68-2c7d-4c43-b080-9b064410f6cf'

// Lit l'utilisateur du portail actuellement connecté (null si personne n'est
// connecté, ou si l'app tourne hors d'un site Power Pages, ex. en local).
export function getPortalUser() {
  const user = typeof window !== 'undefined' ? window.Microsoft?.Dynamic365?.Portal?.User : null
  const userName = user?.userName || ''
  if (!userName) return null
  return {
    email: userName,
    prenom: user?.firstName || '',
    nom: user?.lastName || '',
  }
}

// Déclenche la connexion Entra ID : soumission d'un vrai formulaire POST vers
// /Account/Login/ExternalLogin (redirection de page complète, comme le fait
// Power Pages nativement — pas un appel fetch/AJAX).
export async function connexionEntraId() {
  const token = await getRequestVerificationToken()
  const form = document.createElement('form')
  form.method = 'post'
  form.action = '/Account/Login/ExternalLogin'

  const champToken = document.createElement('input')
  champToken.type = 'hidden'
  champToken.name = '__RequestVerificationToken'
  champToken.value = token
  form.appendChild(champToken)

  const champProvider = document.createElement('input')
  champProvider.type = 'hidden'
  champProvider.name = 'provider'
  champProvider.value = `https://login.windows.net/${TENANT_ID}/`
  form.appendChild(champProvider)

  document.body.appendChild(form)
  form.submit()
}

export function deconnexionPortail() {
  window.location.href = '/Account/Login/LogOff?returnUrl=%2F'
}
