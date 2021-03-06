/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');

module.exports = {
    'new': function(req, res) {
        res.view('session/new');
    },
    create: function(req, res, next) {
        if (!req.param('name') || !req.param('password')) {
            req.session.flash = {
                err: {
                    error: "noUsernameAndPassword",
                    summary: "You must enter both a username and password."
                }
            };
            return res.redirect('/session/new');
        }
        Person.findOneByName(req.param('name')).exec(function(err, person) {
            if (err) {
                return next(err);
            }
            if (!person) {
                req.session.flash = {
                    err: {
                        error: "noPerson",
                        summary: "Could not find matching person or password missmatched."
                    }
                };
                return res.redirect('/session/new');
            }
            bcrypt.compare(req.param('password'), person.password, function(err, valid) {
                if (err) {
                    return next(err);
                }
                if (!valid) {
                    req.session.flash = {
                        err: {
                            error: "passwordMissmatch",
                            summary: "Could not find matching person or password missmatched."
                        }
                    };
                    return res.redirect('/session/new');
                }
                req.session.authenticated = true;
                req.session.person = person;
                if (req.session.redirect) {
                    return res.redirect(req.session.redirect);
                }
                res.redirect('/');
            })
        });
    },
    destroy: function(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    }
};
