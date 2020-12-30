import localeAntd from 'ant-design-vue/lib/locale-provider/fr_FR'

const messages = {
  topBar: {
    issuesHistory: 'Histoire des problèmes',
    typeToSearch: 'Chercher...',
    actions: 'Actes',
    status: 'Statut',
    profileMenu: {
      hello: 'Bonjour',
      company: 'Entreprise',
      billingPlan: 'Plan de facturation',
      role: 'Rôle',
      email: 'Email',
      phone: 'Téléphone',
      editProfile: 'Editer le profil',
      logout: 'Connectez - Out',
    },
  },
  dashboard: {
    document: {
      extractions: 'Vos extractions',
      upload: 'Uploader',
      validate: 'Valider les extractions',
      loading: 'Chargement...',
      bulkDownload: 'Télécharger en masse',
      resetSettings: 'Réinitialiser les paramètres',
      view: 'Consulter',
      remove: 'Supprimer',
      filterSettings: 'Paramètres de filtrage',
      name: 'Nom',
      template: 'Template',
      client: 'Client',
      status: 'Statut',
      dateAdded: `Date d'ajout`,
      action: 'Action',
      placeholder: {
        name: `Entrez le nom du document`,
        template: 'Sélectionnez le template',
        status: 'Sélectionnez le statut',
      },
      states: {
        pending: 'En cours',
        smelted: 'Smelted',
        validated: 'Validé',
      },
    },
    subbar: {
      return: 'Retour',
      select: 'Selectionner',
      previous: 'Précédent',
      next: 'Suivant',
      shortcutsView: 'Voir les court-circuits',
      shortcutsTitle: 'Court-Circuits Clavier',
      exportCSV: 'Exporter en CSV',
      keys: {
        tab: 'Tab',
        tabAction: `Active l'entrée suivante`,
        shift: 'Shift + Tab',
        shiftAction: `Active l'entrée précédente`,
        ctrl: 'Touche Ctrl enfoncée',
        ctrlAction: 'Enchaîne dans la même entrée',
        enter: 'Entrée',
        enterAction: 'Charge le document suivant',
      },
    },
  },
}

export default {
  locale: 'fr-FR',
  localeAntd,
  messages,
}
