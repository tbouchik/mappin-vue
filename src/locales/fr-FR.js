import localeAntd from 'ant-design-vue/lib/locale-provider/fr_FR'

const messages = {
  topBar: {
    issuesHistory: 'Histoire des problèmes',
    typeToSearch: 'Chercher...',
    actions: 'Actes',
    status: 'Statut',
    profileMenu: {
      hello: 'Bonjour',
      billingPlan: 'Plan de facturation',
      role: 'Rôle',
      email: 'Email',
      phone: 'Téléphone',
      editProfile: 'Editer le profil',
      logout: 'Connectez - Out',
    },
  },
}

export default {
  locale: 'fr-FR',
  localeAntd,
  messages,
}
