const multiparty = require('connect-multiparty');

const md_upload = multiparty({ uploadDir: 'uploads/users' });
const md_upload_publications = multiparty({ uploadDir: 'uploads/publications' });

module.exports = {
    md_upload,
    md_upload_publications
};