/* eslint-disable no-undef */
const expect = require('chai').expect
const supertest = require('supertest')
const { config } = require('../helpers/utils');

const api = supertest(`${config.host}`)

describe('User Test', () => {
  let user_id = ''
  let user_jwt = ''
  let user_rec_token = ''
  let user_address = ''
  let user_wallet = ''
  const user_email = 'johndoe@gmail.com'
  const user_pass = 'John'
  let user2_id = ''
  let user2_jwt = ''
  let user2_wallet = ''

  it('Should signin a user', (done) => {
    api
      .post('users/login')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
        password: user_pass
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
        user_address = res.body.data.address;
        user_jwt = res.body.data.token;
        user_wallet = res.body.data.wallet;
        user_id = res.body.data._id;
        done()
      })
  }).timeout(20000)

  it('Should signin a second user', (done) => {
    const mail = 'johndoe2@gmail.com'
    const pass = 'John'
    api
      .post('users/login')
      .set('Accept', 'application/json')
      .send({
        email: mail,
        password: pass
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(mail)
        expect(res.body.data.password).to.not.equal(pass)
        user2_jwt = res.body.data.token;
        user2_wallet = res.body.data.wallet;
        user2_id = res.body.data._id;
        done()
      })
  }).timeout(20000)

  it('Should send a forgot password token', (done) => {
    api
      .post('users/send-token')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        user_rec_token = res.body.data
        done()
      })
  }).timeout(10000)

  it('Should reset a user password', (done) => {
    const password = 'John'
    api
      .patch('users/reset-pass')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
        password,
        token: user_rec_token
      })
      .expect(200)
      .end((err, res) => {
        user_jwt = res.body.data.token
        expect(res.body.status).to.equal('success')
        expect(res.body.data.password).to.not.equal(password)
        done()
      })
  }).timeout(10000)

  it('Should change a user password', (done) => {
    const password = 'John'
    api
      .patch('users/change-pass')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send({
        password,
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        done()
      })
  }).timeout(10000)

  it('Should get user balance', (done) => {
    api
      .get('users/balance')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        done()
      })
  }).timeout(10000)

  it('Should get user bank', (done) => {
    api
      .get('users/bank')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        done()
      })
  }).timeout(10000)

  it('Should update a user', (done) => {
    api
      .patch('users/')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send({
        fname: 'John',
        mname: 'Mrs',
        lname: 'Doe',
        phone: '2348763526680',
        sex: 'Male',
        dob: '15-03-1990',
        state: 'Lagos',
        city: 'Lagos',
        country: 'Nigeria',
        beneficiary: 'Mrs Jane Doe'
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
        // expect(res.body.data.fname).to.equal(fname)
        // expect(res.body.data.mname).to.equal(mname)
        // expect(res.body.data.lname).to.equal(lname)
        // expect(res.body.data.sex).to.equal(sex)
        // expect(res.body.data.dob).to.equal(dob)
        // expect(res.body.data.state).to.equal(state)
        // expect(res.body.data.city).to.equal(city)
        // expect(res.body.data.country).to.equal(country)
        // expect(res.body.data.beneficiary).to.equal(beneficiary)
        done()
      })
  }).timeout(10000)

  it('Buy a token', (done) => {
    const amount = 74
    const price = 200
    api
      .post('users/exchange/buy')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send({
        price,
        amount
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Buy order is being processed')
        done()
      })
  }).timeout(10000)

  it('Sell a token', (done) => {
    const amount = 14
    const price = 200
    api
      .post('users/exchange/sell')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user2_jwt}`)
      .send({
        price,
        amount
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Sell order is being processed')
        done()
      })
  }).timeout(10000)

  it('Get order buy book', (done) => {
    api
      .get('users/exchange/buybook')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Buy order book gotten successfully')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Get order sell book', (done) => {
    api
      .get('users/exchange/sellbook')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Sell order book gotten successfully')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Get user transactions', (done) => {
    api
      .get('users/transactions')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User transactions gotten successfully')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Get token price', (done) => {
    api
      .get('users/exchange/price')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Token price gotten successfully')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.price).to.equal(200)
        expect(res.body.high).to.equal(0)
        expect(res.body.open).to.equal(0)
        expect(res.body.close).to.equal(0)
        expect(res.body.low).to.equal(0)
        expect(res.body.vol).to.equal(0)
        done()
      })
  }).timeout(10000)

  it('Get user trades', (done) => {
    api
      .get('users/exchange/trades')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User trades gotten successfully')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Get all trades', (done) => {
    api
      .get('users/exchange/trades/all')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('All trades gotten successfully')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)
})
