require('./config/config');

var { mongoose } = require('./db/mongoose');
var { app } = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});