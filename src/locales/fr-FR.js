import localeAntd from 'ant-design-vue/lib/locale-provider/fr_FR'

const messages = {
  topBar: {
    issuesHistory: 'Histoire des problèmes',
    typeToSearch: 'Chercher...',
    actions: 'Actes',
    status: 'Statut',
    panesInvoice: 'Factures',
    panesStatement: 'Relevés Bancaires',
    profileMenu: {
      hello: 'Bonjour',
      company: 'Entreprise',
      billingPlan: 'Plan de facturation',
      role: 'Rôle',
      email: 'Email',
      phone: 'Téléphone',
      editProfile: 'Editer le profil',
      logout: 'Se déconnecter',
    },
  },
  dashboard: {
    document: {
      invoiceTitle: 'Factures',
      vendor: 'Fournisseur',
      bank: 'Banque',
      dateFrom: 'Date Début',
      dateTo: 'Date Fin',
      bankTitle: 'Relevés bancaires',
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
      modal: {
        askSingleDelete: 'Êtes-vous sûr de vouloir supprimer le document: ',
        singleDeleteLoading: 'Supression en cours... ',
        askBulkDelete: 'Êtes-vous sûr de vouloir supprimer les documents sélectionnés?\n Total sélectionné: ',
        irreversibleAction: 'Les effets de cette action sont irréversibles.',
        askBulkArchive: 'Êtes-vous sûr de vouloir archiver les documents sélectionnés?\n Total sélectionné: ',
        askBulkDearchive: 'Êtes-vous sûr de vouloir désarchiver les documents sélectionnés?\n Total sélectionné: ',
        archiveLoading: 'Archivage en cours...',
        askBulkValidate: 'Êtes-vous sûr de vouloir valider les documents sélectionnés?\n Total sélectionné: ',
        validateLoading: 'Validation en cours... ',
        deleteSingleTitle: 'Supprimer le Document',
        deleteBulkTitle: 'Supprimer les Documents',
        archiveBulk: 'Archiver les documents',
        validateBulk: 'Valider les documents',
      },
    },
  },
  subbar: {
    return: 'Retour',
    select: 'Sélectionner',
    previous: 'Précédent',
    next: 'Suivant',
    shortcutsView: 'Voir les court-circuits',
    shortcutsTitle: 'Court-Circuits Clavier',
    exportCSV: 'Exporter en CSV',
    splitH: 'Diviser l\'écran horizontalement',
    splitV: 'Diviser l\'écran verticalement',
    validate: 'Valider',
    invalidate: 'Invalider',
    archive: 'Archiver',
    unarchive: 'Désarchiver',
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
  windows: {
    downloadImg: `Télécharger l'image`,
    downloadPdf: 'Télécharger le PDF',
    of: 'sur',
  },
  upload: {
    title: 'Uploader les documents',
    credits: 'Statut du Crédit Mensuel',
    searchClient: 'Entrez le nom du client',
  },
  template: {
    addButton: 'Nouveau Template',
    addTitle: 'Nouveau Template',
    view: 'Consulter le template',
    delete: 'Supprimer le template',
    constructCopy: 'Créer une copie',
    copy: 'Copie',
    typeSelect: 'Sélectionner le type: Achat ou Vente',
    addField: 'Nouvelle entrée',
    submit: 'Envoyer',
    actions: 'Actions',
    insertLine: 'Insérer une ligne',
    insertBelow: 'Insérer une ligne en dessous',
    insertAbove: 'Insérer une ligne au dessus',
    deleteAction: 'Supprimer',
  },
  accounting: {
    expense: 'Achat',
    sale: 'Vente',
  },
  client: {
    dashboardTitle: 'Vos clients',
    add: 'Nouveau Client',
    cancel: 'Annuler',
    searchClient: `Entrer le nom du client`,
    fullName: 'Nom complet',
    ref: 'Référence',
    clientref: 'Référence Client',
    email: 'Adresse Email',
    company: 'Nom Entreprise',
    number: 'Numéro de Téléphone',
  },
  util: {
    submit: 'Envoyer',
    view: 'Consulter',
    remove: 'Supprimer',
  },
}

export default {
  locale: 'fr-FR',
  localeAntd,
  messages,
}
