const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/database');

class CSVProcessor {
    constructor() {
        this.batchSize = 1000; // Process 1000 records at a time
        this.records = [];
    }

    async processFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    this.records.push(this.transformData(data));
                    
                    if (this.records.length >= this.batchSize) {
                        this.insertBatch();
                    }
                })
                .on('end', async () => {
                    if (this.records.length > 0) {
                        await this.insertBatch();
                    }
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    transformData(data) {
        // Transform CSV data to match database schema
        return {
            pickup_datetime: new Date(data.pickup_datetime),
            dropoff_datetime: new Date(data.dropoff_datetime),
            passenger_count: parseInt(data.passenger_count),
            trip_distance: parseFloat(data.trip_distance),
            fare_amount: parseFloat(data.fare_amount),
            tip_amount: parseFloat(data.tip_amount),
            total_amount: parseFloat(data.total_amount)
        };
    }

    async insertBatch() {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const queryText = `
                INSERT INTO taxi_trips 
                (pickup_datetime, dropoff_datetime, passenger_count, 
                 trip_distance, fare_amount, tip_amount, total_amount)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`;

            for (const record of this.records) {
                await client.query(queryText, [
                    record.pickup_datetime,
                    record.dropoff_datetime,
                    record.passenger_count,
                    record.trip_distance,
                    record.fare_amount,
                    record.tip_amount,
                    record.total_amount
                ]);
            }

            await client.query('COMMIT');
            this.records = []; // Clear processed records
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new CSVProcessor();