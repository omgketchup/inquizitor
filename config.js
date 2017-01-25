var config = {}

// environmentals
config.environment = process.env.DEVELOPMENT_ENVIRONMENT;

if(config.environment == 'local') {
    config.sslSocketPort = 8080;

    config.sslKeyPath = './certs/privatekey.pem';
    config.sslCaPath = './certs/csr.pem';
    config.sslCertPath = './certs/csr.pem';
} else {
    config.sslSocketPort = 8080;

    config.sslKeyPath = './certs/privatekey.pem';
    config.sslCaPath = './certs/csr.pem';
    config.sslCertPath = './certs/csr.pem';
}

module.exports = config;