const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
    const retrieveQuery = `SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`;

    db.all(retrieveQuery, (error, timesheets) => {
        if (error) {
            next(error);
        } else if (!timesheets) {
            return res.sendStatus(404);
        } else {
            res.status(200).json({ timesheets: timesheets });
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const createQuery = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
    const createValues = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };

    db.run(createQuery, createValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Timesheet WHERE id = ${this.lastID}`;

            db.get(retrieveQuery, (error, timesheet) => {
                if (error) {
                    next(error)
                } else {
                    res.status(201).json({ timesheet: timesheet });
                }
            });
        }
    });
});

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const retrieveQuery = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
    const retrieveValues = {
        $timesheetId: timesheetId
    };

    db.get(retrieveQuery, retrieveValues, (error, timesheet) => {
        if (error) {
            next(error);
        } else if (!timesheet) {
            res.sendStatus(404);
        } else {
            req.timesheet = timesheet;
            next();
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date;
    
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const updateQuery = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId';
    const updateValues = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId,
        $timesheetId: req.params.timesheetId
    };

    db.run(updateQuery, updateValues, function(error) {
        if (error) {
            next(error);
        } else {
            const retrieveQuery = `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`;
            
            db.get(retrieveQuery, (error, timesheet) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({ timesheet: timesheet });
                }
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const deleteQuery = `DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`;

    db.run(deleteQuery, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;