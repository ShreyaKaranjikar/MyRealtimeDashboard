const processCSVFile = async (filePath) => {
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Transform taxi data
          const transformedData = {
            pickup_datetime: new Date(data.tpep_pickup_datetime),
            dropoff_datetime: new Date(data.tpep_dropoff_datetime),
            passenger_count: parseInt(data.passenger_count),
            trip_distance: parseFloat(data.trip_distance),
            total_amount: parseFloat(data.total_amount),
          };
          results.push(transformedData);
        })
        .on('end', () => {
          // Store in database and broadcast update
          storeAndBroadcast(results);
          resolve(results);
        })
        .on('error', reject);
    });
  };
  
  const storeAndBroadcast = async (data) => {
    try {
      // Store in database (using your existing db connection)
      await db.taxi_trips.insertMany(data);
      
      // Calculate metrics
      const metrics = await calculateMetrics();
      
      // Broadcast to all connected clients
      broadcastData(metrics);
    } catch (error) {
      console.error('Error storing and broadcasting data:', error);
    }
  };
  
  const calculateMetrics = async () => {
    // Get the last hour's data
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    
    const metrics = await db.taxi_trips.aggregate([
      {
        $match: {
          pickup_datetime: { $gte: lastHour }
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalRevenue: { $sum: '$total_amount' },
          avgDistance: { $avg: '$trip_distance' },
          totalPassengers: { $sum: '$passenger_count' }
        }
      }
    ]);
    
    return metrics[0] || {
      totalTrips: 0,
      totalRevenue: 0,
      avgDistance: 0,
      totalPassengers: 0
    };
  };
  
  module.exports = {
    initializeWebSocket,
    processCSVFile,
    calculateMetrics
  };