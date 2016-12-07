var pkg = require('../package.json');

var exec = require('child_process').exec;

var tag = 'carlosbaraza/' + pkg.name + ':latest';

console.log('Starting ' + pkg.name + ' deployment');

console.log('\nBuilding Docker image');
console.log('Running "docker build ."...');

exec('docker build .', function(error, stdout, stderr) {
  if (error) {
    console.log('Something went wrong: the image could not be build');
    throw error;
  }

  var imageId = stdout.match(/Successfully built (\w*)/i)[1];

  tagImage(imageId);
});

function tagImage(imageId) {
  console.log('\nTagging image ' + imageId);
  var cmd = 'docker tag ' + imageId + ' ' + tag;
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log('Something went wrong: the image could not be tagged');
      throw error;
    }

    pushImage(tag);
  });
}

function pushImage(tag) {
  console.log('\nPushing build image to repository');
  var cmd = 'docker push ' + tag;
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log('Something went wrong: the built image could not be pushed');
      throw error;
    }

    deployService(tag);
  });
}

function deployService(tag) {
  console.log('\nFiguring out if create or redeploy to Docker Cloud');
  var cmd = 'docker-cloud service ps';
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log(stderr);
      console.log(stdout);
      throw error;
    }
    var created = stdout.match(new RegExp(pkg.name));
    var terminated = stdout.match(new RegExp(pkg.name+'.*Terminated'));
    if (!created || terminated)
      createService(tag);
    else
      redeployService(tag);
  });
}

function createService(tag) {
  console.log('\nCreating Docker Cloud service');
  var cmd = 'docker-cloud service create --sync ' +
    ' -n ' + pkg.name +
    ' -p 80/tcp' +
    ' -e VIRTUAL_HOST=' + pkg.cloud.VIRTUAL_HOST +
    ' -e LETSENCRYPT_HOST=' + pkg.cloud.LETSENCRYPT_HOST +
    ' -e LETSENCRYPT_EMAIL=' + pkg.cloud.LETSENCRYPT_EMAIL +
    ' ' + tag;
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log('The service could not be created');
      console.log(stdout);
      console.log(stderr);
      throw error;
    }
    startService();
  });
}

function redeployService(tag) {
  console.log('\nRedeploying Docker Cloud service');
  var cmd = 'docker-cloud service redeploy --sync ' + pkg.name;
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) throw error;
    successfullyDeployed();
  });
}

function startService() {
  console.log('\nStarting Docker Cloud service');
  var cmd = 'docker-cloud service start --sync ' + pkg.name;
  console.log('Running "' + cmd + '"...');
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log(stderr);
      console.log(stdout);
      throw error;
    }
    successfullyDeployed();
  });
}

function successfullyDeployed() {
  console.log('\nThe service was successfully deployed at ' + pkg.homepage);
  console.log('\nNOTE: The configuration might take effect in some minutes');
  console.log(
    '\nNOTE2: You might need to restart the services "nginx-letsencrypt" ' +
    'and "nginx-proxy". \n\n' +
    'Example: docker-cloud service redeploy nginx-letsencrypt'
  );
}
