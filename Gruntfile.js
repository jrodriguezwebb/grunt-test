module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsonlint: {
            all: {
                src: [ 'package.json' ],
                options: {
                    format: true,
                    indent: 2,
                    sortKeys: false
                }
            }
        },
        prompt: {
            bump: {
              options: {
                questions: [
                  {
                    config:  'increment',
                    type:    'list',
                    message: 'Bump version from ' + '<%= pkg.version %>' + ' to:',
                    choices: [
                      {
                        value: 'patch',
                        name:  'Patch:  '  // + semver.inc(currentVersion, 'patch') + ' Backwards-compatible bug fixes.'
                      },
                      {
                        value: 'minor',
                        name:  'Minor:  ' // + semver.inc(currentVersion, 'minor') + ' Add functionality in a backwards-compatible manner.'
                      },
                      {
                        value: 'major',
                        name:  'Major:  ' // + '<%= pkg.version %>' // + incressMajor(this.pkg.version) + ' Incompatible API changes.'
                      }
                    ]
                  }
                ],
                then: function(results){                
                    grunt.config.set('bump.increment', [results.increment]);                      
                }
              }
            }
        },
        gitadd: {
            task: {
              options: {
                force: true
              },
              files: {
                src: ['package.json']
              }
            }
        },
        gitcommit: {
            task: {
                options: {
                    message: 'Testing from grunt',
                    noVerify: true,
                    noStatus: false
                },
                files: {
                    src: ['test.txt']
                }
            }
        },
        gittag: {
            addtag: {
                options: {
                    tag: '0.0.1',
                    message: 'Testing'
                }
            },
            deletetag: {
                options: {
                    tag: '0.0.1',
                    remove: true
                }
            }
        },
        gitcheckout: {
            task: {
                options: {
                    branch: 'master',
                    create: true
                }
            }
        },
        gitpush: {
            task: {
                options: {
                    remote: 'origin',
                    branch: 'master',
                }
            }
        }
    });

    grunt.registerTask('new-release', [ 'prompt:bump', 'release' ]);

    grunt.registerTask('release', function() {
        if(grunt.file.isFile('package.json')){
            let packageJSON = grunt.file.readJSON('package.json');
            switch(grunt.config('increment')){
                case 'major':
                    packageJSON.version = incressMajor(packageJSON.version);
                break;
                case 'minor':
                    packageJSON.version = incressMinor(packageJSON.version);
                break;
                case 'patch':
                    packageJSON.version = incressPatch(packageJSON.version);
                break;
            }            
            grunt.log.writeln(packageJSON.version);
            grunt.file.write('package.json', JSON.stringify(packageJSON));
            grunt.task.run('jsonlint');
        }
    });
}

function incressMajor(semanticVersion){
    let newVersion = incressVersion(semanticVersion, 0);
    newVersion = setVersionValue(newVersion, 1, 0);
    return setVersionValue(newVersion, 2, 0);
}

function incressMinor(semanticVersion){
    let newVersion = incressVersion(semanticVersion, 1);
    return setVersionValue(newVersion, 2, 0);
}

function incressPatch(semanticVersion){
    return incressVersion(semanticVersion, 2);
}

function incressVersion(semanticVersion, level) {
    let arrVersion = semanticVersion.split('.');
    arrVersion[level] = parseInt(arrVersion[level])+1;
    return arrVersion.join('.');
}

function setVersionValue(semanticVersion, level, value) {
    let arrVersion = semanticVersion.split('.');
    arrVersion[level] = value;
    return arrVersion.join('.');
}
