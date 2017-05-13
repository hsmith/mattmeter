//
//
//

var Datastore = require( 'nedb' )
  , Path = require( 'path' )
  , Promise = require( 'bluebird' )
  , bodyParser = require( 'body-parser' )

var Application = function( rootDir ) {
    var self = this;
    self.express = require( 'express' )();
    self.dirs = {
        root: rootDir
    };
}

//
// #############################################################################
//

Application.prototype.start = function( http_port ) {
    var self = this;
    self.db = {
        users: new Datastore({ filename: Path.join( self.dirs.root, 'data', 'users.db'), autoload: true})
    };

    self.express.use( bodyParser.json() );
    self.express.use( bodyParser.urlencoded({extended: true}));
    self.express.get( '/:user', function( req, res ) {
        userid = req.params.user;
        console.log( 'getting score for user: ', userid );
        self.db.users.findOne( { name: userid }, function( err, user ) {
            if( err || user == null ) return res.send( { err: 'Could not find user: ' + userid } );
            return res.send( user.score );
        });
    });

    self.express.post( '/:user/:val', function( req, res ) {
        userid = req.params.user;
        score = req.params.val;
        self.db.users.findOne( { name: userid }, function( err, user ) {
            if( err || user == null ) {
                self.db.users.insert( { name: userid, score: score }, function( err, doc ) {
                    if( err ) return res.send( { err: 'Couldn\'t create user' } );
                    return res.send( doc.score );
                });
            }
            else {
                console.log( 'updating score for user ', user );
                user.score = score;
                self.db.users.update( { _id: user._id }, user, function( err, doc ) {
                    if( err  ) {
                        console.log( err, doc );
                        return res.send( { err: 'Couldn\'t save user' } );
                    }
                    console.log( doc );
                    return res.send( user.score );
                });
            }
        });
    });

    self.server = self.express.listen( http_port, function() {
        console.log( 'HTTP SERVER listening on port %s', http_port );
    });
}

//
// #############################################################################
//

module.exports = function( rootDir ) {
    return new Application( rootDir );
}
