module.exports = (grunt) => {
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
                        name:  'Patch:  (Backwards-compatible bug fixes.)'
                      },
                      {
                        value: 'minor',
                        name:  'Minor:  (Add functionality in a backwards-compatible manner.)'
                      },
                      {
                        value: 'major',
                        name:  'Major: '  + ' (Incompatible API changes.)' // + '<%= pkg.version %>' 
                      }
                    ]
                  }
                ],
                then: (results) => {                
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
                    message: '<%= cnf.commitMessage %>',
                    noVerify: true,
                    noStatus: false
                },
                files: {
                    src: ['package.json']
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
                    remote: '<%= cnf.remote %>',
                    branch: '<%= cnf.branchName %>',
                    upstream: '<%= cnf.upstream %>'
                }
            }
        },
        gitcheckout: {
            task: {
                options: {
                    branch: '<%= cnf.branchName %>',
                    create: '<%= cnf.createBranch %>'
                }
            }
        },
        cnf: {}
    });

    grunt.registerTask('new-release', [ 
        'prompt:bump',
        'incress-version-number',
        'new-release-branch', 
        'write-package',
        'jsonlint',
        'push-bumped-version'
    ]);

    grunt.registerTask('new-release-branch', () => {
        grunt.config.set('cnf.branchName', `release/${grunt.config('pkg.version')}`);
        grunt.config.set('cnf.createBranch', true);
        grunt.task.run('gitcheckout');  
    });

    grunt.registerTask('push-bumped-version', () => {
        grunt.config.set('cnf.commitMessage', `Bumped version to: release/${grunt.config('pkg.version')}`);
        grunt.config.set('cnf.upstream', true);
        grunt.config.set('cnf.remote', 'origin');
        grunt.task.run('gitadd');
        grunt.task.run('gitcommit');        
        grunt.task.run('gitpush');
    });

    grunt.registerTask('write-package', () => {
        let packageJSON = grunt.config('pkg');
        grunt.file.write('package.json', JSON.stringify(packageJSON));
    });

    grunt.registerTask('incress-version-number', () => {
        if(grunt.file.isFile('package.json')){
            let packageJSON = grunt.config('pkg');
            handleVersionBump(grunt, packageJSON);
            grunt.config.set('pkg.version', packageJSON.version);
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

function handleVersionBump(grunt, packageJSON){
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
}
