const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req, res, next) => {
    const retrieveQuery = 'SELECT * FROM Employee WHERE is_current_employee = 1';

    db.all(retrieveQuery, (error, employees) => {
        if(error) {
            next(error);
        } else {
            res.status(200).json({ employees: employees });
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    const createQuery = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const createValues = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };

    db.run(createQuery, createValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Employee WHERE id = ${this.lastID}`;

            db.get(retrieveQuery, (error, employee) => {
                if (error) {
                    next(error)
                } else {
                    res.status(201).json({ employee: employee });
                }
            });
        }
    });
});

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const retrieveQuery = 'SELECT * FROM Employee WHERE id = $employeeId';
    const retrieveValues = {
        $employeeId: employeeId
    };

    db.get(retrieveQuery, retrieveValues, (error, employee) => {
        if (error) {
            next(error);
        } else if (!employee) {
            res.sendStatus(404);
        } else {
            req.employee = employee;
            next();
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          isCurrentEmployee = req.body.isCurrentEmployee === 0 ? 0 : 1;
    
    if (!name || !position || !wage || !isCurrentEmployee) {
        return res.sendStatus(400);
    }

    const updateQuery = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId';
    const updateValues = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    db.run(updateQuery, updateValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`;
            
            db.get(retrieveQuery, (error, employee) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({ employee: employee });
                }
            });
        }
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const updateQuery = `UPDATE Employee SET is_current_employee = 0 WHERE ${req.params.employeeId}`;

    db.run(updateQuery, (error) => {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`;

            db.get(retrieveQuery, (error, employee) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({ employee: employee });
                }
            });
        }
    });
});

const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeesRouter;