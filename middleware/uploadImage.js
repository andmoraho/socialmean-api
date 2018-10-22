const multiparty = require('connect-multiparty');

const md_upload = multiparty({ uploadDir: 'uploads/users' });

module.exports = { md_upload };