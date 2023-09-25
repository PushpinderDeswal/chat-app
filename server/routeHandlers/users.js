const express = require('express');
const Users = require('../models/Users');

const router = express.Router();

router.post('/api/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    console.log(fullName, email, password);

    if (!fullName || !email || !password) {
      res.status(400).send('Please fill all required fields');
    } else {
      const isAlreadyExist = await Users.findOne({ email });
      if (isAlreadyExist) {
        res.status(400).send('User already exists');
      } else {
        const newUser = new Users({ fullName, email });
        bcryptjs.hash(password, 10, (err, hashedPassword) => {
          newUser.set('password', hashedPassword);
          newUser.save();
          next();
        });
        return res.status(200).send('User registered successfully');
      }
    }
  } catch (error) {
    console.log(error, 'Error');
  }
});

router.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send('Please fill all required fields');
    } else {
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(400).send('User email or password is incorrect');
      } else {
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
          res.status(400).send('User email or password is incorrect');
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY =
            process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 84600 },
            async (err, token) => {
              await Users.updateOne(
                { _id: user._id },
                {
                  $set: { token },
                }
              );
              user.save();
              return res.status(200).json({
                user: {
                  id: user._id,
                  email: user.email,
                  fullName: user.fullName,
                },
                token: token,
              });
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error, 'Error');
  }
});

router.get('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await Users.find({ _id: { $ne: userId } });
    const usersData = Promise.all(
      users.map(async (user) => {
        return {
          user: {
            email: user.email,
            fullName: user.fullName,
            receiverId: user._id,
          },
        };
      })
    );
    res.status(200).json(await usersData);
  } catch (error) {
    console.log('Error', error);
  }
});

module.exports = router;
