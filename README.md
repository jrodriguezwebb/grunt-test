# grunt-test

Requierements:
Must have installed: 

- Git
- Node & npm  
- GruntJS 

To install GruntJS: 
npm install -g grunt-cli

To start a new release: 
--------------
grunt new-release

will prompt a selector for bump the version (readed from package.json) to: Minor, Major or Patch,
create the branch and do a checkout on it. Also updates package.json and config.xml files


To finish a release: 
-------------
grunt finish-release

Note: This must be done from the release branch and without anything to push(all commited)
This, finishes the version, merges it with develop and master. 
