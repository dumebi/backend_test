/* eslint-disable no-undef */
const mongoose = require('mongoose');
const expect = require('chai').expect
const supertest = require('supertest')
const { config } = require('../helpers/utils');
const WalletModel = require('../models/wallet');

const User = require('../models/user');
const EthAccount = require('../libraries/ethUser.js');
const secure = require('../helpers/encryption.js');
const UserModel = require('../models/user');

const api = supertest(`${config.host}`)
console.log(`${config.host}`)

describe('Admin Test', () => {
  let user_id = ''
  let user2_id = ''
  let admin_id = ''
  let admin_jwt = ''
  const token = ''

  before(async () => {
    console.log(config.mongo);
    // this.timeout(13000); // A very long environment setup.
    // await setTimeout(done, 20000);
    await mongoose.connect(config.mongo, { useNewUrlParser: true });
    await mongoose.connection.db.dropDatabase();
    await dbSeeder();
  })
  it('Should create a user', (done) => {
    const fname = 'John'
    const lname = 'Doe'
    const email = 'johndoe@gmail.com'
    const phone = '2348184364720'
    const sex = 'Male'
    const dob = '15-01-1992'
    const password = 'John'
    const vesting = true
    const type = 'User'
    const employment = 'Employed'
    const group = 'Senior Executive'
    const staffId = `${Math.floor(Math.random() * 1000000)}`
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .send({
        fname,
        lname,
        email,
        phone,
        sex,
        dob,
        password,
        vesting,
        type,
        employment,
        group,
        staffId
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.vesting).to.equal(vesting)
        expect(res.body.data.type).to.equal(type)
        expect(res.body.data.employment).to.equal(employment)
        expect(res.body.data.group).to.equal(group)
        expect(res.body.data.staffId).to.equal(staffId)
        expect(res.body.data.password).to.not.equal(password)
        user_id = res.body.data._id
        done()
      })
  }).timeout(30000)

  it('Should create another user', (done) => {
    const fname = 'John2'
    const lname = 'Doe2'
    const email = 'johndoe2@gmail.com'
    const phone = '2348184364721'
    const sex = 'Male'
    const dob = '15-01-1992'
    const password = 'John'
    const vesting = true
    const type = 'User'
    const employment = 'Employed'
    const group = 'Senior Executive'
    const staffId = `${Math.floor(Math.random() * 1000000)}`
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .send({
        fname,
        lname,
        email,
        phone,
        sex,
        dob,
        password,
        vesting,
        type,
        employment,
        group,
        staffId
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.vesting).to.equal(vesting)
        expect(res.body.data.type).to.equal(type)
        expect(res.body.data.employment).to.equal(employment)
        expect(res.body.data.group).to.equal(group)
        expect(res.body.data.staffId).to.equal(staffId)
        expect(res.body.data.password).to.not.equal(password)
        user2_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a admin', (done) => {
    const fname = 'Admin'
    const lname = 'Admin'
    const email = 'testadmin@gmail.com'
    const phone = '2348184364720'
    const sex = 'Male'
    const dob = '15-01-1992'
    const password = 'John'
    const vesting = true
    const type = 'Admin'
    const employment = 'Employed'
    const group = 'Executive Trainee'
    const staffId = `${Math.floor(Math.random() * 1000000)}`
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .send({
        fname,
        lname,
        email,
        phone,
        sex,
        dob,
        password,
        vesting,
        type,
        employment,
        group,
        staffId
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.vesting).to.equal(vesting)
        expect(res.body.data.type).to.equal(type)
        expect(res.body.data.employment).to.equal(employment)
        expect(res.body.data.group).to.equal(group)
        expect(res.body.data.staffId).to.equal(staffId)
        expect(res.body.data.password).to.not.equal(password)
        admin_jwt = res.body.data.token;
        user_address = res.body.data.address;
        user_wallet = res.body.data.wallet;
        admin_id = res.body.data._id;
        done()
      })
  }).timeout(10000)

  it('Should deactivate a user', (done) => {
    api
      .patch(`users/deactivate/${admin_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User deactivated')
        done()
      })
  }).timeout(10000)

  it('Should activate a admin', (done) => {
    api
      .patch(`users/activate/${admin_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User activated')
        done()
      })
  }).timeout(10000)

  it('Should activate a user', (done) => {
    api
      .patch(`users/activate/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User activated')
        done()
      })
  }).timeout(10000)

  it('Should activate a user', (done) => {
    api
      .patch(`users/activate/${user2_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User activated')
        done()
      })
  }).timeout(10000)

  it('Should signin an admin ', (done) => {
    api
      .post('users/login')
      .set('Accept', 'application/json')
      .send({
        email: 'testadmin@gmail.com',
        password: 'John'
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        done()
      })
  }).timeout(10000)

  it('Should get a user', (done) => {
    api
      .get(`users/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        done()
      })
  }).timeout(10000)

  it('Should get all users', (done) => {
    api
      .get('users')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user types', (done) => {
    api
      .get('users/type')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user groups', (done) => {
    api
      .get('users/group')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user employment statuses', (done) => {
    api
      .get('users/employment-status')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should update a user group', (done) => {
    const group = 'Senior Executive'
    api
      .patch(`users/${user_id}/group`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        group
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.group).to.equal(group)
        done()
      })
  }).timeout(10000)

  it('Should update a user type', (done) => {
    const type = 'User'
    api
      .patch(`users/${user_id}/type`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        type
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.type).to.equal(type)
        done()
      })
  }).timeout(10000)

  it('Should update a user employment status', (done) => {
    const employment = 'Employed'
    api
      .patch(`users/${user_id}/employment-status`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        employment
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.employment).to.equal(employment)
        done()
      })
  }).timeout(10000)

  it('Set fee for everyone', async () => {
    await WalletModel.updateMany({}, { balance: 100000 });
  }).timeout(20000)

  it('Should initialize SIT token', (done) => {
    api
      .get('admin/token')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal('STTP')
        expect(res.body.data.min).to.equal(0)
        expect(res.body.data.max).to.equal(0)
        expect(res.body.data.high).to.equal(0)
        expect(res.body.data.low).to.equal(0)
        expect(res.body.data.vol).to.equal(0)
        expect(res.body.data.price).to.equal(0)
        done()
      })
  }).timeout(10000)

  it('Should update a price of token', (done) => {
    const price = 200
    const min = 100
    const max = 300
    api
      .patch('admin/token/')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        price,
        min,
        max
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Token price has been set successfully')
        done()
      })
  }).timeout(10000)
})

async function dbSeeder() {
  try {
    const userMnemonic = "priority camera link lucky cave rug federal shiver canoe elegant student illegal"
    const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
    const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)

    const user = new UserModel({
        fname: 'Oluwadara',
        mname: 'Ayotunde',
        lname: 'Olayebi',
        email: 'admin@gmail.com',
        phone: '09088994563',
        sex: 'Female',
        type: User.UserType.ADMIN,
        staffId: '004502',
        // houseAddress: 'Head Office, Marina',
        employment: User.EmploymentStatus.EMPLOYED,
        group: User.UserGroup.ET,
        beneficiary: 'Dara',
        activated: true,
        enabled: true,
        password: '12345678',
        vesting: false
      })

    const [mnemonic, privateKey, publicKey] = await Promise.all([secure.encrypt(userMnemonic), secure.encrypt(Ethkeys.childPrivKey), secure.encrypt(Ethkeys.childPubKey)])
    user.mnemonic = mnemonic
    user.privateKey = privateKey
    user.publicKey = publicKey
    user.address = Ethkeys.childAddress

    const _user = await user.save()
    // console.log('saved', _user)

    // const userSavePromise = users.map(user => {
    //   User.create(user)
    // })
    // const newUsers = await Promise.all(userSavePromise)
    // console.log(newUsers)

    // for (let i = 0; i < users.length; i++) {
    //   const saveUser = new User(users[i]);
    //   result = await saveUser.save()
    //   // console.log('result >>> ',result, '\n')
    // }
  } catch (error) {
    console.log('error >>> ', error)
  }
}
