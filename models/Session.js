const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a session title']
    },
    abstract: {
        type: String,
        required: [true, 'Please add an abstract'],
        maxlength: [200, 'Abstract can not be more than 200 characters']        
    },    
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']        
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },    
    tuition: {
        type: Number,
        required: [true, 'Please add tuition cost']
    },  
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    }, 
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

// Static method to get avg of session tuitions
SessionSchema.statics.getAverageCost = async function (eventId) {
    const obj = await this.aggregate([
        {
            $match: { event: eventId }
        },
        {
            $group: {
                _id: '$event',
                averageCost: { $avg: '$tuition' }
            }
        }
       
    ]);

    try {
        await this.model('Event').findByIdAndUpdate(eventId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (err) {
        console.error(err);        
    }
};

// Call getAverageCost after save
SessionSchema.post('save', function () {
    this.constructor.getAverageCost(this.event);    
});

// Call getAverageCost before remove
SessionSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.event);      
});


module.exports = mongoose.model('Session', SessionSchema);