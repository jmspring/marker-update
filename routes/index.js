var express = require('express');
var router = express.Router();
var hookproc = require('../hook_processor');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Nothing here.');
});

/* webhook */
router.post('/hook/:app', function(req, res, next) {
    if((req.params.app != 'fetch') && (req.params.app != 'mapper')) {
        res.status(400);
        res.send('Nothing here.');
    } else {
        hookproc.handle(req.params.app, function(info) {
            if(info == null) {
                res.status(503);
                res.send('Something went haywire.');
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(info));
            }
        });
    }
});

module.exports = router;
