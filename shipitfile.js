function formate(n) {
  return n > 9 ? '' + n : '0' + n
}
var d = new Date()
var releaseId = 'release' + d.getFullYear() + formate(d.getMonth() + 1) + formate(d.getDate()) + '-' + formate(d.getHours()) + formate(d.getMinutes())

module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: './dist',
      deployTo: '/www/releases',
      repositoryUrl: 'https://github.com/tbouchik/mappin-vue.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 5,
      deleteOnRollback: true,
      key: '~/.ssh/id_rsa',
      shallowClone: true,
    },
    production: {
      servers: 'root@165.227.228.172',
      build: 'yarn run build',
    },
  })
  shipit.task('default', function () {
    return shipit.local(shipit.config.build)
  })

  shipit.task('sync', ['default'], function () {
    shipit.log('Build:Finished')
    return shipit.local('rsync -azP ' + shipit.config.workspace + ' ' + shipit.config.servers + ':' + shipit.config.deployTo + '/' + releaseId)
  })

  shipit.task('deleteSymlink', ['sync'], function functionName() {
    return shipit.remote('rm -rf /www/curent')
  })

  shipit.task('symlink', ['deleteSymlink'], function functionName() {
    return shipit.remote('ln -s ' + shipit.config.deployTo + '/' + releaseId + '/dist /www/curent')
  })
  shipit.start('default', 'sync', 'deleteSymlink', 'symlink')
}
// npm run build-prod
