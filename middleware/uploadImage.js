const multiparty = require('connect-multiparty');

const md_upload = multiparty({
    uploadDir: 'uploads/users',
    maxFilesSize: 2 * 1024
});
const md_upload_publications = multiparty({
    uploadDir: 'uploads/publications',
    maxFilesSize: 2 * 1024
});

module.exports = {
    md_upload,
    md_upload_publications
};