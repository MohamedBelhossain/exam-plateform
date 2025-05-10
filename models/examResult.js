const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  geolocation: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON format: type 'Point' for geolocation
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for geolocation (to support geospatial queries)
examResultSchema.index({ geolocation: '2dsphere' });

module.exports = mongoose.model('ExamResult', examResultSchema);
