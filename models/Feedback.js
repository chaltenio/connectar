const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the feedback'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },   
    createdAt: {
        type: Date,
        default: Date.now
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    } 
});

// Prevent user from submitting more than one review per bootcamp
FeedbackSchema.index({ event: 1, user: 1}, { unique: true });

// Static method to get avg rating and save
FeedbackSchema.statics.getAverageRating = async function (eventId) {
    const obj = await this.aggregate([
        {
            $match: { event: eventId }
        },
        {
            $group: {
                _id: '$event',
                averageRating: { $avg: '$rating' }
            }
        }
       
    ]);

    try {
        await this.model('Event').findByIdAndUpdate(eventId, {
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.error(err);        
    }
};

// Call getAverageCost after save
FeedbackSchema.post('save', function () {
    this.constructor.getAverageRating(this.event);    
});

// Call getAverageCost before remove
FeedbackSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.event);        
});


module.exports = mongoose.model('Feedback', FeedbackSchema);