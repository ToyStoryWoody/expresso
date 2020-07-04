const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    const retrieveQuery = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`;

    db.all(retrieveQuery, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ menuItems: menuItems });
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
          description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory,
          price = req.body.menuItem.price;
    
    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    const createQuery = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
    const createValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(createQuery, createValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM MenuItem WHERE id = ${this.lastID}`;

            db.get(retrieveQuery, (error, menuItem) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({ menuItem: menuItem });
                }
            });
        }
    });
});

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const retrieveQuery = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
    const retrieveValues = {
        $menuItemId: menuItemId
    };

    db.get(retrieveQuery, retrieveValues, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (!menuItem) {
            res.sendStatus(404);
        } else {
            req.menuItem = menuItem;
            next();
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name,
          description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory,
          price = req.body.menuItem.price;

    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    const updateQuery = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId';
    const updateValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId,
        $menuItemId: req.params.menuItemId
    };

    db.run(updateQuery, updateValues, (error) => {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`;

            db.get(retrieveQuery, (error, menuItem) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({ menuItem: menuItem });
                }
            });
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const deleteQuery = `DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`;

    db.run(deleteQuery, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;