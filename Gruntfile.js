module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
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
        semver: {
            options: {
              // Task-specific options go here.
              space: "\t"
            },
            your_target: {
              // Target-specific file lists and/or options go here.
              files: [{
                  src: "package.json",
                  dest: "package.json.out"
              }, { 
                  src: "bower.json",
                  dest: "bower.json.out"
              }]
            },
        },
        prompt: {
            bump: {
              options: {
                questions: [
                  {
                    config:  'increment',
                    type:    'list',
                    message: 'Bump version from ', //+ '<%= pkg.version %>' + ' to:',
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
                        name:  'Major:  ' // + semver.inc(currentVersion, 'major') + ' Incompatible API changes.'
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
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        },
    });

    grunt.loadNpmTasks('grunt-semver');
    grunt.loadNpmTasks('grunt-prompt');

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
