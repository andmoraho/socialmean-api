const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

var { ObjectID } = require('mongodb');

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [1, 'Name is shorter than the minimum allowed length']
  },
  surname: {
    type: String,
    required: true,
    minlength: [1, 'Surname is shorter than the minimum allowed length']
  },
  nick: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: [2, 'Nick is shorter than the minimum allowed length']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password is shorter than the minimum allowed length']
  },
  role: {
    type: String
  },
  image: {
    type: String
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        role: user.role,
        iat: moment().unix(),
        access
      },
      process.env.JWT_SECRET
    )
    .toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  var user = this;

  return user.updateOne({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

UserSchema.statics.findByToken = function(token) {
  var user = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '60m' });
  } catch (error) {
    return Promise.reject().then(function() {
      throw new Error();
    });
  }

  user.findOne(
    {
      _id: decoded._id
    },
    (error, result) => {
      if (error) {
        return Promise.reject().then(function() {
          throw new Error(error);
        });
      }

      return result;
    }
  );
};

UserSchema.statics.findByCredentials = async function(email, password) {
  var user = this;

  return user.findOne({ email }).then(userFind => {
    if (!userFind) {
      return Promise.reject().then(function() {
        throw new Error();
      });
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, userFind.password, (error, result) => {
        if (result) {
          resolve(userFind);
        } else {
          reject(new Error(error));
        }
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, null, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
