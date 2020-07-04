const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/', (req, res, next) => {
    const retrieveQuery = 'SELECT * FROM Menu';

    db.all(retrieveQuery, (error, menus) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ menus: menus });
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const createQuery = `INSERT INTO Menu (title) VALUES ($title)`;
    const createValues = {
        $title: title
    };

    db.run(createQuery, createValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Menu WHERE id = ${this.lastID}`;

            db.get(retrieveQuery, (error, menu) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({ menu: menu });
                }
            })
        }
    });
});

menusRouter.param('menuId', (req, res, next, menuId) => {
    const retrieveQuery = 'SELECT * FROM Menu WHERE id = $menuId';
    const retrieveValues = {
        $menuId: menuId
    };

    db.get(retrieveQuery, retrieveValues, (error, menu) => {
        if (error) {
            next(error);
        } else if (!menu) {
            res.sendStatus(404);
        } else {
            req.menu = menu;
            next();
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const updateQuery = 'UPDATE Menu SET title = $title WHERE id = $menuId';
    const updateValues = {
        $title: title,
        $menuId: req.params.menuId
    };

    db.run(updateQuery, updateValues, (error) => {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Menu WHERE id = ${req.params.menuId}`;

            db.get(retrieveQuery, (error, menu) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({ menu: menu });
                }
            });
        }
    });
});

const menuItemsRouter = require('./menu-items');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.delete('/:menuId', (req, res, next) => {
    const retrieveQuery = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`;

    db.get(retrieveQuery, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (menuItem) {
            return res.sendStatus(400);
        } else {
            const deleteQuery = `DELETE FROM Menu WHERE id = ${req.params.menuId}`;

            db.run(deleteQuery, (error) => {
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;